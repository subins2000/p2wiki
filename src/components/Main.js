import React, {Component} from 'react';
//import axios from "axios";
import Searchbar from './Search';

class Main extends Component {
  render() {
    return (
      <>
      <div>
      	<h1 className="font-mono text-6xl text-center">P2Wiki</h1>
        <Searchbar/>
      </div>
      <footer className="footer">
      <div className="content has-text-centered">
        <p className="font-mono text-1xl" style={{color:`hotpink`}}>
          P2Wiki made by Subin Siby, Pranav Shridhar,Athul Cyriac Ajay @Hackcamp
        </p>
      </div>
    </footer>
    </>
    );
  }
}

export default Main;