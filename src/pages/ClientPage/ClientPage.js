import React from "react";

import Header from "../../components/ClientPage/Header";
import Search from "../../components/ClientPage/Search";
import Footer from "../../common/Footer";

import "./ClientPage.scss";

export default function ClientPage({ p2wiki }) {
  p2wiki.startClient();

  return (
    <div style={{ textAlign: "center" }}>
      <Header />
      <Search p2wiki={p2wiki} />
      <Footer />
    </div>
  );
}
