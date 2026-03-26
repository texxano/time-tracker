import React, { useState, useEffect } from 'react'
import { Text, Modal, TouchableOpacity, View, } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { MaterialIcons } from '@expo/vector-icons';

import { useSelector } from "react-redux";
import { modalStyle } from "../../asset/style/components/modalStyle"

const ModalDelete = ({ id, description, deleted, type }) => {
    const state = useSelector(state => state)
    const [modalDelete, setModalDelete] = useState(false);
    const documentsState = state.documents
    const commentState = state.comment
    const devicesState = state.devices
    const notificationsState = state.notifications
    const trackingState = state.timeTracks.data
    const reportsState = state.reports.data
    useEffect(() => {
        if (documentsState || commentState || devicesState || notificationsState || trackingState || reportsState) {
            setModalDelete(false)
        }
    }, [documentsState, commentState, devicesState, notificationsState, trackingState, reportsState]);

    const handleOpenModal = () => {
        setModalDelete(true)
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
                            <Text style={modalStyle.modalInputText}><FormattedMessage id={description}/></Text>
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModalDelete(false)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" /></Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonDelete]} onPress={() => deleted(id)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.delete" /></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {type === 0 ? (
                <TouchableOpacity style={modalStyle.btnCircle} onPress={handleOpenModal}>
                    <MaterialIcons name="delete" size={20} color="#6c757d" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={modalStyle.deleteItem} onPress={handleOpenModal}>
                    <MaterialIcons name="delete" size={20} color="#fff" />
                </TouchableOpacity>
            )}
        </>
    )
}

export default ModalDelete
