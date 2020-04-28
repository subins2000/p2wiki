import React from 'react';
import { HashRouter as Router, Route, Switch } from "react-router-dom";

import ClientPage from './components/ClientPage';
import ProxyPage from './components/ProxyPage';

import './App.scss';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={ClientPage} />
          <Route exact path="/proxy" component={ProxyPage} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
