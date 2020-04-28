import React from "react";
import { P2Wiki } from "../../common/p2wiki";

import Header from "../../components/ClientPage/Header";
import Search from "../../components/ClientPage/Search";
import Footer from "../../common/Footer";

import "./ClientPage.scss";

export default function ClientPage() {
  let announceURLs = [
    "wss://tracker.openwebtorrent.com",
    "wss://tracker.sloppyta.co:443/announce",
    "wss://tracker.novage.com.ua:443/announce",
    "wss://tracker.btorrent.xyz:443/announce",
  ];
  if (window.location.hostname === "localhost") {
    announceURLs = ["ws://localhost:5000"];
  }

  let p2wiki = new P2Wiki(announceURLs);
  p2wiki.startClient();

  return (
    <div style={{ textAlign: "center" }}>
      <Header />
      <Search p2wiki={p2wiki} />
      <Footer />
    </div>
  );
}
