import axios from 'axios'

const Discovery = require('torrent-discovery')
const randombytes = require('randombytes')
const WebTorrent = require('webtorrent')

var announce = [
  'ws://localhost:5000',
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.sloppyta.co:443/announce',
  'wss://tracker.novage.com.ua:443/announce',
]

if (window.location.hostname === 'localhost')
  announce = ['ws://localhost:5000']

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

        if (data == 'p')
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
  var peers = {},
      bestPeers = [] // The last elem will have the last msged peer id
  
  function removePeer(id) {
    delete peers[id]
    delete bestPeers[bestPeers.indexOf(id)]
    msgBindCallback('peersCount', Object.keys(peers).length)
  }

  const discoveryOpts = {
    infoHash: infoHash,
    peerId: randombytes(20),
    announce: announce
  }

  var discovery = new Discovery(discoveryOpts)
  discovery.on('peer', (peer, source) => {
    peer.on('connect', () => {
      peers[peer.id] = peer
      bestPeers.push(peer.id)
      msgBindCallback('peersCount', Object.keys(peers).length)
      
      peer.on('data', (data) => {
        console.log('got a message from a proxy: ' + data)

        // Move this "active" peer to last of array
        // https://stackoverflow.com/a/24909567
        bestPeers.push(bestPeers.splice(bestPeers.indexOf(peer.id), 1)[0])
      })

      /**
       * Keep pinging
       */
      var t = () => {
        if (!peer.connected) {
          removePeer(peer.id)
        } else {
          peer.send('p') // A ping msg
          setTimeout(t, 1000)
        }
      }
      setTimeout(t, 1000)
    })

    peer.on('close', () => {
      removePeer(peer.id)
    })
  })

  discovery.on('error', err => {
    console.log(err)
  })
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
    } else {
      peer.on('data', data => {
        try {
          var json = JSON.parse(data)
          resolve(json)
        } catch (e) {
          console.log('non JSON data')
        }
      })
      
      peer.send(msg)

      peer.on('error', err => {
        msgBindCallback('search', 'Peer connection failed')
        reject(Error(err))
      })
    }
  })
}

export function getFromWiki (q, callback) {
  messagePeer(
    JSON.stringify({ q: q })
  ).then(response => {
    callback(response)
  }, error => {
    console.log(error)
  })
}

export function msgBind (callback) {
  msgBindCallback = callback
}