import React, { useEffect } from 'react'
import { Text, Modal, TouchableOpacity, View, } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSelector } from "react-redux";
import TotalWorkTimeTrack from './TotalWorkTimeTrack';

import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalStopTime = ({ handleTimeTrack, modalTimeTracks, setModalTimeTracks, time }) => {
    const state = useSelector(state => state)
    const trackingState = state.timeTracks.data
    useEffect(() => {
        if (trackingState) {
            setModalTimeTracks(false)
        }
    }, [trackingState]);

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalTimeTracks}>
                <View style={modalStyle.centeredViewSmall}>
                    <View style={modalStyle.modalView}>
                        <View style={modalStyle.modalViewTitleDelete}>
                            <Text style={modalStyle.modalTitleDelete}>
                                <FormattedMessage id="comments.delete.modal.title" />
                            </Text>
                        </View>
                        <View style={modalStyle.modalInputDelete} >
                            <Text style={modalStyle.modalInputText}><FormattedMessage id="Are.you.sure.your.job.is.done" /></Text>
                            <Text><FormattedMessage id="You.have.worked.for" /> <TotalWorkTimeTrack startDate={time} stopDate={new Date()} /></Text>
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModalTimeTracks(false)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" /></Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonDelete]} onPress={() => handleTimeTrack(false)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.confirm" /></Text>

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default ModalStopTime
