import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";

import { NavigationService } from "../../../navigator";
import { deleteShiftTemplate } from "../../../redux/actions/TimeTracks/timeShiftTemplates.actions"

import ModalCUDShiftTemplate from './CUDShiftTemplates';
import ModalDelete2 from "../../../components/Modal/ModalDelete2";

import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalModalMoreShiftTemplate = ({ name, id }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const trackingState = state.timeTracks

    const [modalMore, setModalMore] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalEditNameShift, setModalEditNameShift] = useState(false);

    useEffect(() => {
        if (trackingState) {
            setModalMore(false)
        }
    }, [trackingState]);

    const handleDeletedById = (id) => {
        dispatch(deleteShiftTemplate(id));
    };

    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalMore} style={{ height: 500 }}>
                <ModalDelete2
                    id={id}
                    description={"time.shift.templete.delete.modal.description.this"}
                    deleted={handleDeletedById}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                    data={name}
                />
                <ModalCUDShiftTemplate
                    modal={modalEditNameShift}
                    setModal={setModalEditNameShift}
                    type={1}
                    id={id}
                    nameShift={name}
                />

                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalMore(!modalMore)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalEditNameShift(true)}>
                            <Text style={modalStyle.modalTitleEdit}>
                                <FormattedMessage id="Edit.Name.Shift.Templeate" />
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => { NavigationService.navigate('Time', { locationActive: "0", id: id }); }}>
                            <Text style={modalStyle.modalTitleEdit}>
                                <FormattedMessage id="Edit.Day.Shift.Templeatet" />
                            </Text>
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
export default ModalModalMoreShiftTemplate
