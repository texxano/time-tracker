/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, FlatList, StyleSheet } from 'react-native';
import { Input, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons'

import http from '../../../services/http'
// Redux 
import { useSelector } from "react-redux";
// Redux
import { documentTaskServices } from "../../../services/DocumentTask/documentTask.Services"
import { modalStyle } from "../../../asset/style/components/modalStyle"


const SelectRequester = ({ modal, setModal, nameOfRequester }) => {
    const intl = useIntl();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data

    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");

    const getSuggestionsSearch = async (value) => {
        setSearch(value)
        if (value.length >= 3) {
            http.get(`/doctask/tasks/requesters?PageSize=10${value ? `&search=${value}` : ''}`)
                .then((data) => {
                    setData(data.list);
                })
        }
    }

    function getSuggestRequester(suggestion) {
        if (suggestion.name) {
            nameOfRequester(suggestion.name)
            setSearch(suggestion.name)
            setData([]);
        }
    }
    const clearSearch = () => {
        setData([]);
        setSearch("")
        dataSelect({ id: "", name: "" })
        Keyboard.dismiss()
    }
    const handleConfirm = () => {
        setModal(false)
    };
    const handleCloseModal = () => {
        setData([])
        setSearch("")
        setModal(false)
    }

    useEffect(() => {
        if (documentTasksState) {
            handleCloseModal()
        }
    }, [documentTasksState]);
    const handleSreateRequesters = async () => {
        let response = await documentTaskServices.createRequesters({ name: search })
        if(response.id){
            getSuggestRequester({name: search })
        }
    }
    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modal} style={{ height: 500 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={modalStyle.centeredView}>
                            <View style={modalStyle.modalView}>
                                <View style={[modalStyle.modalInput, modalStyle.paddingBottom60, { padding: 17 }]} >
                                    <View style={{}}>
                                        {search.length > 3 && data.length === 0 ?
                                            <View style={{ alignItems: "flex-end", paddingBottom: 10 }}>
                                                <TouchableOpacity onPress={() => handleSreateRequesters()} style={[modalStyle.button, modalStyle.buttonBlueOutline]}>
                                                    <Text style={modalStyle.textBlueOutline}><FormattedMessage id="common.button.add.new.requester" /></Text>
                                                </TouchableOpacity>
                                            </View>
                                            : null}
                                        <FlatList
                                            data={data}
                                            renderItem={({ item, index }) => {
                                                return (
                                                    <View key={index}>
                                                        <TouchableOpacity onPress={() => getSuggestRequester(item)} style={styles.userContainer}>
                                                            <View style={{ marginLeft: 10, paddingVertical: 5 }}>
                                                                <Text style={{ fontSize: 17, fontWeight: '500' }}>{item.name}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                            }}
                                            keyExtractor={item => item.id.toString()}
                                            style={styles.searchContainer}
                                        />
                                        <Input
                                            size={"lg"}
                                            InputRightElement={search?.length !== 0 ? (<Icon onPress={clearSearch} style={{ marginLeft: 10, marginRight: 15, color: "#aeafb0", fontSize: 22 }} as={<Ionicons name="close-sharp" />} />) : (<></>)}
                                            w="100%"
                                            type="text"
                                            placeholder={intl.formatMessage({ id: "document.task.placeholder.requester" })}
                                            value={search}
                                            onChangeText={(e) => getSuggestionsSearch(e)}
                                            mb={3}
                                            style={{ height: 40, backgroundColor: "#fff" }} />
                                    </View>
                                </View>
                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => handleCloseModal()}>
                                        <Text style={modalStyle.textStyle}>
                                            <FormattedMessage id="common.button.close" /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={handleConfirm}>
                                        <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.confirm" /></Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

        </>
    )
}
const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        marginBottom: 10
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
export default SelectRequester
