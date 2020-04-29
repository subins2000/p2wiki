import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { P2Wiki } from "./common/p2wiki";

import ClientPage from "./pages/ClientPage/ClientPage";
import ProxyPage from "./pages/ProxyPage/ProxyPage";

import "./App.scss";

const App = () => {
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

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" render={(props) => <ClientPage {...props} p2wiki={p2wiki} />} />
          {/* <Route exact path="/" component={ResultPage} /> */}
          <Route exact path="/proxy" render={(props) => <ProxyPage {...props} p2wiki={p2wiki} />} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
