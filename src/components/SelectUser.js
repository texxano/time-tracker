import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Input, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons'

import http from "../services/http";
import InitialUser from './InitialUser';

const SelectUser = ({ setUserId }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const state = useSelector(state => state);
    const rootId = state.userDataRole.rootId;
    const userId = state.userDataRole.userId;

    const [dataResponse, setDataResponse] = useState([]);
    const [search, setSearch] = useState('');
    const [dataLength, setDataLength] = useState(true);

    const getSuggestionsSearch = (search) => {
        setSearch(search)
        if (search.length >= 3 ) {
            http.get(`/users/search?rootId=${rootId}&search=${search}`)
                .then((data) => {
                    setDataResponse(data.list);
                    setDataLength(data.list.length === 0);
                })
                .catch(error => {
                    setDataResponse([]);
                    setDataLength(true);
                });
        } else {
            setDataResponse([]);
        }
    }

    const clearSearch = () => {
        setDataResponse([]);
        setSearch("")
        setUserId("")
        Keyboard.dismiss()
    }
    const handleSelect = (item) => {
        setUserId(item.id)
        setDataResponse([]);
        setSearch(`${item.firstName} ${item.lastName}`)
    }

    return (
        <View style={styles.container}>
            {!dataLength ? (<>
                <FlatList
                    data={dataResponse}
                    renderItem={({ item, index }) => {
                        return (
                            <View key={index}>
                                <TouchableOpacity onPress={() => handleSelect(item)} style={styles.userContainer}>
                                    <InitialUser FirstName={item?.firstName} LastName={item?.lastName} email={item?.email} color={item?.color} />
                                    <View style={{ marginLeft: 20 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>{item?.firstName} {item?.lastName}</Text>
                                        <Text style={{ fontSize: 13 }}>{item?.email}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    }}
                    keyExtractor={item => item.id.toString()}
                    style={styles.searchContainer}
                />
            </>) : null}
            <Input
                size={"lg"}
                InputRightElement={search.length !== 0 ? (<Icon onPress={clearSearch} style={{ marginLeft: 10, marginRight: 15, color: "#aeafb0", fontSize: 22 }} as={<Ionicons name="close-sharp" />} />) : (<></>)}
                w="100%"
                type="text"
                placeholder={intl.formatMessage({ id: "users.filter.selsect.title" })}
                value={search}
                onChangeText={(e) => getSuggestionsSearch(e)}
                mb={3}
                style={{ height: 40, backgroundColor: "#fff" }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 10
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        paddingHorizontal: 4
    },
    searchContainer: {
        borderWidth: 0.5,
        borderColor: '#ccc',
        backgroundColor: "#fff",
        borderRadius: 4
    },
});

export default SelectUser;
