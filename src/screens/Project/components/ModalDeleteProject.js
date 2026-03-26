import React, { useState, useEffect } from 'react'
import { Text, Modal, TouchableOpacity, View, } from 'react-native';
import { FormattedMessage } from 'react-intl';

import { useSelector, useDispatch } from "react-redux";
import { deleteProject } from '../../../redux/actions/Project/project.actions'
import { modalStyle } from "../../../asset/style/components/modalStyle"


const ModalDeleteProject = ({ projectId, projectName }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const projectState = state.project
    const [modalDelete, setModalDelete] = useState(false);

    useEffect(() => {
        if (projectState) {
            setModalDelete(false)
        }
    }, [projectState]);


    const handledeleteProject = () => {
        setModalDelete(!modalDelete)
        dispatch(deleteProject(projectId));
    }

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalDelete}>
                <View style={modalStyle.centeredViewSmall}>

                    <View style={modalStyle.modalView}>
                        <View style={modalStyle.modalViewTitleDelete}>
                            <Text style={modalStyle.modalTitleDelete}>
                                <FormattedMessage id="comments.delete.modal.title" />
                            </Text>
                        </View>
                        <View style={modalStyle.modalInputDelete} >
                            <Text style={modalStyle.modalInputText}><FormattedMessage id="projects.delete.modal.description"/></Text><Text style={modalStyle.bold}>{projectName}</Text>
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModalDelete(false)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" /></Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonDelete]} onPress={() => handledeleteProject()}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.confirm" /></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalDelete(true)}>
                <Text style={modalStyle.modalTitleEditDelete}>
                    <FormattedMessage id="common.button.delete" />
                </Text>
            </TouchableOpacity>
        </>
    )
}

export default ModalDeleteProject
