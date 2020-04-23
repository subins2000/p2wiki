import axios from 'axios'

const Discovery = require('torrent-discovery')
const randombytes = require('randombytes')
const WebTorrent = require('webtorrent')

const announce = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.sloppyta.co:443/announce',
  'wss://tracker.novage.com.ua:443/announce'
]
const infoHash = '62f753362edbfcc2f59593a050bf271d20dec9d2'

const discoveryOpts = {
  infoHash: infoHash,
  peerId: randombytes(20),
  announce: announce
}

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

function messagePeer (msg, callback) {
  var gotPeer = false
  return new Promise(function (resolve, reject) {
    var discovery = new Discovery(discoveryOpts)
    discovery.on('peer', (peer, source) => {
      if (gotPeer) return
      
      peer.on('data', data => {
        try {
          var json = JSON.parse(data)
          resolve(json)
        } catch (e) {
          console.log('non JSON data')
        }
      })

      peer.on('connect', () => {
        peer.send(msg)
      })

      peer.on('error', err => {
        gotPeer = false
        reject(Error(err))
      })
      gotPeer = true
    })
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
