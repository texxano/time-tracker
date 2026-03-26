import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";
import { modalStyle } from "../../../asset/style/components/modalStyle"
import ModalDelete2 from "../../../components/Modal/ModalDelete2";
// import ModalCUDTask from './ModalCUDTask';
import { NavigationService } from "../../../navigator";
import { deleteByIdTimeTrack, createManualTimeTrack, startTimeTrackForProject } from "../../../redux/actions/TimeTracks/timeTracks.actions"


const ModalMoreTimeTracks = ({ data }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const timeTracksRequest = state.timeTracks.timeTracksRequest
    const isTrackingState = state.isTimeTracks.isTracking

    const [modalMore, setModalMore] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalCreatePayment, setModalCreatePayment] = useState(false);
    const [modalUpdateInvoice, setModalUpdateInvoice] = useState(false);

    useEffect(() => {
        if (timeTracksRequest) {
            setModalMore(false)
        }
    }, [timeTracksRequest]);

    const handleDuplicate = () => {
        const dataBody = {
            projectId: data.projectId,
            start: new Date(data.start).toISOString(),
            stop: new Date(data.stop).toISOString(),
            description: data.description
        }
        dispatch(createManualTimeTrack(dataBody));
    }
    const handlePlayAgain = () => {
        const dataBody = { projectId: data?.projectId || null, description: data?.description || null }
        dispatch(startTimeTrackForProject(dataBody));
    }

    const handleDeletedById = (id) => {
        dispatch(deleteByIdTimeTrack(id));
    };
    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modalMore} style={{ height: 500 }}>
                <ModalDelete2
                    id={data.id}
                    description={"money-tracker.delete.invoice.description.this"}
                    deleted={handleDeletedById}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                />

                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalMore(!modalMore)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handleDuplicate()}>
                            <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="duplicate.tiem.track" /> </Text>
                        </TouchableOpacity>
                        {!isTrackingState &&
                            <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => handlePlayAgain()}>
                                <Text style={modalStyle.modalTitleEdit}><FormattedMessage id="play.again.tiem.track" /></Text>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalUpdateInvoice(true)}>
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
export default ModalMoreTimeTracks
