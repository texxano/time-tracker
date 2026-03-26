import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Input, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons'

import http from "../../../services/http";
import InitialUser from '../../../components/InitialUser';
import { globalStyles } from "../../../asset/style/globalStyles";

const AddGuests = ({ addGuests, dataSelect }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const state = useSelector(state => state);
    const rootId = state.userDataRole.rootId;
    const userId = state.userDataRole.userId;

    const [dataResponse, setDataResponse] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [dataLength, setDataLength] = useState(true);

    useEffect(() => {
        const getData = async () => {
        if (search.length >= 3) {
            http.get(`/users/search?rootId=${rootId}${currentPage ? `&page=${currentPage}` : ''}&search=${search}`)
                .then((data) => {
                    setTotalPages(data.totalPages);
                    setDataResponse(data.list);
                    setDataLength(data.list.length === 0);
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                    setDataResponse([]);
                    setDataLength(true);
                });
            } else {
                setDataResponse([]);
            }
        };
        getData();
    }, [rootId, currentPage, search]);

    const handleAddGuests = value => {
        addGuests(value);
    };

    const clearSearch = () => {
        setDataResponse([]);
        setSearch("")
        Keyboard.dismiss()
    }

    return (
        <View style={styles.container}>
            <Text><FormattedMessage id="add.users" /></Text>
            {dataLength && search.length > 3 ? (<Text style={globalStyles.dataLength}><FormattedMessage id="users.list.noItems" /> </Text>) : (<>
                <FlatList
                    data={dataResponse}
                    renderItem={({ item, index }) => {
                        const isSelected = dataSelect.some(user => user.id === item.id);
                        return (
                            <View key={index}>
                                {!isSelected ?
                                    <TouchableOpacity onPress={() => isSelected ? handleRemoveGuest(item.id) : handleAddGuests(item)} style={styles.userContainer}>
                                        <InitialUser FirstName={item?.firstName} LastName={item?.lastName} email={item?.email} color={item?.color} />
                                        <View style={{ marginLeft: 20 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>{item?.firstName} {item?.lastName}</Text>
                                            <Text style={{ fontSize: 13 }}>{item?.email}</Text>
                                        </View>
                                    </TouchableOpacity> : null}
                            </View>
                        )
                    }}
                    keyExtractor={item => item.id.toString()}
                    style={styles.searchContainer}
                />
            </>)}
            <Input
                size={"lg"}
                InputRightElement={search.length !== 0 ? (<Icon onPress={clearSearch} style={{ marginLeft: 10, marginRight: 15, color: "#aeafb0", fontSize: 22 }} as={<Ionicons name="close-sharp" />} />) : (<></>)}
                w="100%"
                type="text"
                placeholder={intl.formatMessage({ id: "users.filter.title" })}
                value={search}
                onChangeText={(e) => setSearch(e)}
                mb={3}
                style={{ height: 40, backgroundColor: "#fff" }}
            />
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
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
};

export default AddGuests;
