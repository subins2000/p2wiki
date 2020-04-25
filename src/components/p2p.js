import axios from 'axios'

const WebSocketTracker = require('bittorrent-tracker/lib/client/websocket-tracker')
const randombytes = require('randombytes')
const WebTorrent = require('webtorrent')
const EventEmitter = require('events')
const chunks = require('chunk-stream')
const str = require('string-to-stream')


export class P2PT extends EventEmitter {
  
  infoHash = false
  identifierHash = null
  announceURLS = []

  peers = {}

  constructor (announceURLS = [], infoHash = '') {
    this.announce.push(announceURLS)

    this.infoHash = infoHash.toLowerCase()
    this._infoHashBuffer = Buffer.from(this.infoHash, 'hex')
    this._infoHashBinary = this._infoHashBuffer.toString('binary')

    this._peerIdBuffer = randombytes(20)
    this._peerId = this._peerIdBuffer.toString('hex')
    this._peerIdBinary = this._peerIdBuffer.toString('binary')
  }

  listen (identifierString) {
    var client = new WebTorrent()

    var f = new File([identifierString], identifierString)

    client.seed(f, {
      announce: announce
    }, (torrent) => {
      // Will be 62f753362edbfcc2f59593a050bf271d20dec9d2
      console.log(torrent.infoHash)

      torrent.on('peer', (peer) => {
        peer.on('data', data => {
          // got a data channel message
          console.log('got a message from cpeer: ' + data)

          try {
            var j = JSON.parse(data)
            axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${j.q}&prop=text&formatversion=2`).then(res => {
              console.log(res)
              peer.send(JSON.stringify(res))
            }).catch((err) => {
              console.log(err)
              alert('Not Found- Try with a more Specific Title')
            })
          } catch (e) {
            console.log('non JSON data')
          }
        })
      })
    })
  }

  start () {
    const $this = this
    
    this.on('peer', (peer) => {
      peer.on('error', (err) => {
        console.log(err)
        $this.removePeer(peer.id)
        console.log('ccc')
      })
      
      peer.on('close', () => {
        $this.removePeer(peer.id)
        console.log('cccaaa')
      })
    })
  }

  removePeer (id) {
    delete this.peers[id]
    this.emit('peercountchange', Object.keys(this.peers).length)
  }

  _defaultAnnounceOpts (opts = {}) {
    if (opts.numwant == null) opts.numwant = 50

    if (opts.uploaded == null) opts.uploaded = 0
    if (opts.downloaded == null) opts.downloaded = 0

    return opts
  }

  _fetchPeers () {
    var tracker;
    for (var key in this.announceURLS) {
      tracker = new WebSocketTracker(this, this.announceURLS[key])
      tracker.announce({
        numwant: 50,
      })
    }
  }
}

const infoHash = '62f753362edbfcc2f59593a050bf271d20dec9d2'
var msgBindCallback = (type, msg) => {};

if (localStorage.getItem('beAProxy') === "true") {
  // Proxy

  // Seed the torrent
  var client = new WebTorrent()

  var f = new File(['p2wiki'], 'p2wiki')

  client.seed(f, {
    announce: announce
  }, (torrent) => {
    // Will be 62f753362edbfcc2f59593a050bf271d20dec9d2
    console.log(torrent.infoHash)

    torrent.on('peer', (peer) => {
      peer.on('data', data => {
        // got a data channel message
        console.log('got a message from a client: ' + data)

        if (data.toString() === 'p')
          peer.send('p') // Pong

        try {
          var j = JSON.parse(data)
          axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${j.q}&prop=text&formatversion=2&origin=*`).then(res => {
            console.log(res)
            peer.send(JSON.stringify(res))
          }).catch((err) => {
            console.log(err)
            alert('Not Found- Try with a more Specific Title')
          })
        } catch (e) {}
      })
    })
  })
} else {

}

// Get the best peer
function getAPeer() {
  var keys = Object.keys(peers)

  if (keys.length === 0)
    return false

  return peers[bestPeers[bestPeers.length - 1]]
  
}

function messagePeer (msg) {
  return new Promise(function (resolve, reject) {
    var peer = getAPeer()

    if (!peer) {
      msgBindCallback('search', 'No peers available')
      reject('nopeer')
    } else {
      peer.on('data', data => {
        try {
          var json = JSON.parse(data)
          resolve(json)
        } catch (e) {}
      })
      
      peer.send(msg)

      peer.on('error', err => {
        msgBindCallback('search', 'Peer connection failed')
        reject(Error(err))
      })
    }
  })
}

export function requestArticle (q) {
  return messagePeer(
    JSON.stringify({ q: q })
  )
}

export function msgBind (callback) {
  msgBindCallback = callback
}