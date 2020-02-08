import React from 'react';
import logo from './logo.svg';
import './App.css';

import Logo from './components/Logo';
import Search from './components/Search';
import Main from './components/Main';


function App() {
  return (
    <div className="App">
      <Logo />
      <Search />
      <Main />
    </div>
  );
}

export default App;
