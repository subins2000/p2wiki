import axios from 'axios'

import P2PT from 'p2pt'

export class P2Wiki {
  constructor (announceURLs) {
    this.proxyPeers = {}
    this.proxyPeersID = []
    this.curProxyPeerIndex = 0

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

          $this.makeArticleTorrent(msg.articleName)
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
    var files = []

    articleName = encodeURIComponent(articleName)

    axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${articleName}&prop=text&formatversion=2&origin=*`).then(response => {
      var file = new File([response.data.parse.text], 'article.html', { type: 'text/html' })
      files.push(file)
    }).catch((err) => {
      console.log(err)
    })

    var addMedia = (title, scale, url) => {
      axios({
        method: 'get',
        url: url,
        responseType: 'blob'
      }).then(function (response) {
        console.log(response.data)
        // $@ to distinguish title & scale separately
        // Hoping titles won't have that combo
        var file = new File([response.data], title + '$@' + scale)

        files.push(file)
      })
    }

    axios.get(`//en.wikipedia.org/api/rest_v1/page/media-list/${articleName}`).then(response => {
      var item
      for (var key in response.data.items) {
        item = response.data.items[key]
        for (var i in item.srcset) {
          addMedia(item.title, item.srcset[i].scale, item.srcset[i].src)
        }
      }
    })

    console.log(files)
  }

  requestArticle (articleName, callback, errorCallback) {
    this.p2pt.requestMorePeers()
    var peer = this.getAProxyPeer()

    if (!peer) {
      return false
    }

    this.p2pt.send(peer, JSON.stringify({
      articleName: articleName
    })).then(([peer, response]) => {
      try {
        callback(JSON.parse(response))
      } catch (e) {
        console.log(e)
      }
    })
  }
}
