import React from "react";
import { P2Wiki } from "./p2wiki";

export default function ProxyPage() {
  var announceURLs = [
    "wss://tracker.openwebtorrent.com",
    "wss://tracker.sloppyta.co:443/announce",
    "wss://tracker.novage.com.ua:443/announce",
    "wss://tracker.btorrent.xyz:443/announce",
  ];
  if (window.location.hostname === "localhost") {
    announceURLs = ["ws://localhost:5000"];
  }

  let p2wiki = new P2Wiki(announceURLs);
  p2wiki.startProxy();

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Proxy Page</h1>
    </div>
  );
}
