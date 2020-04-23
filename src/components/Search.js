import React from 'react'
//import axios from 'axios';
import { Label } from '@rebass/forms'
//import { Box, Button } from "rebass"
import {getFromWiki} from './p2p'


// class Searchbar = (props) => {
class Searchbar extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange=this.handleChange.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this)
        this.state = {
            title: "",
            query: "",
            result:"",
            beAProxy: false
        }
        
        if (localStorage.getItem('beAProxy') === "true") {
            this.state.beAProxy = true

            var that = this
            setTimeout(function() {
                let url=document.URL
                if (url!=="http://localhost:3000/wiki")
                {
                    let spli=url.split("/")
                    let spliurl=spli.slice(-1).pop()

                    that.urloli(spliurl)
                }
                that.getFromWiki()
            }, 5000)
        }
    }
    getFromWiki = () => {
        if (this.state.query !== '') {
            var that = this
            getFromWiki(this.state.query, function(res) {
                that.setState({
                    title: res.data.parse.title,
                    result: res.data.parse.text,
                });
            })
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state.query)

        this.getFromWiki()
        /**
        axios.get(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${this.state.query}&prop=query&formatversion=2`).then(res => {
            console.log(res.data)
            this.setState({
                title: res.data.parse.title,
                result: res.data.parse.query,
            });
        }).catch((err)=>{alert("Not Found- Try with a more Specific Title")});*/
    }
    handleChange(e){
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
            [e.target.name]: value
        });

        if (e.target.name === 'beAProxy') {
            localStorage.setItem('beAProxy', value)
            window.location.reload()
        }
    }
    urloli(e){
        this.setState({
            query: e
        });
    }
    render() {
        let createMarkup=(html)=> {
            //console.log(query)
            return {__html:html}
        }
        return (
        <div className="text-center md:flex md:items-center mb-6">
            <form className="w-full max-w-sm" onSubmit={this.handleSubmit}>
                <input type="checkbox" id="beAProxy" onChange={this.handleChange} name="beAProxy" checked={this.state.beAProxy} />
                <label htmlFor="beAProxy">Be A Proxy Peer</label>
            
                <div className="w-full max-w-sm">
                    <Label className="text-2xl text-gray-600 font-bold mb-1 md:mb-0 pr-4" htmlFor='query'>Search for Wikipedia Articles</Label>
                    <input
                    id='query'
                    type='Text'
                    placeholder='🔍 Search'
                    onChange={this.handleChange}
                    name="query"
                    value={this.state.query}
                    className=" text-4xl bg-gray-200 appearance-none border-4 border-gray-200 rounded  py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-red-500"
                    />
                </div>
            </form>
            <div className="container is-fluid">
                <h1 className="title">{this.state.title}</h1>
                <div dangerouslySetInnerHTML={createMarkup(this.state.result)}/>
            </div>
        </div>);
    }
}
export default Searchbar
