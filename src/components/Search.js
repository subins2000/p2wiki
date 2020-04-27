import React from 'react'
// import axios from 'axios';
// import { Label } from "@rebass/forms";
// import { Box, Button } from "rebass"
import { P2Wiki } from './p2wiki'

// class Searchbar = (props) => {
class Searchbar extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getFromWiki = this.getFromWiki.bind(this)
    this.state = {
      title: '',
      query: '',
      result: '',
      beAProxy: false
    }

    this.retryInterval = null

    var announceURLs = [
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.sloppyta.co:443/announce',
      'wss://tracker.novage.com.ua:443/announce',
      'wss://tracker.btorrent.xyz:443/announce'
    ]

    if (window.location.hostname === 'localhost') { announceURLs = ['ws://localhost:5000'] }

    this.p2wiki = new P2Wiki(announceURLs)

    if (window.localStorage.getItem('beAProxy') === 'true') {
      this.state.beAProxy = true

      this.p2wiki.startProxy()
    } else {
      this.p2wiki.startClient()
    }

    var that = this
    var url = document.location.pathname
    var spli = url.split('/')

    if (spli.length > 2 && spli[spli.length - 2] === 'wiki') {
      setTimeout(function () {
        that.urloli(spli[spli.length - 1])
        that.getFromWiki()
      }, 1000)
    }
  }

  getFromWiki () {
    if (this.state.query !== '') {
      var that = this

      if (
        this.p2wiki.requestArticle(
          this.state.query,
          function (res) {
            res.text.getBuffer((err, buffer) => {
              that.setState({
                title: res.title,
                result: buffer.toString()
              })
            })
          }
        ) === false
      ) {
        console.log('nopeer, retrying in 3 seconds')
        clearInterval(this.retryInterval)
        this.retryInterval = setTimeout(this.getFromWiki, 3000)
      }
    }
  }

  handleSubmit (e) {
    e.preventDefault()
    console.log(this.state.query)

    this.getFromWiki()
    /**
        axios.get(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${this.state.query}&prop=query&formatversion=2`).then(res => {
            console.log(res.data)
            this.setState({
                title: res.data.parse.title,
                result: res.data.parse.query,
            });
        }).catch((err)=>{alert("Not Found- Try with a more Specific Title")});
    */
  };

  handleChange (e) {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    this.setState({
      [e.target.name]: value
    })

    if (e.target.name === 'beAProxy') {
      window.localStorage.setItem('beAProxy', value)
      window.location.reload()
    }
  }

  urloli (e) {
    this.setState({
      query: e
    })
  }

  render () {
    const createMarkup = (html) => {
      var parser = new DOMParser();
      html = parser.parseFromString(html, 'text/html');

      const images = html.querySelectorAll("a[class='image'] img");
      for (let i = 0; i < images.length; i++) {
        console.log(images[i].src)
        images[i].src = null
      }

      console.log(images)

      return { __html: html.body.innerHTML }
    }
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label className='checkbox'>
            <input
              type='checkbox'
              onChange={this.handleChange}
              name='beAProxy'
              checked={this.state.beAProxy}
            />
            <span style={{ marginLeft: '5px' }}>Be a Proxy Peer</span>
          </label>
          <div className='field'>
            <div className='control'>
              <input
                className='input is-rounded'
                id='query'
                type='Text'
                placeholder='🔍 Search for an article'
                onChange={this.handleChange}
                name='query'
                value={this.state.query}
              />
            </div>
          </div>
        </form>
        <div className='container mx-auto'>
          <h1 className='title text-4xl'>{this.state.title}</h1>
          <div dangerouslySetInnerHTML={createMarkup(this.state.result)} />
        </div>
      </div>
    )
  }
}
export default Searchbar
