import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";

import { documentTaskSectorsServices } from "../../../services/DocumentTask/documentTaskSectors.Services"
import { documentTasksTypes } from "../../../redux/type/DocumentTask/documentTasks.types"
import ModalDelete2 from '../../../components/Modal/ModalDelete2';
import ModalSector from './ModalSector';

import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalMoreSektor = ({ sector }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const documentTasksState = state.documentTask.data

    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalEditSector, setModalEditSector] = useState(false);
    const success = data => ({ type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data: data });

    const handleDeletedById = async (id) => {
        let request = await documentTaskSectorsServices.deleteDocumentTasksSectors(id)
        if (request.status === 200) {
            dispatch(success(request.url));
        }

    }
    useEffect(() => {
        if (documentTasksState) {
            setModalEditVisible(false)
        }
    }, [documentTasksState]);

    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalEditVisible} style={{ height: 500 }}>
                <ModalSector
                    modal={modalEditSector}
                    setModal={setModalEditSector}
                    type={1}
                    sector={sector}
                />
                <ModalDelete2
                    id={sector.id}
                    description={"document.task.sector.delete.modal.description.this"}
                    deleted={handleDeletedById}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                />
                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalEditVisible(!modalEditVisible)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalEditSector(true)}>
                            <Text style={modalStyle.modalTitleEdit}>
                                <FormattedMessage id="common.button.edit" />
                            </Text>
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
export default ModalMoreSektor
