const WebSocketTracker = require('bittorrent-tracker/lib/client/websocket-tracker')
const randombytes = require('randombytes')
const EventEmitter = require('events')
const str = require('string-to-stream')
const sha1 = require('simple-sha1')

const JSON_MESSAGE_IDENTIFIER = 'p'

class P2PT extends EventEmitter {
  constructor (announceURLs = [], identifierString = '') {
    super()

    this.announceURLs = announceURLs
    this.peers = {}

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
      peer.on('connect', () => {
        $this.emit('newpeer', peer)
      })

      peer.on('data', (data) => {
        $this.emit('data', peer, data)

        data = data.toString()
        if (data[0] === JSON_MESSAGE_IDENTIFIER) {
          try {
            data = JSON.parse(data.slice(1))

            // A respond function
            peer.respond = $this.peerRespond(peer, data.id)

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
    })

    this._fetchPeers()
  }

  removePeer (id) {
    delete this.peers[id]
    this.emit('peercountchange', Object.keys(this.peers).length)
  }

  // Send a msg and get response for it
  send (peer, msg, msgID = '') {
    return new Promise((resolve) => {
      var data = {
        id: msgID !== '' ? msgID : Math.random(),
        msg: msg
      }

      var responseCallback = (responseData) => {
        responseData = responseData.toString()
        if (responseData[0] === JSON_MESSAGE_IDENTIFIER) {
          try {
            responseData = JSON.parse(responseData.slice(1))
            if (responseData.id === data.id) {
              resolve([peer, responseData.msg])
            }
          } catch (e) {
            console.log(e)
          }
        }
        peer.removeListener('data', responseCallback)
      }
      console.log(data)
      peer.on('data', responseCallback)
      peer.send(JSON_MESSAGE_IDENTIFIER + JSON.stringify(data))
    })
  }

  peerRespond (peer, msgID) {
    var $this = this
    return (msg) => {
      return $this.send(peer, msg, msgID)
    }
  }

  _defaultAnnounceOpts (opts = {}) {
    if (opts.numwant == null) opts.numwant = 50

    if (opts.uploaded == null) opts.uploaded = 0
    if (opts.downloaded == null) opts.downloaded = 0

    return opts
  }

  _fetchPeers () {
    var tracker
    for (var key in this.announceURLs) {
      tracker = new WebSocketTracker(this, this.announceURLs[key])
      tracker.announce({
        numwant: 50
      })
    }
  }
}

export default P2PT