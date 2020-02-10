import axios from 'axios';

const WebTorrent = require('webtorrent')

var proxy_peers = {},
    status_callback = function(){};

export function setStatusCallback(cb) {
  status_callback = cb
}

var lastMsg = ''
function setStatus(msg) {
  if (msg !== undefined)
    lastMsg = msg

  var full = 'Peers: ' + Object.keys(proxy_peers).length
  full += '<br/>' + lastMsg
  status_callback(full)
  console.log(full)
}

/**
 * Be a proxy in the network
 */
export function startProxy() {
  // Proxy
  // Seed the torrent
  const client = new WebTorrent()

  setStatus('Acting as proxy')

  var f = new File(["p2wiki"], "p2wiki");

  var binded_conns = []

  client.seed(f, (torrent) => {
    console.log(torrent.infoHash)

    torrent.on('upload', function (b) {
      var ks = Object.keys(torrent._peers),
          client_peer,
          j;

      for (var i = 0; i < ks.length; i++) {
        client_peer = torrent._peers[ks[i]].conn

        if (typeof binded_conns[client_peer] === 'undefined') {
          client_peer.on('data', data => {
            // got a data channel message
            console.log('got a message from client_peer: ' + data)

            try {
              var j = JSON.parse(data)

              console.log(j.q)

              axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${j.q}&prop=text&formatversion=2`).then(res => {
                  console.log(res)
                  client_peer.send(JSON.stringify({res}))
              }).catch((err)=>{
                console.log(err)
                alert("Not Found- Try with a more Specific Title")
              });
            } catch(e) {
              console.log(e)
            }
          })
          binded_conns[client_peer] = 1

          setStatus()
        }
      }
    })
  })
}


/**
 * Be a client in the network and get proxy peers
 */
export function startClient() {
  setStatus('Finding peers...');

  const client = new WebTorrent()

  function findPeers() {
    const p2wikiNetworkIdentifierMagnet = 'magnet:?xt=urn:btih:62f753362edbfcc2f59593a050bf271d20dec9d2&dn=index.js&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

    client.add(p2wikiNetworkIdentifierMagnet, function(torrent) {
      torrent.on('download', function (b) {
        proxy_peers = torrent._peers
        setStatus()
      })

      // Don't seed
      torrent.on('done', function() {
        torrent.destroy(function() {
          // try to find peers in 5 seconds
          setTimeout(findPeers, 5000)
        })
      });
    })
  }
  findPeers()
}

/**
 * https://stackoverflow.com/a/7228322/1372424
 */
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getAProxyPeer() {
  var keys = Object.keys(proxy_peers)
  var peer = proxy_peers[keys[randomIntFromInterval(0, keys.length)]]
  if (peer) {
    return peer;
  } else {
    return null;
  }
}

/**
 * Find a proxy peer and request wiki page
 * @param String q Article query
 */
export function getFromWiki(q, cb) {
  var proxy_peer = getAProxyPeer()

  console.log(proxy_peers)
  console.log(proxy_peer)

  if (proxy_peer === null) {
    //cb()
  } else {
    proxy_peer = proxy_peer.conn
    proxy_peer.on('data', data => {
      // got a data channel message
      console.log('got a message from proxy_peer: ' + data)
      try {
        cb(JSON.parse(data))
      } catch (e){
        console.log(e)
      }
    })

    // Request
    proxy_peer.send(JSON.stringify(
      {'q':q}
    ))
  }
}