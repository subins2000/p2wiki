import React, {Component} from 'react';
//import axios from "axios";
import Searchbar from './Search';

class Main extends Component {
  render() {
    return (
      <>
      <div>
      	<h1>P2Wiki</h1>
        <Searchbar/>
      </div>
      <footer className="footer">
      <div className="content has-text-centered">
        <p style={{color:`hotpink`}}>
          P2Wiki made by Subin Siby, Athul Cyriac Ajay, Pranav Shridhar
        </p>
      </div>
    </footer>
    </>
    );
  }
}

export default Main;