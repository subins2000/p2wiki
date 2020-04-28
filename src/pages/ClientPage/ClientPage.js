import React from "react";
import Header from "../../components/ClientPage/Header";
import Search from "../../components/ClientPage/Search";
import Footer from "../../common/Footer";

import "./ClientPage.scss";

export default function ClientPage() {
  return (
    <div style={{ textAlign: "center" }}>
      <Header />
      <Search />
      <Footer />
    </div>
  );
}
