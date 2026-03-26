/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl';
import { View, Text, TouchableOpacity, Modal, Switch, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from "native-base"
import { useSelector, useDispatch } from "react-redux";
import { Feather } from '@expo/vector-icons';

import { openAiUserConfig, clean } from '../../../redux/actions/OpenAi/openAiUserConfig.actions'
import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalUsersConfigOpenAi = ({ dataUser }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const openAiState = state.openAi?.data
    const failure = state.openAi?.failure
    const [modal, setModal] = useState(false);

    useEffect(() => {
        if (failure === undefined) {
            setModal(false)
        }
    }, [openAiState]);
    
    const userId = dataUser?.userId
    const [monthlyCreditEur, setMonthlyCreditEur] = useState(dataUser?.monthlyCreditEur.toString());
    const [availableCreditEur, setAvailableCreditEur] = useState(dataUser?.availableCreditEur.toString());
    const [isSupervisor, setIsSupervisor] = useState(dataUser?.isSupervisor);

    const handleDefoultValue = () => {
        setMonthlyCreditEur(dataUser?.monthlyCreditEur.toString())
        setAvailableCreditEur(dataUser?.availableCreditEur.toString())
        setIsSupervisor(dataUser?.isSupervisor)
    }
    const handleOpenModal = () => {
        setModal(true)
        dispatch(clean())
        handleDefoultValue()
    }
    const handleCloseModal = () => {
        setModal(false)
        dispatch(clean())
        handleDefoultValue()
    }

    const handleOpenAiConfig = () => {
        const payload = { userId, "monthlyCreditEur": parseInt(monthlyCreditEur), "availableCreditEur": parseInt(availableCreditEur), isSupervisor }
        dispatch(openAiUserConfig(payload))
    }

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modal}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={modalStyle.centeredViewSmall}>
                            <View style={modalStyle.modalView}>
                                <View style={modalStyle.modalViewTitle}>
                                    <Text style={modalStyle.modalTitle}>
                                        {dataUser.firstName} {dataUser.lastName}
                                    </Text>
                                </View>
                                <View style={{ paddingHorizontal: 17, paddingTop: 10 }}>
                                    <View>
                                        <Text style={{ color: "#6c757d", fontSize: 17 }}><FormattedMessage id="monthly.credit" /></Text>
                                        <FormattedMessage id="monthly.credit">
                                            {placeholder =>
                                                <Input
                                                    size={"lg"}
                                                    w="100%"
                                                    my={3}
                                                    keyboardType="numeric"
                                                    value={monthlyCreditEur}
                                                    onChangeText={(e) => setMonthlyCreditEur(e)}
                                                    placeholder={placeholder.toString()}
                                                    InputRightElement={
                                                        <Text style={{ fontSize: 17, fontWeight: '600', color: "#6c757d", paddingRight: 15, }}>€</Text>
                                                    }
                                                    style={{ height: 40, backgroundColor: "#fff" }}
                                                />
                                            }
                                        </FormattedMessage>
                                    </View>
                                    <View>
                                        <Text style={{ color: "#6c757d", fontSize: 17 }}><FormattedMessage id="available.credit" /></Text>
                                        <FormattedMessage id="available.credit">
                                            {placeholder =>
                                                <Input
                                                    size={"lg"}
                                                    w="100%"
                                                    my={3}
                                                    keyboardType="numeric"
                                                    value={availableCreditEur}
                                                    onChangeText={(e) => setAvailableCreditEur(e)}
                                                    placeholder={placeholder.toString()}
                                                    InputRightElement={
                                                        <Text style={{ fontSize: 17, fontWeight: '600', color: "#6c757d", paddingRight: 15, }}>€</Text>
                                                    }
                                                    style={{ height: 40, backgroundColor: "#fff" }}
                                                />
                                            }
                                        </FormattedMessage>
                                    </View>
                                    <View style={[modalStyle.bodyModal, { justifyContent: "space-between", paddingHorizontal: 0 }]}>
                                        <Text style={{ color: "#6c757d", fontSize: 17 }}><FormattedMessage id="Is.Supervisor" /></Text>
                                        <Switch
                                            trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                            thumbColor={isSupervisor ? "#007bff" : "#f4f3f4"}
                                            ios_backgroundColor="#7d7d7d"
                                            onValueChange={() => setIsSupervisor(!isSupervisor)}
                                            value={isSupervisor}
                                        />
                                    </View>

                                </View>
                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => handleCloseModal()}>
                                        <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.close" /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handleOpenAiConfig()}>
                                        <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.confirm" /></Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
            <TouchableOpacity onPress={handleOpenModal}>
                <View style={{ backgroundColor: "#dee2e6", borderRadius: 8, borderWidth: 1, borderColor: "#c7cbcf", padding: 6, marginLeft: 15, alignSelf: 'flex-start' }}>
                    <Feather name="edit" size={20} color="#6c757d" />
                </View>
            </TouchableOpacity>
        </>
    )
}

export default ModalUsersConfigOpenAi
