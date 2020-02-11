import React from 'react'
//import axios from 'axios';
import { Label } from '@rebass/forms'
import createDOMPurify from 'dompurify'
import {getFromWiki} from './p2p'
import { JSDOM } from 'jsdom'

const window = (new JSDOM('')).window
const DOMPurify = createDOMPurify(window)

// class Searchbar = (props) => {
class Searchbar extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange=this.handleChange.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this)
        this.state = {
            title: "",
            text: "",
            query:""
        }

        
        if (window.location.hash !== '#1' && localStorage['proxy'] !== 1) {
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
        if (this.state.text !== '') {
            var that = this
            getFromWiki(this.state.text, function(res) {
                res = res.res
                that.setState({
                    title: res.data.parse.title,
                    query: res.data.parse.text,
                });
            })
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();

        this.getFromWiki()
        /**
        axios.get(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${this.state.text}&prop=text&formatversion=2`).then(res => {
            console.log(res.data)
            this.setState({
                title: res.data.parse.title,
                query: res.data.parse.text,
            });
        }).catch((err)=>{alert("Not Found- Try with a more Specific Title")});*/
    }
    handleChange(e){
        this.setState({text:e.target.value});
    }
    urloli(e){
        this.setState({text:e});
    }
    render() {
        return (
        <div className="text-center md:flex md:items-center mb-6">
            
            <form className="w-full max-w-sm" onSubmit={this.handleSubmit}>
            <div className=" p-8 md:w-4/3">
                <Label className=" text-2xl text-gray-600 font-bold mb-1 md:mb-0 pr-4" htmlFor='Text'>Search for Wikipedia Articles</Label>
                <input
                    id='Search'
                    name='Search'
                    type='Text'
                    placeholder='🔍 Search'
                    onChange={this.handleChange}
                    value={this.state.value}
                    className=" text-4xl bg-gray-200 appearance-none border-4 border-gray-200 rounded  py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-red-500"
                />
                </div>
            </form>
            <h1 className="title">{this.state.title}</h1>
            <div className="container is-fluid " >
            <div  dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(this.state.query)}}/>
            </div>
        </div>);
    }
}
export default Searchbar
