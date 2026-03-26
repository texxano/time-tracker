import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl';
import { Input, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons'
import { Keyboard } from 'react-native';
const Search = ({ onSearch, onPageChange, placeholder}) => {
    const [search, setSearch] = useState("");
    const onSearchChange = value => {
        setSearch(value);
        onSearch(value);
        if (placeholder === "comments.filter.title") {
            handlePageChange("")
        } else {
            handlePageChange(1)
        }
    };
    const handlePageChange = (pageindex) => {
        onPageChange(pageindex)
    }
    const clearSearch = () => {
        setSearch("")
        onSearch("");
        Keyboard.dismiss()
    }
    
    return (
        <>
            <FormattedMessage id={placeholder}>
                {placeholder =>
                    <Input
                        size={"lg"}
                        InputLeftElement={<Icon style={{ margin: 10, marginTop: 15, color: "#aeafb0", fontSize: 18, }} as={<Ionicons name="filter" />} />}
                        InputRightElement={search.length !== 0 ? (<Icon onPress={clearSearch} style={{ margin: 10, marginTop: 15, color: "#aeafb0", fontSize: 18 }} as={<Ionicons name="close-sharp" />} />) : (<></>)}
                        w="100%"
                        type="text"
                        placeholder={placeholder.toString()}
                        value={search}
                        onChangeText={(e) => onSearchChange(e)}
                        my={3}
                        // variant="rounded"
                        style={{ height: 40, backgroundColor: "#fff" }}
                    />
                }
            </FormattedMessage>
        </>
    )
}

export default Search
