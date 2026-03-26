/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, TextArea } from "native-base"
// Redux 
import { useSelector, useDispatch } from "react-redux";
import { createTaskName, updateTaskName } from "../../../redux/actions/Task/task.actions"
// Redux
import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalCUDTask = ({ modal, setModal, type, id, nameTask, descriptionTask, projectId }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const state = useSelector(state => state)
    const taskRequest = state.tasks.taskRequest
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState(nameTask);
    const [description, setDescription] = useState(descriptionTask);

    const handleConfirm = () => {
        setSubmitted(true)

        if (type === 0 && name) {
            const payload = { name, description, projectId }
            dispatch(createTaskName(payload))
        } else if (type === 1 && name) {
            const payload = { name, description, id, projectId }
            dispatch(updateTaskName(payload))
        }
    };

    const handleCloseModal = () => {
        setSubmitted(false)
        setModal(false)
        setDescription('')
        setName('')
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
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={modalStyle.centeredView}>
                            <View style={modalStyle.modalView}>
                                <View style={modalStyle.modalViewTitle}>
                                    <Text style={modalStyle.modalTitle}>
                                        {(() => {
                                            if (type === 0) {
                                                return (<FormattedMessage id="Shotgun.Task.Create" />)
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

                                </View>
                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => handleCloseModal(false)}>
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

export default ModalCUDTask
