/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import DatePicker from 'react-native-neat-date-picker'
import { Text, Modal, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Input, ScrollView, TextArea } from "native-base"

// Redux 
import { useSelector, useDispatch } from "react-redux";
import { createDocumentSubTask, updateDocumentSubTask } from "../../../../redux/actions/DocumentTask/documentSubTask.actions"

// Redux
import FormatDateTime from "../../../../components/FormatDateTime";
import { dateFormat } from '../../../../utils/dateFormat'
import { modalStyle } from "../../../../asset/style/components/modalStyle"
import SelectUser from "../../../../components/SelectUser";
import DocumentFileListUpload from "./DocumentFileListUpload";
import SelectSectorBook from "../../components/SelectSectorBook";

const ModalSubTask = ({ id, type, modal, setModal, data }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data
    const intl = useIntl()

    const [showDatePicker, setShowDatePicker] = useState(null)

    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState(data?.name || "");
    const [description, setDescription] = useState(data?.description || "");
    const [dueDate, setDueDate] = useState(data?.dueDate || "");
    const [userId, setUserId] = useState(type === 1 ? data?.userId : "");
    const [files, setFiles] = useState(data?.subtaskDocuments ? data?.subtaskDocuments : [])
    const [requestFor, setRequestFor] = useState(0);
    const [modalSelectSector, setModalSelectSector] = useState(false);
    const [dataSectorSelect, setDataSectorSelect] = useState({ id: data?.sectorId, name: data?.sectorName });

    const onConfirm = (date) => {
        setShowDatePicker(false)
        if (date) {
            setDueDate(date.date)
        }
    }

    const handleStep = () => {
        const isValid = (values) => values.every(value => value !== null && value !== undefined && value !== '');
        if (type === 0) {
            const payload = {
                documentTaskId: id,
                userId,
                name,
                description,
                dueDate: dateFormat(dueDate),
                subtaskCommunicationType: 0
            };
            if (submitted && !isValid([userId, name, dueDate])) {

            } else if (!isValid([userId, name, dueDate])) {

            } else {
                dispatch(createDocumentSubTask(payload));
            }
        } else if (type === 1) {
            const documentActions = files?.map(item => ({
                docName: item.name,
                documentId: item.id,
                docAction: 0
            }));
            const payload = { id, name, description, assigneeId: data?.userId, dueDate, documentActions };
            if (isValid([id, name, dueDate]) && new Date(dueDate).getTime() > 0) {
                dispatch(updateDocumentSubTask(payload));
            }
        }
    };

    const handleBetween = () => {
        setSubmitted(true)
        if (submitted && !files && files?.length === 0 && !dueDate) {
            return
        }
        const filesId = files?.map(item => item.id);

        const payload = {
            documentTaskId: id,
            userId: dataSectorSelect.id,
            name,
            description,
            dueDate: dateFormat(dueDate),
            documentIds: filesId,
            subtaskCommunicationType: 1
        }
        if (!dataSectorSelect.id && !name && !dueDate && !dueDate) {
        } else if (!dataSectorSelect.id || !name || !dueDate || !dueDate) {
        } else {
            dispatch(createDocumentSubTask(payload));
        }
    }
    const handleOpenPicker = () => {
        Keyboard.dismiss()
        setShowDatePicker(true)
    }
    const handleCloseModal = () => {
        setSubmitted(false)
        setDescription('')
        setName('')
        setModal(false)
        setDueDate("")
        setUserId("")
        setFiles([])
    }

    useEffect(() => {
        if (documentTasksState) {
            handleCloseModal()
        }
    }, [documentTasksState]);


    useEffect(() => {
        setName(!requestFor ? intl.formatMessage({ id: 'default.internal.subtask.title.name' }) : intl.formatMessage({ id: 'default.between.sectors.subtask.title.name' }))
    }, [requestFor])


    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modal} style={{ height: 500 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <View style={modalStyle.centeredView}>
                        <DatePicker
                            colorOptions={{ headerColor: '#2196F3', }}
                            isVisible={showDatePicker}
                            mode={'single'}
                            onCancel={() => setShowDatePicker(false)}
                            onConfirm={onConfirm}
                            minDate={new Date()}
                        />

                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                            <View style={modalStyle.modalView}>
                                <View style={modalStyle.modalViewTitle}>
                                    <Text style={modalStyle.modalTitle}>
                                        {(() => {
                                            if (type === 0) {
                                                return (<FormattedMessage id="New.Step.In.Task" />)
                                            } else if (type === 1) {
                                                return (<FormattedMessage id="document.task.edit" />)
                                            }
                                        })()}
                                    </Text>
                                </View>
                                {!type && 
                                <View style={styles.viewHeader}>
                                    <TouchableOpacity onPress={() => setRequestFor(0)} style={requestFor === 0 ? styles.box : styles.box2} >
                                        <Text style={requestFor === 0 ? styles.title : styles.title2} > <FormattedMessage id="internal.sector.subtask" /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setRequestFor(1)} style={requestFor === 1 ? styles.box : styles.box2} >
                                        <Text style={requestFor === 1 ? styles.title : styles.title2} ><FormattedMessage id="between.sectors.subtask" /></Text>
                                    </TouchableOpacity>
                                </View>}
                                <ScrollView style={[modalStyle.modalInput, modalStyle.paddingBottom60, { paddingHorizontal: 17 }]} >
                                    <FormattedMessage id="Time.Shift.form.name.placeholder">
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
                                                style={{ height: 40, backgroundColor: "#fff" }}
                                            />
                                        }
                                    </FormattedMessage>
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

                                    <TouchableOpacity onPress={() => handleOpenPicker()} style={{ width: "100%", borderColor: "#ccc", borderRadius: 4, padding: 10, borderWidth: 1, marginBottom: 10 }}>
                                        <Text>
                                            {dueDate ? (<FormatDateTime datevalue={dueDate} type={1} />) : (<FormattedMessage id="Date" />)}
                                        </Text>
                                    </TouchableOpacity>
                                    {requestFor === 0 ? (
                                        <SelectUser setUserId={setUserId} />
                                    ) : (<>
                                        <TouchableOpacity onPress={() => setModalSelectSector(true)} style={{ width: "100%", borderColor: "#ccc", borderRadius: 4, padding: 10, borderWidth: 1, marginBottom: 10 }}>
                                            <Text>
                                                {dataSectorSelect.id ? dataSectorSelect?.name : (<Text style={{ color: "#9a9a9a" }}><FormattedMessage id="sectors.filter.title" /></Text>)}
                                            </Text>
                                        </TouchableOpacity>
                                        <DocumentFileListUpload files={files} setFiles={setFiles} type={1}  viewList={true}/>
                                    </>)}
                                    <SelectSectorBook
                                        type={1}
                                        dataSelect={setDataSectorSelect}
                                        selected={dataSectorSelect.name}
                                        modal={modalSelectSector}
                                        setModal={setModalSelectSector}
                                        sectorSupervisorId={true}
                                    />
                                </ScrollView>
                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => handleCloseModal()}>
                                        <Text style={modalStyle.textStyle}>
                                            <FormattedMessage id="common.button.close" /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={requestFor === 0 ? handleStep: handleBetween}>
                                        <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.confirm" /></Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    )
}
const styles = StyleSheet.create({
    viewHeader: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        backgroundColor: '#ebf0f3',
        borderRadius: 10,
        padding: 5,
        alignItems: "center",
        marginBottom: 10
    },
    box: {
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    box2: {
        alignItems: "center",
        padding: 5,
    },
    title: {
        color: "#007bff",
        fontSize: 14,
        fontWeight: '600'
    },
    title2: {
        color: "#21252980",
        fontSize: 14,
        fontWeight: '600'
    },
});
export default ModalSubTask
