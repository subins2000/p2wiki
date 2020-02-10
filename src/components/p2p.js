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

function sendToPeer(peer, type, data) {
  if (typeof data === 'undefined') {
    data = {}
  }
  peer.send(JSON.stringify({
    type: type,
    data: data
  }));
}

/**
 * Be a proxy in the network
 */
export function startProxy() {
  // Proxy
  // Seed the torrent
  

  setStatus('Acting as proxy')

  axios.get('a.png', {
    responseType: 'blob'
  }).then(function(response) {
    var f = new File([response.data], "p2wiki", {
      type: 'image/jpeg'
    });

    var binded_conns = []

    const client = new WebTorrent()
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

                console.log(j)

                if (j.type === 'ping') {
                  sendToPeer(client_peer, 'pong');
                } else {
                  axios.get(`//en.wikipedia.org/w/api.php?action=parse&format=json&page=${j.q}&prop=text&formatversion=2`).then(res => {
                      console.log(res)
                      client_peer.send(JSON.stringify({res}))
                  }).catch((err)=>{
                    console.log(err)
                    alert("Not Found- Try with a more Specific Title")
                  });
                }
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
  });
}


/**
 * Be a client in the network and get proxy peers
 */
export function startClient() {
  setStatus('Finding peers...');

  const client = new WebTorrent({
    store: function(a) {
      console.log(a)
    }
  })

  function findPeers() {
    const p2wikiNetworkIdentifierMagnet = 'magnet:?xt=urn:btih:ad213daf1caa13aafe3b33f52e3dadea8e1a7b31&dn=index.js&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'

    client.add(p2wikiNetworkIdentifierMagnet, function(torrent) {
      torrent.on('download', function (b) {
        for (var k in torrent._peers) {
          torrent._peers[k].conn.on('data', data => {
            try {
              var j = JSON.parse(data)

              if (j.type === 'pong') {
                proxy_peers[k] = torrent._peers[k].conn
              }
              setStatus()
            } catch {

            }
          })
          sendToPeer(torrent._peers[k].conn, 'ping')
        }
        setStatus()
      })
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
  var peer = proxy_peers[keys[randomIntFromInterval(0, keys.length - 1)]]
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

  if (proxy_peer === null) {
    //cb()
  } else {
    proxy_peer.on('data', data => {
      // got a data channel message
      console.log('got a message from proxy_peer: ' + data)
      try {
        cb(JSON.parse(data))
      } catch (e){
        console.log(e)
      }
    })

    sendToPeer(proxy_peer, 'q', q)
    // Request
  }
}