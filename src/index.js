const Discovery = require('torrent-discovery')
const randombytes = require('randombytes')
const WebTorrent = require('webtorrent')
var Peer = require('simple-peer')


if (location.hash == '#1') {
  // Proxy
  // Seed the torrent
  var client = new WebTorrent()
  var torrentId = 'magnet:?xt=urn:btih:f7e976f25eaa67ed5da4ef2aa864ddb6f6924e5b&dn=index.js&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

  var f = new File(["p2wiki"], "p2wiki");

  client.seed(f, (torrent) => {
    console.log(torrent.infoHash)

    torrent.on('wire', function (wire, addr) {
      console.log('connected to peer with address ' + addr)

    })
  })
} else {
  const opts = {
    infoHash: '2af9a2c6425f876d0453d76c788145877993b311',
    peerId: randombytes(20),
    announce: [
      'wss://tracker.btorrent.xyz',
      'wss://tracker.openwebtorrent.com'
    ]
  }

  discovery = new Discovery(opts)
  discovery.on('peer', (peer, source) => {
    console.log(peer)

    var mepeer = new Peer({
      initiator: true
    })

    mepeer.on('signal', data => {
      // when peer1 has signaling data, give it to peer2 somehow
      peer.signal(data)
    })

    mepeer.on('connect', () => {
      peer.send('hey peer2, how is it going?')
    })
  })
}