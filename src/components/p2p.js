import axios from 'axios';

const Discovery = require('torrent-discovery')
const randombytes = require('randombytes')
const WebTorrent = require('webtorrent')
var Peer = require('simple-peer')


var ppeer, cpeer, cb;

if (window.location.hash == '#1' || localStorage['proxy'] == 1) {
  // Proxy
  // Seed the torrent
  var client = new WebTorrent()
  var torrentId = 'magnet:?xt=urn:btih:f7e976f25eaa67ed5da4ef2aa864ddb6f6924e5b&dn=index.js&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

  var f = new File(["p2wiki"], "p2wiki");

  var binded_conns = []

  client.seed(f, (torrent) => {
    console.log(torrent.infoHash)

    torrent.on('upload', function (b) {
      var ks = Object.keys(torrent._peers)
      for (var i = 0; i < ks.length; i++) {
        var cpeer = torrent._peers[ks[i]].conn

        if (typeof binded_conns[cpeer] == 'undefined') {
          cpeer.on('data', data => {
            // got a data channel message
            console.log('got a message from cpeer: ' + data)

            try {
              var j = JSON.parse(data)

              console.log(j.q)

              axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${j.q}&prop=text&formatversion=2`).then(res => {
                  console.log(res)
                  cpeer.send(JSON.stringify({res}))
              }).catch((err)=>{alert("Not Found- Try with a more Specific Title")});
            } catch(e) {
              console.log(e)
            }
          })
          binded_conns[cpeer] = 1
        }
      }
    })
  })
} else {
  const opts = {
    infoHash: '62f753362edbfcc2f59593a050bf271d20dec9d2',
    peerId: randombytes(20),
    announce: [
      'wss://tracker.btorrent.xyz',
      'wss://tracker.openwebtorrent.com'
    ]
  }

  /**
  discovery = new Discovery(opts)
  discovery.on('peer', (peer, source) => {
    console.log(peer)

    var mepeer = new Peer({
      initiator: true
    })

    mepeer.on('signal', data => {
      // when ppeer has signaling data, give it to ppeer somehow
      peer.signal(data)
    })

    mepeer.on('connect', () => {
      peer.send('hey ppeer, how is it going?')
    })
  })*/

  var torrentId = 'magnet:?xt=urn:btih:62f753362edbfcc2f59593a050bf271d20dec9d2&dn=index.js&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

  var client = new WebTorrent()

  client.add(torrentId, function(torrent) {
    torrent.on('download', function (b) {
      ppeer = torrent._peers[Object.keys(torrent._peers)[0]].conn

      ppeer.on('data', data => {
        // got a data channel message
        console.log('got a message from ppeer: ' + data)
        try {
          cb(JSON.parse(data))
        } catch (e){
          console.log(e)
        }
      }) 
    })
  })
}

export function getFromWiki(q, cb2) {
  cb = cb2
  ppeer.send(JSON.stringify({'q':q}))
}