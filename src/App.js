import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";

import ClientPage from "./pages/ClientPage/ClientPage";
import ProxyPage from "./pages/ProxyPage/ProxyPage";

import "./App.scss";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={ClientPage} />
          {/* <Route exact path="/" component={ResultPage} /> */}
          <Route exact path="/proxy" component={ProxyPage} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
