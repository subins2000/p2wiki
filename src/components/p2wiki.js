import axios from 'axios'
import P2PT from 'p2pt'

const WebTorrent = require('webtorrent')

export class P2Wiki {
  constructor (announceURLs) {
    this.proxyPeers = {}
    this.proxyPeersID = []
    this.curProxyPeerIndex = 0
    this.announceURLs = announceURLs

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

          console.log('Got request for article ' + msg.articleName)

          $this.makeArticleTorrent(msg.articleName).then((torrent) => {
            peer.respond(torrent.infoHash)
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
    this.p2pt.start()
  }

  startClient () {
    const $this = this
    this.p2pt.on('peerconnect', (peer) => {
      $this.p2pt.send(
        peer,
        'c'
      ).then(([peer, response]) => {
        if (response === 'p') {
          $this.proxyPeers[peer.id] = peer
          $this.proxyPeersID.push(peer.id)
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
      var files = []
      var fetched = {
        title: '',
        article: false,
        media: [],
        mediaCount: 0
      }
      articleName = encodeURIComponent(articleName)

      var ifCompletedMakeTorrent = () => {
        if (fetched.article && fetched.media.length === fetched.mediaCount) {
          console.log(files)
          $this.wt.seed(files, {
            announceList: [$this.announceURLs],
            name: fetched.title
          }, (torrent) => {
            console.log(torrent)
            resolve(torrent)
          })
        }
      }

      axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${articleName}&prop=text&formatversion=2&origin=*`).then(response => {
        var file = new window.File([response.data.parse.text], 'article.html', { type: 'text/html' })
        files.push(file)

        fetched.title = response.data.parse.title
        fetched.article = true

        ifCompletedMakeTorrent()
      }).catch((error) => {
        reject(error)
      })

      var addMedia = (title, scale, url) => {
        axios({
          method: 'get',
          url: url,
          responseType: 'blob'
        }).then(function (response) {
          var filename = title
          var file = new window.File([response.data], filename)

          files.push(file)

          fetched.media.push(filename)

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

          addMedia(item.title, item.srcset[0].scale, item.srcset[0].src)
          fetched.mediaCount++
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  requestArticle (articleName, callback, errorCallback) {
    this.p2pt.requestMorePeers()
    var peer = this.getAProxyPeer()

    if (!peer) {
      return false
    }

    const $this = this
    this.p2pt.send(peer, JSON.stringify({
      articleName: articleName
    })).then(([peer, response]) => {
      // response will be torrent infohash
      $this.wt.add(response, {
        announce: $this.announceURLs
      }, (torrent) => {
        console.log(torrent.files)

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
      })
    })
  }
}
