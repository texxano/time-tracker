import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";

import { deleteInvoice } from "../../../redux/actions/MoneyTracker/moneyTracker.actions"

import ModalDelete2 from "../../../components/Modal/ModalDelete2";
import ModalPaymentCUD from "./ModalPaymentCUD";

import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalMoreMoney = ({ data }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const moneyTrackerRequest = state.moneyTracker.moneyTrackerRequest

    const [modalMore, setModalMore] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalCreatePayment, setModalCreatePayment] = useState(false);

    useEffect(() => {
        if (moneyTrackerRequest) {
            setModalMore(false)
        }
    }, [moneyTrackerRequest]);

    const handleDeletedById = (id) => {
        dispatch(deleteInvoice(id));
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
                <ModalPaymentCUD
                    modal={modalCreatePayment}
                    setModal={setModalCreatePayment}
                    type={0}
                    data={data}
                />
           
                {/* <ModalEditInvoiceCUD
                    modal={modalUpdateInvoice}
                    setModal={setModalUpdateInvoice}
                    data={data}
                /> */}
                <View style={modalStyle.centeredViewSmall}>
                    <View style={[modalStyle.modalViewEdit, { width: '70%' }]}>
                        <View style={modalStyle.modalEditClose} >
                            <TouchableWithoutFeedback onPress={() => setModalMore(!modalMore)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </TouchableWithoutFeedback>
                        </View>
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalCreatePayment(true)}>
                            <Text style={modalStyle.modalTitleEdit}>
                                <FormattedMessage id="money-tracker.add.payment" />
                            </Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalUpdateInvoice(true)}>
                            <Text style={modalStyle.modalTitleEdit}>
                                <FormattedMessage id="money-tracker.edit.invoice" />
                            </Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={modalStyle.modalTitleEditView} onPress={() => setModalDelete(true)}>
                            <Text style={modalStyle.modalTitleEditDelete}><FormattedMessage id="common.button.delete" /></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity onPress={() => setModalMore(!modalMore)} style={{height: 24}}>
                <Text><Feather name="more-vertical" size={24} color="#6c757d" /></Text>
            </TouchableOpacity>

        </>
    )
}
export default ModalMoreMoney
