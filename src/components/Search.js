import React from 'react'
import axios from 'axios';
import { Label, Input } from '@rebass/forms'
import { Box } from "rebass"


const Searchbar = (props) => {
    const handleClick=(e)=>{
        e.preventDefault();
        axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&search=${e.target.value}`).then(res=>{
            console.log(res);
        })
    }
    return (
        <div style={{ align: `center` }}>
            <Box width={1 / 2} px={2} onSubmit={e => e.preventDefault()}>
                <Label htmlFor='text'>Search</Label>
                <Input
                    id='Search'
                    name='Search'
                    type='Text'
                    placeholder='Enter Item you want to search'
                    onClick={handleClick}
                />
            </Box>
        </div>
    )
}
export default Searchbar
