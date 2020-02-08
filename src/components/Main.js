import React, {Component} from 'react';
import axios from "axios";

class Main extends Component {
	state = {
    wiki_data: '',
  }

	componentDidMount() {
		axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/Rose`)
      .then(res => {
        const wiki_data = res.data;
        this.setState({ wiki_data });
    })
	}

  render() {
  	let { wiki_data } = this.state;

		// wiki_data = {
  	// 	description,
  	// 	original_image : source (of img),
			// extract : main content
  	// }

  	console.log(wiki_data);

    return (
      <>
      	<h1>Main</h1>
      </>
    );
  }
}

export default Main;