import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";
import { modalStyle } from "../../../asset/style/components/modalStyle"
import ModalDelete2 from "../../../components/Modal/ModalDelete2";
import ModalCUDUserProjectCharge from './ModalCUDUserProjectCharge';

import { deleteUserProjectCharge } from "../../../redux/actions/TimeTracks/timeProjectCharge.actions"

const ModalMoreProjectCharge = ({ data }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const timeTracksRequest = state.timeTracks.timeTracksRequest

    const [modalMore, setModalMore] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);

    useEffect(() => {
        if (timeTracksRequest) {
            setModalMore(false)
        }
    }, [timeTracksRequest]);

    const handleDeletedById = (id) => {
        dispatch(deleteUserProjectCharge(id));
    };

    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalMore} style={{ height: 500 }}>
                <ModalDelete2
                    id={data.id}
                    description={"delete.project.charget.delete.modal.description.this"}
                    deleted={handleDeletedById}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                    data={data.projectTitle}
                />
                <ModalCUDUserProjectCharge
                    modal={modalEdit}
                    setModal={setModalEdit}
                    type={2}
                    id={data.id}
                    pricePerHourSelect={data.pricePerHour}
                    currencyCodeSelect={data.currencyCode}
                />

                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalMore(!modalMore)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalEdit(true)}>
                            <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="common.button.edit" /></Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalDelete(true)}>
                            <Text style={modalStyle.modalTitleEditDelete}><FormattedMessage id="common.button.delete" /></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity onPress={() => setModalMore(!modalMore)} style={{ height: 24 }}>
                <Text><Feather name="more-vertical" size={24} color="#6c757d" /></Text>
            </TouchableOpacity>

        </>
    )
}
export default ModalMoreProjectCharge
