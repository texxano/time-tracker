/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextArea } from "native-base"
import { useSelector } from "react-redux";

import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalApproveDenyVacation = ({ id, modalVacation, setModalVacation, status, deny, approve }) => {
    const state = useSelector(state => state)
    const vacations = state.vacations
    useEffect(() => {
        if (vacations) {
            setModalVacation(false)
            setApproverComment("")
        }
    }, [vacations]);

    const [approverComment, setApproverComment] = useState('');
    const closeModal = () => {
        setModalVacation(false)
        setApproverComment("")
    }
    const handledeny = () => {
        deny(id, approverComment)
    }
    const handleApprove = () => {
        approve(id, approverComment)
    }
    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalVacation} >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={modalStyle.centeredView}>
                        <View style={modalStyle.modalView}>
                            <View style={modalStyle.modalViewTitle}>
                                <Text style={modalStyle.modalTitle}>
                                    <FormattedMessage id="comments.delete.modal.title" />
                                </Text>
                            </View>
                            <View style={[modalStyle.modalInput, {paddingHorizontal: 17}]}>
                                {status === 0 ? (
                                    <Text ><FormattedMessage id="Deny.Vacation" /></Text>
                                ) : (
                                    <Text ><FormattedMessage id="Approve.Vacation" /></Text>
                                )}
                                <FormattedMessage id="Comment.vacation.optional">
                                    {placeholder =>
                                        <TextArea
                                            size={"lg"}
                                            _focus
                                            w="100%"
                                            type="text"
                                            placeholder={placeholder.toString()}
                                            value={approverComment}
                                            onChangeText={(e) => setApproverComment(e)}
                                            my={3}
                                            style={{ backgroundColor: "#fff" }}
                                        />
                                    }
                                </FormattedMessage>
                            </View>
                            <View style={modalStyle.ModalBottom}>
                                <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={closeModal}>
                                    <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.close" /></Text>
                                </TouchableOpacity>
                                {status === 0 ? (
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handledeny()}>
                                        <Text style={modalStyle.textStyle}> <FormattedMessage id="comments.delete.modal.title" /></Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handleApprove()}>
                                        <Text style={modalStyle.textStyle}> <FormattedMessage id="comments.delete.modal.title" /></Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </>
    )
}

export default ModalApproveDenyVacation
