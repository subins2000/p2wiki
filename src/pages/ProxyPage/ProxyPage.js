import React from "react";
import Footer from "../../common/Footer";

const ProxyPage = ({ p2wiki }) => {
  p2wiki.startProxy();

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Proxy Page</h1>
      <Footer />
    </div>
  );
}

export default ProxyPage;