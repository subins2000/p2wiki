import axios from 'axios'

import P2PT from './p2pt'

export class P2Wiki {
  constructor (announceURLs) {
    this.proxyPeers = {}
    this.proxyPeersID = []
    this.curProxyPeerIndex = 0

    this.p2pt = new P2PT(announceURLs)
  }

  startProxy () {
    this.p2pt.on('msg', (peer, msg) => {
      if (msg === 'c') {
        peer.send('p') // Yes, I'm a proxy
      } else {
        // If first character is ♾, it's followed by JSON
        msg = JSON.parse(msg.splice(1))

        axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${msg.q}&prop=text&formatversion=2&origin=*`).then(res => {
          console.log(res)

          peer.send(JSON.stringify(res))
        }).catch((err) => {
          console.log(err)
        })
      }
    })
    this.p2pt.start()
  }

  startClient () {
    const $this = this
    this.p2pt.on('data', (peer, data) => {
      if (data === 'p') {
        $this.proxyPeers[peer.id] = peer
        $this.proxyPeersIndex.push(peer.id)
      }
    })
    this.p2pt.start()
  }

  getAProxyPeer () {
    if (this.proxyPeers.length === 0) { return false }

    if (this.curProxyPeerIndex > this.proxyPeersID.length - 1) { this.curProxyPeerIndex = 0 }

    return this.proxyPeers[this.proxyPeersID[this.curProxyPeerIndex]]
  }

  requestArticle (articleName, callback) {
    var peer = this.getAProxyPeer()

    this.p2pt.send(peer, {
      articleName: articleName
    }).then((response) => {
      response = JSON.parse(response)
      callback(response)
    })
  }
}
