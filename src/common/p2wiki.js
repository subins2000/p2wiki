import axios from 'axios'
import { P2PT } from './p2pt'

const WebTorrent = require('webtorrent')
const parallel = require('run-parallel')
const debug = require('debug')('p2wiki')

/**
 * For client peers
 * How many peers should return the same infoHash to start downloading the torrent ?
 */
const TORRENT_OK_CONSENSUS_COUNT = 1

/**
 * For both client & proxy peers
 * How many minutes should an article torrent be kept seeding if nobody is downloading it
 */
const TORRENT_REMOVE_TIMEOUT = 2

export class P2Wiki {
  constructor (announceURLs) {
    this.announceURLs = announceURLs

    this.proxyPeers = {}
    this.proxyPeersID = []
    this.curProxyPeerIndex = 0

    this.seedingTorrents = {}

    this.wt = new WebTorrent()
    this.p2pt = new P2PT(announceURLs, 'p2wiki')
  }

  startProxy () {
    const $this = this

    this.p2pt.on('msg', (peer, msg) => {
      if (msg === 'c') {
        // Yes, I'm a proxy
        peer.respond('p').catch((err) => {
          console.error('Connection to client failed before handsahake. ' + err)
        })
      } else {
        try {
          msg = JSON.parse(msg)
          var articleName = encodeURIComponent(msg.articleName)

          console.log('Got request for article ' + articleName)

          $this.makeArticleTorrent(msg.articleName).then((torrent) => {
            peer.respond(torrent.infoHash)
          }).catch((error) => {
            console.log('Torrent creation failed : ' + error)

            // Torrent creation failed
            delete $this.seedingTorrents[articleName]
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
    this.p2pt.start()

    parallel([
      () => {
        setInterval(() => {
          var minutes = TORRENT_REMOVE_TIMEOUT * 60 * 1000
          var timeNow = new Date()
          var torrentInfo
          for (var key in $this.seedingTorrents) {
            torrentInfo = $this.seedingTorrents[key]
            if (torrentInfo.lastActive && timeNow - torrentInfo.lastActive > minutes) {
              torrentInfo.torrent.destroy()
            }
          }
        }, 10000)
      }
    ])
  }

  startClient () {
    const $this = this
    this.p2pt.on('peerconnect', (peer) => {
      $this.p2pt.send(
        peer,
        'c'
      ).then(([peer, response]) => {
        console.log(peer.id)
        if (response === 'p') {
          if ($this.proxyPeers[peer.id]) {
            peer.destroy()
          } else {
            $this.proxyPeers[peer.id] = peer
            $this.proxyPeersID.push(peer.id)
          }
        }
      })
    })

    this.p2pt.on('peerclose', (peerID) => {
      delete $this.proxyPeers[peerID]
      delete $this.proxyPeersID[this.proxyPeersID.indexOf(peerID)]
    })
    this.p2pt.start()
  }

  getAProxyPeer () {
    if (this.proxyPeersID.length === 0) { return false }

    if (this.curProxyPeerIndex > this.proxyPeersID.length - 1) { this.curProxyPeerIndex = 0 }

    return this.proxyPeers[this.proxyPeersID[this.curProxyPeerIndex]]
  }

  makeArticleTorrent (articleName) {
    const $this = this

    return new Promise((resolve, reject) => {
      articleName = encodeURIComponent(articleName)

      if ($this.seedingTorrents[articleName]) {
        if ($this.seedingTorrents[articleName].torrent) {
          resolve($this.seedingTorrents[articleName].torrent)
        }
        return
      }

      // Started making torrent
      $this.seedingTorrents[articleName] = {}

      var files = []
      var fetched = {
        title: '',
        article: false,
        media: [],
        mediaCount: 0
      }

      var ifCompletedMakeTorrent = () => {
        if (fetched.article && fetched.media.length === fetched.mediaCount) {
          $this.wt.seed(files, {
            announceList: [$this.announceURLs],
            name: fetched.title
          }, (torrent) => {
            $this.seedingTorrents[articleName] = {
              lastActive: new Date(),
              torrent: torrent
            }

            torrent.on('upload', () => {
              $this.seedingTorrents[articleName].lastActive = new Date()
            })

            debug(`Started seeding article '${articleName}' : ${torrent.infoHash}`)

            resolve(torrent)
          })
        }
      }

      axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${articleName}&prop=text&formatversion=2&origin=*`).then(response => {
        var file = new window.File([response.data.parse.text], 'article.html', { type: 'text/html' })
        files.push(file)

        fetched.title = response.data.parse.title
        fetched.article = true

        debug(`Article ${articleName} : Fetched text`)

        ifCompletedMakeTorrent()
      }).catch((error) => {
        reject(error)
      })

      var addMedia = (title, url) => {
        axios({
          method: 'get',
          url: url,
          responseType: 'blob'
        }).then(function (response) {
          var filename = title
          var file = new window.File([response.data], filename, { type: response.headers['content-type'] })

          const reader = new FileReader();
          reader.addEventListener("load", function () {
            // convert image file to base64 string
            var img = document.createElement('img')
            img.src = reader.result
            console.log(response)
            document.body.appendChild(img)
          }, false);
          reader.readAsDataURL(file);

          files.push(file)
          fetched.media.push(filename)

          debug(`Article ${articleName} : Fetched image ${fetched.media.length}/${fetched.mediaCount}`)

          ifCompletedMakeTorrent()
        }).catch(error => {
          reject(error)
        })
      }

      axios.get(`//en.wikipedia.org/api/rest_v1/page/media-list/${articleName}`).then(response => {
        var item
        for (var key in response.data.items) {
          item = response.data.items[key]

          // Skip non-images
          if (!item.srcset) {
            continue
          }

          addMedia(item.title, item.srcset[0].src)
          fetched.mediaCount++
        }

        debug(`Article ${articleName} : Fetched medialist. Has ${fetched.mediaCount} images`)
      }).catch(error => {
        reject(error)
      })
    })
  }

  requestArticle (articleName, callback, errorCallback) {
    this.p2pt.requestMorePeers()

    if (this.proxyPeers.length === 0) {
      return false
    }

    const $this = this

    var peer
    var responseInfoHashes = []

    for (var key in this.proxyPeers) {
      peer = this.proxyPeers[key]

      this.p2pt.send(peer, JSON.stringify({
        articleName: articleName
      })).then(([peer, response]) => {
        // response will be torrent infohash
        responseInfoHashes.push(response)
        var infoHash = $this.checkConsensus(responseInfoHashes)

        if (infoHash) {
          $this.downloadTorrent(infoHash, callback)
        }
      })
    }
  }

  checkConsensus (infoHashes) {
    var infoHashesFrequency = {}
    var infoHash

    for (var key in infoHashes) {
      infoHash = infoHashes[key]
      if (!infoHashesFrequency[infoHash]) {
        infoHashesFrequency[infoHash] = 0
      }
      infoHashesFrequency[infoHash]++

      if (infoHashesFrequency[infoHash] >= TORRENT_OK_CONSENSUS_COUNT) {
        return infoHash
      }
    }
    return false
  }

  downloadTorrent (infoHash, callback) {
    var onTorrent = (torrent) => {
      var article = {
        title: '',
        text: null,
        media: {}
      }

      torrent.files.forEach(file => {
        if (file.name === 'article.html') {
          article.title = torrent.name
          article.text = file
        } else {
          article.media[file.name] = file
        }
      })

      callback(article)
    }

    if (this.wt.get(infoHash)) {
      onTorrent(this.wt.get(infoHash))
    } else {
      this.wt.add(infoHash, {
        announce: this.announceURLs
      }, onTorrent)
    }
  }
}
