/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Text, Modal, TouchableOpacity, View } from 'react-native';
import { Checkbox } from "native-base"
import { useSelector, useDispatch } from "react-redux";
import { deleteMyPermission } from '../../../redux/actions/Permissions/permissions.actions'
import { FormattedMessage } from 'react-intl';
import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalDeleteMyPermission = ({ projectId, projectTitle }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const permissionsState = state.permissions
    const projectRequest = state.project.projectRequest
    const [childProjects, setChildProjects] = useState(true);
    const [modalPermission, setModalPermission] = useState(false);

    useEffect(() => {
        setModalPermission(false)
    }, [permissionsState]);

    const handleDeleteMyPermission = () => {
        dispatch(deleteMyPermission(projectId, childProjects))

    }

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalPermission}  >
                <View style={modalStyle.centeredView}>
                    <View style={modalStyle.modalView}>
                        <View style={modalStyle.modalViewTitleDelete}>
                            <Text style={modalStyle.modalTitle}><FormattedMessage id="leave.project.modal.description" />  {projectTitle}</Text>
                        </View>
                        <View style={[modalStyle.modalInput, { padding: 17, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} >
                            <Text style={{ fontSize: 18, paddingRight: 10, width: '80%' }}><FormattedMessage id="leave.subproject" /></Text>
                            <Checkbox
                                onChange={() => setChildProjects(!childProjects)}
                                value={childProjects}
                                colorScheme="red"
                            />
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModalPermission(false)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" /></Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonDelete]} onPress={() => handleDeleteMyPermission()} disabled={projectRequest}>
                                <Text style={modalStyle.textStyle}>{projectRequest ? (<ActivityIndicator size="small" color="#fff" />) : (<FormattedMessage id="common.button.confirm" />)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalPermission(true)} >
                <Text style={modalStyle.modalTitleEdit}>
                    {/* <i className="fa-solid fa-arrow-right-from-bracket" style={{ color: "#3c4043e0" }} ></i> */}
                    <FormattedMessage id="leave.project" />
                </Text>
            </TouchableOpacity>
        </>
    )
}

export default ModalDeleteMyPermission
