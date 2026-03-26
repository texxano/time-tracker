import React, { useState, useEffect } from 'react'
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Input } from "native-base"
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from "react-redux";

import { createShiftTemplateName, updatesShiftTemplate } from "../../../redux/actions/TimeTracks/timeShiftTemplates.actions"
// Redux
import { modalStyle } from "../../../asset/style/components/modalStyle"

const ModalCUDShiftTemplate = ({ modal, setModal, type, id, nameShift }) => {
    const dispatch = useDispatch();
    const state = useSelector(state => state)
    const trackingState = state.timeTracks
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState(nameShift);

    const handleConfirm = () => {
        setSubmitted(true)
        if (type === 0 && name) {
            const payload = { name }
            dispatch(createShiftTemplateName(payload))
        } else if (type === 1 && name) {
            const payload = { name, id }
            dispatch(updatesShiftTemplate(payload))
        }
    };

    useEffect(() => {
        if (trackingState) {
            setSubmitted(false)
            setModal(false)
        }
    }, [trackingState]);
    return (
        <>
            <Modal animationType="fade" transparent={true} visible={modal} >
                <View style={modalStyle.centeredViewSmall}>
                    <View style={modalStyle.modalView}>
                        <View style={modalStyle.modalViewTitle}>
                            <Text style={modalStyle.modalTitle}>
                                {(() => {
                                    if (type === 0) {
                                        return (<FormattedMessage id="Create.Shift.Template" />)
                                    } else if (type === 1) {
                                        return (<FormattedMessage id="Edit.Name.Shift.Templeate" />)
                                    } else if (type === 2) {
                                        return (<FormattedMessage id="Generate.Report" />)
                                    }
                                })()}
                            </Text>
                        </View>
                        <View style={modalStyle.modalInputDelete} >
                            <FormattedMessage id="Time.Shift.form.name.placeholder">
                                {placeholder =>
                                    <Input
                                        size={"lg"}
                                        _focus
                                        w="100%"
                                        type="text"
                                        placeholder={placeholder.toString()}
                                        value={name}
                                        onChangeText={(e) => setName(e)}
                                        my={3}
                                        style={{ height: 40, backgroundColor: "#fff" }}
                                    />
                                }
                            </FormattedMessage>
                        </View>
                        <View style={modalStyle.ModalBottom}>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonClose]} onPress={() => setModal(false)}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.close" />
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyle.button, modalStyle.buttonAdd]} onPress={() => handleConfirm()}>
                                <Text style={modalStyle.textStyle}>
                                    <FormattedMessage id="common.button.confirm" />
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>

        </>
    )
}

export default ModalCUDShiftTemplate
