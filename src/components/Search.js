import React, { Component } from 'react'
import { P2Wiki } from './p2wiki'
import { withRouter } from 'react-router-dom'

const ProxyButton = withRouter(({ history }) => (
  <button
    className="button is-success is-outlined"
    style={{marginBottom: '10px'}}
    type='button'
    onClick={() => { history.push('/proxy') }}
  >
    Be a Proxy Peer
  </button>
))

class Searchbar extends Component {
  constructor (props) {
    super(props);

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getFromWiki = this.getFromWiki.bind(this)

    this.state = {
      title: '',
      query: '',
      result: '',
      loading: false,
    }

    this.media = {}

    this.retryInterval = null

    var announceURLs = [
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.sloppyta.co:443/announce',
      'wss://tracker.novage.com.ua:443/announce',
      'wss://tracker.btorrent.xyz:443/announce'
    ]

    if (window.location.hostname === 'localhost') { announceURLs = ['ws://localhost:5000'] }

    this.p2wiki = new P2Wiki(announceURLs)
    this.p2wiki.startClient()

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
      var $this = this

      if (
        this.p2wiki.requestArticle(
          this.state.query,
          function (res) {
            $this.media = res.media
            res.text.getBuffer((error, buffer) => {
              $this.setState({
                title: res.title,
                result: buffer.toString()
              })
              if (error) { console.log(error) }
            })
          }
        ) === false
      ) {
        console.log('no peer, retrying in 3 seconds')
        clearInterval(this.retryInterval)
        this.retryInterval = setTimeout(this.getFromWiki, 3000)
      }
    }
  }

  handleSubmit (e) {
    e.preventDefault()
    console.log(this.state.query)

    this.getFromWiki()
  };

  handleChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  urloli (e) {
    this.setState({
      query: e
    })
  }

  render () {
    const $this = this
    const createMarkup = (html) => {
      var parser = new window.DOMParser()
      html = parser.parseFromString(html, 'text/html')

      const images = html.querySelectorAll("a[class='image']")
      var filename
      for (let i = 0; i < images.length; i++) {
        filename = new URL(images[i].href).pathname.slice(6)

        images[i].firstChild.src = ''

        if ($this.media[filename]) {
          $this.media[filename].renderTo(images[i].firstChild)
        }
      }

      return { __html: html.body.innerHTML }
    }
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <ProxyButton />
          <div className='field'>
            <div style={{textAlign: 'center'}} className='control'>
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
