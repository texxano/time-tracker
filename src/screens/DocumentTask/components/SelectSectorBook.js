/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Input, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons'
import CustomInput from "../../../components/Inputs/CustomInput";
import flex from "../../../asset/style/flex.style";
import colors from "../../../constants/Colors";
import { p } from "../../../asset/style/utilities.style";
// Redux 
import { useSelector } from "react-redux";
// Redux

import http from '../../../services/http'

import { modalStyle } from "../../../asset/style/components/modalStyle"

const SelectSectorBook = ({ modal, setModal, selected, dataSelect, type, sectorSupervisorId }) => {
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data
    const [data, setData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (modal) {
            loadData("");
        }
    }, [modal, type, sectorSupervisorId]);

    const loadData = async (search = "") => {
        try {
            const response = await http.get(`${type ? '/doctask/sectors' : '/doctask/books'}?PageSize=50${search ? `&search=${search}` : ''}`);
            const items = response.list.map(item => ({
                label: item.name,
                value: sectorSupervisorId ? item.sectorSupervisorId : item.id,
                name: item.name,
                id: item.id
            }));
            setData(items);
            if (items.length === 0 && search !== "") {
                setIsSearching(true);
            } else {
                setIsSearching(false);
            }
        } catch (error) {
            setData([]);
            setIsSearching(false);
        }
    };

    const handleInputChange = (val) => {
        setSearchValue(val);
        loadData(val);
    };

    const handleSelect = (item) => {
        setSearchValue(item.label);
        dataSelect({ id: item.value, name: item.name });
        setData([]);
        Keyboard.dismiss();
    };
    const handleConfirm = () => {
        setModal(false)
    };
    const handleCloseModal = () => {
        setData([])
        setSearchValue("")
        setIsSearching(false)
        setModal(false)
    }

    useEffect(() => {
        if (documentTasksState) {
            handleCloseModal()
        }
    }, [documentTasksState]);
    return (
        <>
            <Modal 
                animationType="slide" 
                transparent={true} 
                visible={modal} 
                style={{ height: 500 }}
                presentationStyle="overFullScreen"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[modalStyle.centeredView, { zIndex: 1000 }]}>
                            <View style={[modalStyle.modalView, { zIndex: 1001 }]}>
                                <View style={[modalStyle.modalInput, modalStyle.paddingBottom60, { padding: 17 }]} >
                                    <View style={{}}>
                                        <Text style={styles.title}><FormattedMessage id={type ? "select.sector" : "select.book"} /></Text>
                                        <View style={{ marginBottom: 20 }}>
                                            <CustomInput
                                                type="text"
                                                name="sectorBook"
                                                label={type ? "sectors.filter.title" : "book.filter.title"}
                                                placeholder={type ? "sectors.filter.title" : "book.filter.title"}
                                                value={searchValue}
                                                onChange={handleInputChange}
                                            />
                                            {data?.length > 0 && (
                                                <View style={styles.dropdownContainer}>
                                                    <ScrollView
                                                        style={{ maxHeight: 200 }}
                                                        keyboardShouldPersistTaps="handled"
                                                        nestedScrollEnabled={true}
                                                    >
                                                        {data.map((item) => (
                                                            <Pressable
                                                                key={item.value.toString()}
                                                                onPress={() => handleSelect(item)}
                                                                style={[styles.dropdownItem, flex.d_flex_center, flex.flex_start, flex.flex_wrap]}
                                                            >
                                                                <Text style={[styles.dropdownTextStyle, p[2]]}>{item.label}</Text>
                                                            </Pressable>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            )}
                                            {isSearching && data.length === 0 && (
                                                <View style={[styles.noItemsBox, flex.d_flex_center, flex.flex_start]}>
                                                    <Text>
                                                        <FormattedMessage id="projects.list.noItems" />
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
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
    dropdownContainer: {
        position: 'relative',
        backgroundColor: colors.white,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gray_100,
        marginTop: 5,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray_80,
    },
    dropdownTextStyle: {
        fontSize: 14,
        color: colors.gray_700,
    },
    noItemsBox: {
        backgroundColor: colors.gray_80,
        padding: 15,
        borderRadius: 4,
        marginTop: 5,
    },
});
export default SelectSectorBook
