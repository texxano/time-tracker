import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";
import ModalDelete2 from "../../../../components/Modal/ModalDelete2";
import ModalDocTask from './ModalDocTask';
import { NavigationService } from "../../../../navigator";
import { deleteDocumentTask } from "../../../../redux/actions/DocumentTask/documentTask.actions"
import ModalMoveTask from '../../../../components/ModalMove';
import ModalSubTaskStatusButton from './ModalSubTaskStatusButton';
import { modalStyle } from "../../../../asset/style/components/modalStyle"

const ModalMoreDocumentTask = ({ docTaskdata }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data
    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalEditDocTask, setModalEditDocTask] = useState(false);
    const [modalMoveDocTask, setModalMoveDocTask] = useState(false);
    const [modalComplete, setModalComplete] = useState(false);

    const handleDeletedById = (id) => {
        dispatch(deleteDocumentTask(id));
    };

    useEffect(() => {
        if (documentTasksState) {
            setModalEditVisible(false)
        }
    }, [documentTasksState]);

    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalEditVisible} style={{ height: 500 }}>
                <ModalDelete2
                    id={docTaskdata.id}
                    description={"document.task.delete.modal.description.this"}
                    deleted={handleDeletedById}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                />
                <ModalDocTask
                    modal={modalEditDocTask}
                    setModal={setModalEditDocTask}
                    type={1}
                    mode={0}
                    docTaskdata={docTaskdata}
                />
                <ModalMoveTask
                    modal={modalMoveDocTask}
                    setModal={setModalMoveDocTask}
                    idProps={docTaskdata.id}
                    type={0}
                />
                <ModalSubTaskStatusButton
                    id={docTaskdata.id} type={2}
                    modal={modalComplete}
                    setModal={setModalComplete}
                />
                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalEditVisible(!modalEditVisible)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalEditDocTask(true)}>
                            <Text style={modalStyle.modalTitleEdit}>
                                <FormattedMessage id="common.button.edit" />
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => { NavigationService.navigate('DocumentTask', { locationActive: "1", id: docTaskdata.id }) }}>
                            <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="document.task.edit" /></Text>
                        </TouchableOpacity>


                        {/* <TouchableOpacity  style={modalStyle.modalTitleEditView}   onPress={() => history.push(`/task/1/${data.id}/1`)()}>
                                
                                <FormattedMessage id="document.task.step.edit" />
                            </TouchableOpacity> */}

                        {docTaskdata.isCompleted === false ? (
                            <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalComplete(true)}>
                                <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="projects.form.status.completed" /></Text>
                            </TouchableOpacity>
                        ) : (<></>)}
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalMoveDocTask()}>
                            <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="document.task.move" /></Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalDelete(true)}>
                            <Text style={modalStyle.modalTitleEditDelete}><FormattedMessage id="common.button.delete" /></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity onPress={() => setModalEditVisible(!modalEditVisible)} style={{ height: 24 }}>
                <Text><Feather name="more-vertical" size={24} color="#6c757d" /></Text>
            </TouchableOpacity>

        </>
    )
}
export default ModalMoreDocumentTask
