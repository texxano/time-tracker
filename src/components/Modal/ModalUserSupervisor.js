/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl';
import { View, Text, TouchableOpacity, Modal, Switch } from 'react-native';
import { useSelector, useDispatch } from "react-redux";
import { Feather } from '@expo/vector-icons';

import { taskUserConfig } from '../../redux/actions/Task/taskUserConfig.actions'
import { calendarUserConfig } from '../../redux/actions/Calender/calendarUserConfig.actions'
import { moneyTrackerUserConfig } from '../../redux/actions/MoneyTracker/moneyTrackerUserConfig.actions'
import { gpsUserConfig } from '../../redux/actions/GPSTracks/gpsUserConfig.actions'

import { modalStyle } from "../../asset/style/components/modalStyle"

const ModalUserSupervisor = ({ dataUser, type }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const tasksState = state.tasks
    const gpsTrackState = state.gpsTrack
    const calendarModuleState = state.calendar
    const moneyTrackerState = state.moneyTracker

    const [modalSupervisor, setModalSupervisor] = useState(false);
    const userId = dataUser?.userId

    useEffect(() => {
        if ( tasksState || gpsTrackState || calendarModuleState || moneyTrackerState) {
            setModalSupervisor(false)
        }
    }, [tasksState, gpsTrackState, calendarModuleState, moneyTrackerState]);

    const [isSupervisor, setIsSupervisor] = useState(dataUser?.isSupervisor);

    const handleOpenModal = () => {
        setModalSupervisor(true)
    }

    const handleisIsSupervisor = () => {
        const payload = { userId, isSupervisor }
        if (type === "Task") {
            dispatch(taskUserConfig(payload))
        } else if (type === "MoneyTracker") {
            dispatch(moneyTrackerUserConfig(payload))
        } else if (type === "Calendar") {
            dispatch(calendarUserConfig(payload))
        } else if (type === "Gps") {
            dispatch(gpsUserConfig(payload))
        }
    }

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalSupervisor}  >
                <View style={modalStyle.centeredViewSmall}>
                    <View style={modalStyle.modalView}>
                        <View style={modalStyle.modalViewTitle}>
                            <Text style={modalStyle.modalTitle}>
                                {dataUser.firstName} {dataUser.lastName}
                            </Text>
                        </View>
                        <View style={[modalStyle.modalInput, modalStyle.bodyModal, { justifyContent: "space-between", padding: 17 }]}>
                            <Text style={{ fontSize: 20, paddingRight: 10 }}><FormattedMessage id="Is.Supervisor" /></Text>
                            <Switch
                                trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                thumbColor={isSupervisor ? "#007bff" : "#f4f3f4"}
                                ios_backgroundColor="#7d7d7d"
                                onValueChange={() => setIsSupervisor(!isSupervisor)}
                                value={isSupervisor}
                            />
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModalSupervisor(false)}>
                                <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.close" /></Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handleisIsSupervisor()}>
                                <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.confirm" /></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity onPress={handleOpenModal}>
                <View style={{ backgroundColor: "#dee2e6", borderRadius: 8, borderWidth: 1, borderColor: "#c7cbcf", padding: 6, marginLeft: 15, alignSelf: 'flex-start' }}>
                    <Feather name="edit" size={20} color="#6c757d" />
                </View>
            </TouchableOpacity>
        </>
    )
}

export default ModalUserSupervisor
