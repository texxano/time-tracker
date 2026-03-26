/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Input, Icon } from "native-base";
import SelectFileter from "../../components/SelectFileter";
import { modalStyle } from "../../../../asset/style/components/modalStyle"
import SelectSectorBook from "../../components/SelectSectorBook";
import SelectRequester from "../../components/SelectRequester";

export const Search = ({ onSearch, onPageChange, placeholder, clearSearchParent, value }) => {
    const [search, setSearch] = useState(value);
    const onSearchChange = value => {
        setSearch(value);
        onSearch(value);
        handlePageChange(1)
    };
    const handlePageChange = (pageindex) => {
        onPageChange(pageindex)
    }
    const clearSearch = () => {
        setSearch("")
        onSearch("");
        Keyboard.dismiss()
    }
    useEffect(() => {
        if (clearSearchParent) {
            clearSearch();
        }
    }, [clearSearchParent]);

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

const ModalFilter = ({ modal, setModal, onSearchFilter, filterCode, setFilterCode, search, setSearch, requesterSearch, setRequesterSearch, sectorNameSearch, setSectorNameSearch, setCurrentPage, dataBookSelect, setDataBookSelect }) => {
    const [modalSelectBook, setModalSelectBook] = useState(false);
    const [modalSelectRequester, setModalSelectRequester] = useState(false);

    const handleConfirm = () => {
        onSearchFilter()
        setModal(false)
    };

    const handleCloseModal = () => {
        setModal(false)
    }

    const handleClearFilter = () => {
        setFilterCode('')
        setDataBookSelect({})
        handleClearSearch()
    }
    const [clearSearch, setClearSearch] = useState(false);

    const handleClearSearch = () => {
        setClearSearch(true);
        setTimeout(() => {
            setClearSearch(false);
        }, 100);
    };
    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modal} style={{ height: 500 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={modalStyle.centeredView}>
                            {/* <SelectSectorBook
                                type={1}
                                dataSelect={setDataSectorSelect}
                                selected={dataSectorSelect.name}
                                modal={modalSelectSector}
                                setModal={setModalSelectSector} /> */}
                            <SelectSectorBook
                                type={0}
                                dataSelect={setDataBookSelect}
                                selected={dataBookSelect.name}
                                modal={modalSelectBook}
                                setModal={setModalSelectBook}
                            />
                            <SelectRequester
                                nameOfRequester={setRequesterSearch}
                                modal={modalSelectRequester}
                                setModal={setModalSelectRequester}
                            />
                            <View style={modalStyle.modalView}>
                                <View style={[modalStyle.modalViewTitle, modalStyle.modalViewFlex]}>
                                    <Text style={modalStyle.modalTitle}>
                                        <FormattedMessage id="Filter" />
                                    </Text>
                                    <TouchableOpacity onPress={() => handleClearFilter()} style={[modalStyle.modalViewFlex, { marginRight: 20 }]}>
                                        <Text style={{ fontSize: 16, color: "#6c757d", }}><FormattedMessage id="Clear.Filter" /> </Text>
                                        <MaterialCommunityIcons name="filter-remove-outline" size={24} color="#6c757d" />
                                    </TouchableOpacity>

                                </View>
                                <View style={[modalStyle.modalInput, modalStyle.paddingBottom60, { paddingHorizontal: 17 }]} >
                                    <SelectFileter filterCode={filterCode} setFilterCode={setFilterCode} />


                                    {/* <TouchableOpacity onPress={() => setModalSelectSector(true)} style={{ width: "100%", borderColor: "#d6d6d6", borderRadius: 4, padding: 10, borderWidth: 1, marginBottom: 10 }}>
                                        <Text>
                                            {dataSectorSelect.id ? dataSectorSelect?.name : (<FormattedMessage id="sectors.filter.title" />)}
                                        </Text>
                                    </TouchableOpacity> */}
                                    <Search
                                        onSearch={value => { setSectorNameSearch(value) }}
                                        onPageChange={page => setCurrentPage(page)}
                                        placeholder={"sectors.filter.title"}
                                        clearSearchParent={clearSearch}
                                        value={sectorNameSearch}
                                    />
                                    <TouchableOpacity onPress={() => setModalSelectBook(true)} style={{ width: "100%", borderColor: "#d6d6d6", borderRadius: 4, borderWidth: 1, marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
                                        <View style={{ marginRight: 10, backgroundColor: "#ededed", padding: 10, }}>
                                            <Icon style={{ color: "#aeafb0", fontSize: 18, }} as={<Ionicons name="filter" />} />
                                        </View>
                                        <Text style={{ padding: 10 }}>
                                            {dataBookSelect.id ? dataBookSelect?.name : (<Text style={{ color: "#9a9a9a"}}><FormattedMessage id="document.task.collection.filter.title" /></Text>)}
                                        </Text>
                                    </TouchableOpacity>
                                    <Search
                                        onSearch={value => { setSearch(value) }}
                                        onPageChange={page => setCurrentPage(page)}
                                        placeholder={"document.task.filter.title"}
                                        clearSearchParent={clearSearch}
                                        value={search}
                                    />
                                    <TouchableOpacity onPress={() => setModalSelectRequester(true)} style={{ width: "100%", borderColor: "#d6d6d6", borderRadius: 4, borderWidth: 1, marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
                                        <View style={{ marginRight: 10, backgroundColor: "#ededed", padding: 10, }}>
                                            <Icon style={{ color: "#aeafb0", fontSize: 18, }} as={<Ionicons name="filter" />} />
                                        </View>
                                        <Text style={{ padding: 10 }}>
                                            {requesterSearch ? requesterSearch : (<Text style={{ color: "#9a9a9a"}}><FormattedMessage id="document.task.placeholder.requester" /></Text>)}
                                        </Text>
                                    </TouchableOpacity>

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

export default ModalFilter
