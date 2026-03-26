/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, TextArea } from "native-base"
// Redux 
import { useSelector, useDispatch } from "react-redux";
import { createPayment } from "../../../redux/actions/MoneyTracker/moneyTracker.actions"
// Redux
import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalPaymentCUD = ({ modal, setModal, type, paymentDescription, paymentAmount, data }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const state = useSelector(state => state)
    const moneyTrackerRequest = state.moneyTracker.moneyTrackerRequest

    const [submitted, setSubmitted] = useState(false);
    const [description, setDescription] = useState(paymentDescription);
    const [amount, setAmount] = useState(paymentAmount);

    const handlePaymentAction = () => {
        setSubmitted(true)
        if (type === 0 && amount) {
            const payload = { description, paidAmount: parseInt(amount), invoiceId: data?.id }
            dispatch(createPayment(payload))
        } else if (type === 1) {
        }
    };

    useEffect(() => {
        if (moneyTrackerRequest) {
            setSubmitted(false)
            setModal(false)
            setDescription('')
            setAmount('')
        }
    }, [moneyTrackerRequest]);

    const handleCloseModal = () => {
        setSubmitted(false)
        setModal(false)
        setDescription('')
        setAmount('')
    }

    let maxAllowedNumber = data?.billedAmount

    const handleInputChange = (inputValue) => {
        const numberValue = parseInt(inputValue, 10);
        if (!isNaN(numberValue)) {
            if (numberValue <= maxAllowedNumber) {
                setAmount(numberValue?.toString());
            } else {
                alert(`${intl.formatMessage({ id: 'money-tracker.invoice.total.invoiced' })} <= ${maxAllowedNumber}`);
            }
        }
    };

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modal} style={{ height: 500 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={modalStyle.centeredView}>
                            <View style={modalStyle.modalView}>
                                <View style={modalStyle.modalViewTitle}>
                                    <Text style={modalStyle.modalTitle}>
                                        <FormattedMessage id="money-tracker.add.payment" />
                                    </Text>
                                </View>
                                <View style={[modalStyle.modalInput, modalStyle.paddingBottom60, { paddingHorizontal: 17 }]} >
                                    <FormattedMessage id="projects.form.description.placeholder">
                                        {placeholder =>
                                            <TextArea
                                                size={"lg"}
                                                _focus
                                                w="100%"
                                                type="text"
                                                placeholder={placeholder.toString()}
                                                value={description}
                                                onChangeText={(e) => setDescription(e)}
                                                my={3}
                                                style={{ backgroundColor: "#fff" }}
                                            />
                                        }
                                    </FormattedMessage>
                                    <FormattedMessage id="money-tracker.amount.placeholder">
                                        {(placeholder) => (
                                            <Input
                                                size={"lg"}
                                                _focus
                                                w="100%"
                                                keyboardType="numeric"
                                                placeholder={placeholder.toString()}
                                                value={amount}
                                                onChangeText={handleInputChange}
                                                my={3}
                                                style={{ height: 40, backgroundColor: "#fff" }}
                                            />
                                        )}
                                    </FormattedMessage>
                                    {submitted && !amount && <Text style={{ fontSize: 14, color: "#dc3545" }}><FormattedMessage id="money-tracker.invoice.paid.amount.error.required"/></Text>}
                                </View>
                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => handleCloseModal()}>
                                        <Text style={modalStyle.textStyle}>
                                            <FormattedMessage id="common.button.close" /></Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={handlePaymentAction}>
                                        <Text style={modalStyle.textStyle}><FormattedMessage id="common.button.confirm" /></Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </>
    )
}

export default ModalPaymentCUD
