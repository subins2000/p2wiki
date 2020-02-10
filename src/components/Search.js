import React from 'react'
import { Label, Input } from '@rebass/forms'
import {startClient, startProxy, getFromWiki, setStatusCallback} from './p2p'


// class Searchbar = (props) => {
class Searchbar extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange=this.handleChange.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this)
        this.state = {
            title: "",
            text: "Kerala",
            query: "",
            status: ""
        }

        var that = this

        setStatusCallback(function(msg) {
            that.state.status = msg
        })

        if (window.location.hash !== '#1' && localStorage['proxy'] !== 1) {
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

            startClient()
        } else {
            startProxy()
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
        let createMarkup=(text)=> {
            //console.log(text)
            return {__html:text}
        }
        return (
        <>
        <div id='status' dangerouslySetInnerHTML={createMarkup(this.state.status)}></div><br/>
        <div style={{ align: `center` }}>
            <form onSubmit={this.handleSubmit}>
                <Label htmlFor='text'>Search</Label>
                <Input
                    id='Search'
                    name='Search'
                    type='Text'
                    placeholder='Enter Item you want to search'
                    onChange={this.handleChange}
                    value={this.state.value}
                    className="input is-rounded"
                />
            </form>
            <h1 className="title">{this.state.title}</h1>
            <div className="container is-fluid " >
            <div  dangerouslySetInnerHTML={createMarkup(this.state.query)}/>
            </div>
        </div>
        </>
        );
    }
}
export default Searchbar
