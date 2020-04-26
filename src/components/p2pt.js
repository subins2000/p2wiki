const WebSocketTracker = require('bittorrent-tracker/lib/client/websocket-tracker')
const randombytes = require('randombytes')
const EventEmitter = require('events')
const str = require('string-to-stream')
const sha1 = require('simple-sha1')

const JSON_MESSAGE_IDENTIFIER = '🌚'

class P2PT extends EventEmitter {
  constructor (announceURLs = [], identifierString = '') {
    super()

    this.announceURLS = []
    this.peers = {}

    this.announceURLS.push(announceURLs)

    if (identifierString) { this.setIdentifier(identifierString) }

    this._peerIdBuffer = randombytes(20)
    this._peerId = this._peerIdBuffer.toString('hex')
    this._peerIdBinary = this._peerIdBuffer.toString('binary')
  }

  setIdentifier (identifierString) {
    this.identifierString = identifierString
    this.infoHash = sha1.sync(identifierString).toLowerCase()
    this._infoHashBuffer = Buffer.from(this.infoHash, 'hex')
    this._infoHashBinary = this._infoHashBuffer.toString('binary')
  }

  start () {
    const $this = this

    this.on('peer', (peer) => {
      peer.on('data', (data) => {
        $this.emit('data', peer, data)

        if (data[0] === JSON_MESSAGE_IDENTIFIER) {
          try {
            data = JSON.parse(data.slice(1))
            $this.emit('msg', peer, data.msg)
          } catch (e) {
            console.log(e)
          }
        }
      })

      peer.on('error', (err) => {
        console.log(err)
        $this.removePeer(peer.id)
        console.log('ccc')
      })

      peer.on('close', () => {
        $this.removePeer(peer.id)
        console.log('cccaaa')
      })

      $this.emit('peer', peer)
    })

    this._fetchPeers()
  }

  removePeer (id) {
    delete this.peers[id]
    this.emit('peercountchange', Object.keys(this.peers).length)
  }

  // Send a msg and get response for it
  send (peer, msg) {
    return Promise((response) => {
      var data = {
        id: randombytes(20),
        msg: msg
      }

      var responseCallback = (responseData) => {
        if (responseData[0] === JSON_MESSAGE_IDENTIFIER) {
          try {
            responseData = JSON.parse(responseData.slice(1))
            if (responseData.id === data.id) {
              response(responseData.msg)
            }
          } catch (e) {
            console.log(e)
          }
        }
        peer.removeListener('data', responseCallback)
      }

      peer.on('data', responseCallback)
      peer.send(JSON.stringify(data))
    })
  }

  _defaultAnnounceOpts (opts = {}) {
    if (opts.numwant == null) opts.numwant = 50

    if (opts.uploaded == null) opts.uploaded = 0
    if (opts.downloaded == null) opts.downloaded = 0

    return opts
  }

  _fetchPeers () {
    var tracker
    for (var key in this.announceURLS) {
      tracker = new WebSocketTracker(this, this.announceURLS[key])
      tracker.announce({
        numwant: 50
      })
    }
  }
}

export default P2PT