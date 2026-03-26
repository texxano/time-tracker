/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { FormattedMessage } from 'react-intl';
import DatePicker from 'react-native-neat-date-picker'
import { Text, Modal, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, TextArea } from "native-base"

// Redux 
import { useSelector, useDispatch } from "react-redux";
import { createStepTask, updateStepTask } from "../../../redux/actions/Task/stepTask.actions"

// Redux
import FormatDateTime from "../../../components/FormatDateTime";
import { dateFormat } from '../../../utils/dateFormat'
import { modalStyle } from "../../../asset/style/components/modalStyle"
import SelectUser from "../../../components/SelectUser";

const ModalEditStepTask = ({ id, type, modal, setModal, data }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const taskRequest = state.tasks.taskRequest

    const [showDatePicker, setShowDatePicker] = useState(null)

    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState(data?.name || "");
    const [description, setDescription] = useState(data?.description || "");
    const [dueDate, setDueDate] = useState(data?.dueDate || "");
    const [userId, setUserId] = useState('');

    const onConfirm = (date) => {
        setShowDatePicker(false)
        if (date) {
            setDueDate(date.date)
        }
    }
    const handleStep = () => {
        const isValid = (values) => values.every(value => value !== null && value !== undefined && value !== '');
        if (type === 0) {
            const payload = { taskId: id, userId, name, description, dueDate: dateFormat(dueDate) };
            if (submitted && !isValid([userId, name, dueDate])) {

            } else if (!isValid([userId, name, dueDate])) {

            } else {
                dispatch(createStepTask(payload));
            }
        } else if (type === 1) {
            const payload = { id, name, description, dueDate };
            if (isValid([id, name, dueDate]) && new Date(dueDate).getTime() > 0) {
                dispatch(updateStepTask(payload));
            }
        }
    };

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
    }
    useEffect(() => {
        if (taskRequest) {
            handleCloseModal()
        }
    }, [taskRequest]);
    
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
                                                return (<FormattedMessage id="Shotgun.Task.Edit" />)
                                            }
                                        })()}
                                    </Text>
                                </View>
                                <View style={[modalStyle.modalInput, modalStyle.paddingBottom60, { paddingHorizontal: 17 }]} >
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
                                    <TouchableOpacity onPress={() => handleOpenPicker()} style={{ width: "100%", borderColor: "#ccc", borderRadius: 4, padding: 10, borderWidth: 1 }}>
                                        <Text>
                                            {dueDate ? (<FormatDateTime datevalue={dueDate} type={1} />) : (<FormattedMessage id="Date" />)}
                                        </Text>
                                    </TouchableOpacity>
                                    {type === 0 ? (
                                        <SelectUser setUserId={setUserId} />
                                    ) : (<></>)}
                                </View>
                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => handleCloseModal()}>
                                        <Text style={modalStyle.textStyle}>
                                            <FormattedMessage id="common.button.close" /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={handleStep}>
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

export default ModalEditStepTask
