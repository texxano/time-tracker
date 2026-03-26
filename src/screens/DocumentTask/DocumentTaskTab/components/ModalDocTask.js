/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Input, TextArea } from "native-base"
import DatePicker from 'react-native-neat-date-picker'

// Redux 
import { useSelector, useDispatch } from "react-redux";
import { createDocumentTask, updateDocumentTask } from "../../../../redux/actions/DocumentTask/documentTask.actions"
// Redux

import FormatDateTime from "../../../../components/FormatDateTime";
import { dateFormat } from '../../../../utils/dateFormat'
import DocumentFileListUpload from "./DocumentFileListUpload";

import { modalStyle } from "../../../../asset/style/components/modalStyle"
import SelectSectorBook from "../../components/SelectSectorBook";
import SelectWithSearch from "../../components/SelectWithSearch";
import SelectRequester from "../../components/SelectRequester";


const ModalDocTask = ({ modal, setModal, type, mode, docTaskdata }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState(docTaskdata?.name);
    const [description, setDescription] = useState(docTaskdata?.description);
    const [nameOfRequester, setNameOfRequester] = useState(docTaskdata?.nameOfRequester);
    const [modalSelectRequester, setModalSelectRequester] = useState(false);

    const [dueDate, setDueDate] = useState(docTaskdata?.dueDate ?? "");
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [modalSelectSector, setModalSelectSector] = useState(false);
    const [modalSelectBook, setModalSelectBook] = useState(false);
    const [dataBookSelect, setDataBookSelect] = useState({ id:docTaskdata?.bookId, name:docTaskdata?.bookName});  
    const [dataSectorSelect, setDataSectorSelect] = useState({ id:docTaskdata?.sectorId, name:docTaskdata?.sectorName});
    const [baseNumber, setBaseNumber] = useState(null)
    const [subnumber, setSubNumber] = useState(null)
    const [step, setStep] = useState(true);
    const [bookError, setBookError] = useState(false);
    
    useEffect(() => {
        if (docTaskdata?.name && type) {
            setName(docTaskdata?.name);
            setDescription(docTaskdata?.description);
            setNameOfRequester(docTaskdata?.nameOfRequester);
            setDueDate(docTaskdata?.dueDate ?? "")
        }
    }, [docTaskdata])
    const handleOpenPicker = () => {
        Keyboard.dismiss()
        setShowDatePicker(true)
    }
    const onConfirm = (date) => {
        setShowDatePicker(false)
        if (date) {
            setDueDate(date.date)
        }
    }

    const [files, setFiles] = useState(docTaskdata?.taskDocuments ? docTaskdata?.taskDocuments : [])

    const handleConfirm = () => {
        setSubmitted(true)
        
        // Validate book selection
        if (!dataBookSelect.id) {
            setBookError(true);
            return;
        }
        
        const filesId = files?.map(item => item.id);
        if (type === 0 && name) {
            const payload = {
                name,
                description,
                dueDate: dateFormat(dueDate),
                nameOfRequester,
                documentIds: filesId,
                sectorId: dataSectorSelect.id,
                bookId: dataBookSelect.id,
                number: parseInt(name),
                baseNumber,
                subnumber,
            }


            dispatch(createDocumentTask(payload))
        } else if (type === 1 && name) {
            const documentActions = files?.map(item => ({
                docName: item.name,
                documentId: item.id,
                docAction: 0
            }));

            const payload = {
                id: docTaskdata.id,
                name,
                description,
                dueDate: dateFormat(dueDate),
                documentActions
            }
            dispatch(updateDocumentTask(payload))
        }
    };

    const handleCloseModal = () => {
        setSubmitted(false)
        setModal(false)
        setDescription('')
        setNameOfRequester('')
        setName('')
        setDueDate('')
        setFiles([])
        setBookError(false)
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
                            <DatePicker
                                colorOptions={{ headerColor: '#2196F3', }}
                                isVisible={showDatePicker}
                                mode={'single'}
                                onCancel={() => setShowDatePicker(false)}
                                onConfirm={onConfirm}
                                minDate={new Date()}
                            />

                            <SelectSectorBook
                                type={1}
                                dataSelect={setDataSectorSelect}
                                selected={dataSectorSelect.name}
                                modal={modalSelectSector}
                                setModal={setModalSelectSector} />
                            <SelectSectorBook
                                type={0}
                                dataSelect={setDataBookSelect}
                                selected={dataBookSelect.name}
                                modal={modalSelectBook}
                                setModal={setModalSelectBook}
                            />
                            <SelectRequester
                                nameOfRequester={setNameOfRequester}
                                modal={modalSelectRequester}
                                setModal={setModalSelectRequester}
                            />
                            <View style={modalStyle.modalView}>
                                <View style={modalStyle.modalViewTitle}>
                                    <Text style={modalStyle.modalTitle}>
                                        {(() => {
                                            if (type === 0) {
                                                return (<FormattedMessage id="document.task.create" />)
                                            } else if (type === 1) {
                                                return (<FormattedMessage id="document.task.edit" />)
                                            }
                                        })()}
                                    </Text>
                                </View>
                                <View style={[modalStyle.modalInput, modalStyle.paddingBottom60, { paddingHorizontal: 17 }]} >
                                    {step ?
                                        <>
                                            <TouchableOpacity 
                                                onPress={() => {
                                                    setModalSelectBook(true);
                                                    setBookError(false);
                                                }} 
                                                style={{ 
                                                    width: "100%", 
                                                    borderColor: bookError ? "#ff0000" : "#ccc", 
                                                    borderRadius: 4, 
                                                    padding: 10, 
                                                    borderWidth: 1, 
                                                    marginBottom: bookError ? 5 : 10 
                                                }}
                                            >
                                                <Text style={{ color: dataBookSelect.id ? "#000" : "#9a9a9a" }}>
                                                    {dataBookSelect.id ? dataBookSelect?.name : (<FormattedMessage id="document.task.collection.filter.title" />)}
                                                </Text>
                                            </TouchableOpacity>
                                            {bookError && (
                                                <Text style={{ color: "#ff0000", fontSize: 12, marginBottom: 10 }}>
                                                    <FormattedMessage id="document.task.book.required" />
                                                </Text>
                                            )}
                                            <TouchableOpacity onPress={() => setModalSelectSector(true)} style={{ width: "100%", borderColor: "#ccc", borderRadius: 4, padding: 10, borderWidth: 1, marginBottom: 10 }}>
                                                <Text>
                                                    {dataSectorSelect.id ? dataSectorSelect?.name : (<Text style={{ color: "#9a9a9a"}}><FormattedMessage id="sectors.filter.title" /></Text>)}
                                                </Text>
                                            </TouchableOpacity>
                                            <FormattedMessage id="document.number">
                                                {placeholder =>
                                                    <Input
                                                        size={"lg"}
                                                        _focus
                                                        w="100%"
                                                        type="text"
                                                        placeholder={placeholder.toString()}
                                                        value={name}
                                                        onChangeText={(e) => setName(e)}
                                                        my={3}
                                                        keyboardType="numeric"
                                                        style={{ height: 40, backgroundColor: "#fff" }}
                                                    />
                                                }
                                            </FormattedMessage>
                                            {mode ?
                                                <TouchableOpacity onPress={() => setModalSelectRequester(true)} style={{ width: "100%", borderColor: "#ccc", borderRadius: 4, padding: 10, borderWidth: 1, marginBottom: 10 }}>
                                                    <Text>
                                                        {nameOfRequester ? nameOfRequester : (<Text style={{ color: "#9a9a9a" }}><FormattedMessage id="document.task.placeholder.requester" /></Text>)}
                                                    </Text>
                                                </TouchableOpacity>
                                                : <></>}
                                        </> : <>
                                            <FormattedMessage id="projects.form.description.placeholder">
                                                {placeholder =>
                                                    <TextArea
                                                        size={"lg"}
                                                        _focus
                                                        w="100%"
                                                        type="text"
                                                        placeholder={placeholder.toString()}
                                                        value={description}
                                                        onChangeText={(e) => setDescription(e)}
                                                        my={3}
                                                        style={{ backgroundColor: "#fff" }}
                                                    />
                                                }
                                            </FormattedMessage>
                                            <SelectWithSearch modal={modal} setBaseNumber={setBaseNumber} setSubNumber={setSubNumber} />
                                            <TouchableOpacity onPress={() => handleOpenPicker()} style={{ width: "100%", borderColor: "#ccc", borderRadius: 4, padding: 10, borderWidth: 1, marginBottom: 10 }}>
                                                <Text>
                                                    {dueDate ? (<FormatDateTime datevalue={dueDate} type={1} />) : (<FormattedMessage id="Date" />)}
                                                </Text>
                                            </TouchableOpacity>
                                            <View style={{ width: "100%" }}>
                                                <DocumentFileListUpload files={files} setFiles={setFiles} type={0} viewList={true}/>
                                            </View>
                                        </>}
                                    <View style={{ alignItems: "flex-end", paddingBottom: 10 }}>
                                        <TouchableOpacity onPress={() => setStep(!step)} style={[modalStyle.button, modalStyle.buttonBlueOutline]}>
                                            <Text style={modalStyle.textBlueOutline}>{step ? <>Next {">"}</> : <>{"<"}Previous</>}</Text>
                                        </TouchableOpacity>
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

export default ModalDocTask
