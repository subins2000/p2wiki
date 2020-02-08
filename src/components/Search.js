import React from 'react'
import { Label, Input } from '@rebass/forms'
import { Box } from "rebass"

const Searchbar = (props) => {
    return (
        <div style={{ align: `center` }}>
            <Box width={1 / 2} px={2} onSubmit={e => e.preventDefault()}>
                <Label htmlFor='text'>Search</Label>
                <Input
                    id='Search'
                    name='Search'
                    type='Text'
                    placeholder='Enter Item you want to search'
                />
            </Box>
        </div>
    )
}
export default Searchbar
