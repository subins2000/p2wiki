import React from 'react'
import axios from 'axios';
import { Label, Input } from '@rebass/forms'
import { Box, Button } from "rebass"


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
    }
    handleSubmit = (e) => {
        e.preventDefault();
        axios.get(`http://en.wikipedia.org/w/api.php?action=parse&format=json&page=${this.state.text}&prop=text&formatversion=2`).then(res => {
            console.log(res.data)
            this.setState({
                title: res.data.parse.title,
                query: res.data.parse.text,
            });
        }).catch((err)=>{alert("Not Found- Try with a more Specific Title")});
    }
    handleChange(e){
        this.setState({text:e.target.value});
    }
    urloli(e){
        // this.setState({text:e});
        this.state.text = e;
    }
    render() {
        let url=document.URL
        let spli=url.split("/")
        let spliurl=spli.slice(-1).pop()
        
        this.urloli(spliurl)
        let createMarkup=(text)=> {
            //console.log(text)
            return {__html:text}
        }
        return (
        <div style={{ align: `center` }}>
            <form onSubmit={this.handleSubmit}>
                <Label htmlFor='text'>Search</Label>
                <Input
                    id='Search'
                    name='Search'
                    type='Text'
                    placeholder='Enter Item you want to search'
                    onChange={this.handleChange}
                    value={this.state.text}
                    className="input is-rounded"
                />
            </form>
            <h1 className="title">{this.state.title}</h1>
            <div className="container is-fluid " >
            <div  dangerouslySetInnerHTML={createMarkup(this.state.query)}/>
            </div>
        </div>);
    }
}
export default Searchbar
