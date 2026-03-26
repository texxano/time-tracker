/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl';
import { Text, Modal, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { TextArea } from "native-base"
import { useSelector, useDispatch } from "react-redux";
import { completeDocumentSubTask, rollbackDocumentSubTask, } from "../../../../redux/actions/DocumentTask/documentSubTask.actions"
import { completeAllDocumentSubTasks } from "../../../../redux/actions/DocumentTask/documentTask.actions"

import { modalStyle } from "../../../../asset/style/components/modalStyle"
import DocumentFileListUpload from './DocumentFileListUpload';

const ModalSubTaskStatusButton = ({ id, type, modal, setModal }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([])

    useEffect(() => {
        if (documentTasksState) {
            setModal(false)
        }
    }, [documentTasksState]);

    const handleStep = () => {
        const filesId = files?.map(item => item.id);
        const payload = { id, conclusion: comment, documentIds: filesId }
        if (type === 0) {
            dispatch(completeDocumentSubTask(payload))
        } else if (type === 1) {
            dispatch(rollbackDocumentSubTask(payload))
        } else if (type === 2 || type === 3) {
            const payload = { id, conclusion: comment, documentIds: filesId }
            dispatch(completeAllDocumentSubTasks(id, payload))
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
                                <View style={modalStyle.modalViewTitle}>
                                    <Text style={modalStyle.modalTitle}><FormattedMessage id="comments.delete.modal.title" /></Text>
                                </View>
                                <View style={[modalStyle.modalInput, { paddingHorizontal: 17 }]}>
                                    {(() => {
                                        if (type === 0) {
                                            return (<Text><FormattedMessage id="complete.step.task" /></Text>)
                                        } else if (type === 1) {
                                            return (<Text><FormattedMessage id="rollback.all.step.task" /></Text>)
                                        }
                                    })()}
                                    <FormattedMessage id="Comment.vacation.optional">
                                        {placeholder =>
                                            <TextArea
                                                size={"lg"}
                                                _focus
                                                w="100%"
                                                type="text"
                                                placeholder={placeholder.toString()}
                                                value={comment}
                                                onChangeText={(e) => setComment(e)}
                                                my={3}
                                                style={{ backgroundColor: "#fff" }}

                                            />
                                        }
                                    </FormattedMessage>
                                    <DocumentFileListUpload files={files} setFiles={setFiles} type={1}  viewList={true}/>
                                </View>

                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModal(false)}>
                                        <Text style={modalStyle.textStyle}>
                                            <FormattedMessage id="common.button.close" /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={handleStep}>
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

export default ModalSubTaskStatusButton
