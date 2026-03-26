import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";
import { modalStyle } from "../../../asset/style/components/modalStyle"
import ModalDelete2 from "../../../components/Modal/ModalDelete2";
import ModalCUDTask from './ModalCUDTask';
import { NavigationService } from "../../../navigator";
import { deleteTask, completeAllTasks } from "../../../redux/actions/Task/task.actions"

const ModalMoreTaks = ({ taskdata }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const taskRequest = state.tasks.taskRequest

    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalEditNameShift, setModalEditNameShift] = useState(false);

    const handleDeletedById = (id) => {
        dispatch(deleteTask(id));
    };
    const handlecompleteAllTasks = () => {
        dispatch(completeAllTasks(taskdata.id));
    };

    useEffect(() => {
        if (taskRequest) {
            setModalEditVisible(false)
        }
    }, [taskRequest]);

    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalEditVisible} style={{ height: 500 }}>
                <ModalDelete2
                    id={taskdata.id}
                    description={"shotgun.task.delete.modal.description.this"}
                    deleted={handleDeletedById}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                />
                <ModalCUDTask
                    modal={modalEditNameShift}
                    setModal={setModalEditNameShift}
                    type={1}
                    id={taskdata.id}
                    nameTask={taskdata.name}
                    descriptionTask={taskdata.description}
                />
                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalEditVisible(!modalEditVisible)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalEditNameShift(true)}>
                            <Text style={modalStyle.modalTitleEdit}>
                                <FormattedMessage id="common.button.edit" />
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => { NavigationService.navigate('Task', { locationActive: "1", id: taskdata.id }) }}>
                            <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="Shotgun.Task.Edit" /></Text>
                        </TouchableOpacity>


                        {/* <TouchableOpacity  style={modalStyle.modalTitleEditView}   onPress={() => history.push(`/task/1/${data.id}/1`)()}>
                                
                                <FormattedMessage id="Shotgun.Task.Step.Edit" />
                            </TouchableOpacity> */}

                        {taskdata.isCompleted === false ? (
                            <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handlecompleteAllTasks()}>
                                <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="projects.form.status.completed" /></Text>
                            </TouchableOpacity>
                        ) : (<></>)}

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
export default ModalMoreTaks
