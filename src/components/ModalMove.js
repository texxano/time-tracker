/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, FlatList, StyleSheet } from 'react-native';
import { Input, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons'

import http from '../services/http'
// Redux 
import { useSelector, useDispatch } from "react-redux";
import { moveDocumentTask } from "../redux/actions/DocumentTask/documentTask.actions"
import { moveProject } from "../redux/actions/Project/project.actions";
// Redux

import { modalStyle } from "../asset/style/components/modalStyle"


const ModalMove = ({ modal, setModal, idProps, type }) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data
    const [submitted, setSubmitted] = useState(false);

    const [data, setData] = useState([]);
    const [id, setId] = useState(null);
    const [search, setSearch] = useState("");

    const getSuggestionsSearch = async (value) => {
        setSearch(value)
        if (value.length >= 3 ) {
            http.get(`${type ? '/projects/globalsearch/?searchType=0' : '/doctask/sectors?PageSize=10'}${value ? `&search=${value}` : ''}`)
                .then((data) => {
                    setData(data.list);
                })
        }
    }

    function getSuggestProject(suggestion) {
        if (suggestion.id) {
            setId(suggestion.id)
            setSearch(suggestion.content)
            setData([]);
        }
    }
    const clearSearch = () => {
        setData([]);
        setSearch("")
        setId(null)
        Keyboard.dismiss()
    }
    const handleConfirm = () => {
        setSubmitted(true)
        if (id) {
            if (type === 1) {
                const payload = {
                    newParentId: id,
                    projectId: idProps
                }
                dispatch(moveProject(payload))
            } else {
                const payload = {
                    newSectorId: id,
                    documentTaskId: idProps
                }
                dispatch(moveDocumentTask(payload))
            }
        };
    };
    const handleCloseModal = () => {
        setModal(false)
        setData([])
        setId(null)
        setSearch("")
    }


    useEffect(() => {
        if (documentTasksState) {
            handleCloseModal()
        }
    }, [documentTasksState]);

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
                                        <Text style={styles.title}><FormattedMessage id={type ? "Select.Project" : "select.sector"} /></Text>
                                        <FlatList
                                            data={data}
                                            renderItem={({ item, index }) => {
                                                return (
                                                    <View key={index}>
                                                        <TouchableOpacity onPress={() => getSuggestProject(item)} style={styles.userContainer}>
                                                            <View style={{ marginLeft: 10, paddingVertical: 5 }}>
                                                                <Text style={{ fontSize: 17, fontWeight: '500' }}>{type ? item?.content : item.name}</Text>
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
                                            InputRightElement={search.length !== 0 ? (<Icon onPress={clearSearch} style={{ marginLeft: 10, marginRight: 15, color: "#aeafb0", fontSize: 22 }} as={<Ionicons name="close-sharp" />} />) : (<></>)}
                                            w="100%"
                                            type="text"
                                            placeholder={intl.formatMessage({ id: type ? "projects.filter.title" : "sectors.filter.title" })}
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
export default ModalMove
