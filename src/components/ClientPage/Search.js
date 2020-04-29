import React, { useState } from "react";
import { withRouter } from "react-router-dom";

import SearchForm from "./SearchForm";
import Result from './Result';

const Search = ({ p2wiki }) => {
  let [query, setQuery] = useState("");
  let [title, setTitle] = useState("");
  let [htmlResult, setHtmlResult] = useState({__html: ''}); 

  let media = {};
  let retryInterval = null;

  let getFromWiki = () => {
    if (query !== "") {
      if (
        p2wiki.requestArticle(query, function (res) {
          media = res.media;
          res.text.getBuffer((error, buffer) => {
            setTitle(res.Title);
            createMarkup(buffer.toString());
            if (error) {
              console.log(error);
            }
          });
        }) === false
      ) {
        console.log("No peer. Retrying in 3 seconds");
        clearInterval(retryInterval);
        retryInterval = setTimeout(getFromWiki, 3000);
      }
    }
  };

  let createMarkup = (html) => {
    var parser = new window.DOMParser();
    html = parser.parseFromString(html, "text/html");

    const images = html.querySelectorAll("a[class='image']");
    var filename;
    for (let i = 0; i < images.length; i++) {
      filename = new URL(images[i].href).pathname.slice(6);

      images[i].firstChild.src = "";

      if (media[filename]) {
        media[filename].renderTo(images[i].firstChild);
      }
    }

    setHtmlResult({ __html: html.body.innerHTML });
  };

  let handleSubmit = (e) => {
    e.preventDefault();
    console.log(query);
    getFromWiki();
  };

  let handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <ProxyButton />
      <SearchForm query={query} handleChange={handleChange} handleSubmit={handleSubmit} />
      <Result title={title} htmlResult={htmlResult} />
    </>
  );
};

const ProxyButton = withRouter(({ history }) => (
  <button
    className="button is-success is-outlined"
    style={{ marginBottom: "10px" }}
    type="button"
    onClick={() => {
      history.push("/proxy");
    }}
  >
    Be a Proxy Peer
  </button>
));

export default Search;
