import React from "react";
//import axios from 'axios';
//import { Label } from "@rebass/forms";
//import { Box, Button } from "rebass"
import { requestArticle, msgBind } from "./p2p";

// class Searchbar = (props) => {
class Searchbar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      title: "",
      query: "",
      result: "",
      beAProxy: false,
    };

    if (localStorage.getItem("beAProxy") === "true") {
      this.state.beAProxy = true;
    }

    var that = this,
        url = document.location.pathname,
        spli = url.split("/");

    if (spli.length > 2 && spli[spli.length - 2] === 'wiki') {
      setTimeout(function () {
        that.urloli(spli[spli.length - 1]);
        that.getFromWiki();
      }, 1000);
    }

    msgBind((type, msg) => {
      console.log(type, msg)
    })
  }

  getFromWiki = () => {
    if (this.state.query !== "") {
      var that = this;
      requestArticle(this.state.query).then(function (res) {
        that.setState({
          title: res.data.parse.title,
          result: res.data.parse.text,
        })
      }).catch((err) => {
        if (err === 'nopeer') {
          console.log('nopeer, retrying in 3 seconds')
          setTimeout(that.getFromWiki, 3000)
        }
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state.query);

    this.getFromWiki();
    /**
        axios.get(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${this.state.query}&prop=query&formatversion=2`).then(res => {
            console.log(res.data)
            this.setState({
                title: res.data.parse.title,
                result: res.data.parse.query,
            });
        }).catch((err)=>{alert("Not Found- Try with a more Specific Title")});*/
  };
  handleChange(e) {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    this.setState({
      [e.target.name]: value,
    });

    if (e.target.name === "beAProxy") {
      localStorage.setItem("beAProxy", value);
      window.location.reload();
    }
  }
  urloli(e) {
    this.setState({
      query: e,
    });
  }
  render() {
    let createMarkup = (html) => {
      //console.log(query)
      return { __html: html };
    };
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label className="checkbox">
            <input
              type="checkbox"
              onChange={this.handleChange}
              name="beAProxy"
              checked={this.state.beAProxy}
            />
            <span style={{marginLeft: '5px'}}>Be a Proxy Peer</span>
          </label>
          <div className="field">
            <div className="control">
              <input
                className="input is-rounded"
                id="query"
                type="Text"
                placeholder="🔍 Search for an article"
                onChange={this.handleChange}
                name="query"
                value={this.state.query}
              />
            </div>
          </div>
        </form>
        <div className="container mx-auto">
          <h1 className="title text-4xl">{this.state.title}</h1>
          <div dangerouslySetInnerHTML={createMarkup(this.state.result)} />
        </div>
      </div>
    );
  }
}
export default Searchbar;
