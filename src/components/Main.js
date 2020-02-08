import React, {Component} from 'react';
import axios from "axios";
import Searchbar from './Search';

class Main extends Component {
	state = {
    wiki_data: '',
  }

  render() {
    return (
      <div>
      	<h1>Main</h1>
        <Searchbar/>
      </div>
    );
  }
}

export default Main;