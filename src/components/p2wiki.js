import axios from 'axios'

import P2PT from './p2pt'

export class P2Wiki {
  constructor (announceURLs) {
    this.proxyPeers = {}
    this.proxyPeersID = []
    this.curProxyPeerIndex = 0

    this.p2pt = new P2PT(announceURLs, 'p2wiki')
  }

  startProxy () {
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

          axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${msg.articleName}&prop=text&formatversion=2&origin=*`).then(res => {
            console.log(res)

            peer.respond(JSON.stringify(res))
          }).catch((err) => {
            console.log(err)
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
    // TODO: Peer close remove
    this.p2pt.start()
  }

  getAProxyPeer () {
    if (this.proxyPeersID.length === 0) { return false }

    if (this.curProxyPeerIndex > this.proxyPeersID.length - 1) { this.curProxyPeerIndex = 0 }

    return this.proxyPeers[this.proxyPeersID[this.curProxyPeerIndex]]
  }

  requestArticle (articleName, callback, errorCallback) {
    this.p2pt.search()
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
