import React, { useState } from "react";
import { withRouter } from "react-router-dom";

import SearchForm from "./SearchForm";
import Result from './Result';

let htmlResult = null
let resultChanged = false

const Search = ({ p2wiki }) => {
  let [query, setQuery] = useState("");
  let [title, setTitle] = useState("");

  let setResult = elem => {
    if (elem && resultChanged && htmlResult) {
      elem.innerHTML = ''
      elem.appendChild(htmlResult)
      resultChanged = false
    }
  };

  let media = {};
  let retryInterval = null;

  let getFromWiki = () => {
    if (query !== "") {
      if (
        p2wiki.requestArticle(query, function (res) {
          media = res.media;
          res.text.getBuffer((error, buffer) => {
            createMarkup(buffer.toString());
            setTitle(res.Title);
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
      images[i].firstChild.srcset = "";

      if (media[filename]) {
        media[filename].renderTo(images[i].firstChild);
      }
    }

    resultChanged = true
    htmlResult = html.body.firstChild
  };

  let handleSubmit = (e) => {
    e.preventDefault();
    getFromWiki();
  };

  let handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <ProxyButton />
      <SearchForm query={query} handleChange={handleChange} handleSubmit={handleSubmit} />
      <div className="container mx-auto">
        <h1 className="title text-4xl">{title}</h1>
        <Result ref={setResult} />
      </div>
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
