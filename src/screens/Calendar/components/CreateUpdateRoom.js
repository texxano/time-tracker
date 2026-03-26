import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Switch, Platform, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Input, TextArea } from "native-base"
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from "react-redux";

import { createCalendarRoom, updateCalendarRoom } from '../../../redux/actions/Calender/calendarRoom.actions'

import { modalStyle } from '../../../asset/style/components/modalStyle'

const CreateUpdateRoom = ({ setModal, modal, data }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const state = useSelector(state => state)
    const calendarState = state.calendar
    const calendarRequest = state.calendar.request

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [capacity, setCapacity] = useState("");

    useEffect(() => {
        if (data?.name) {
            setId(data?.id);
            setName(data?.name);
            setDescription(data?.description);
            setEnabled(data?.enabled);
            setCapacity(data?.capacity);
        }
    }, [data])
    const handleCreateRoom = () => {
        const dataBody = { name, description, enabled, capacity: parseInt(capacity) }
        dispatch(createCalendarRoom(dataBody))
    }
    const handleUpdateRoom = () => {
        const dataBody = { id, name, description, enabled, capacity: parseInt(capacity) }
        dispatch(updateCalendarRoom(dataBody))
    }

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
                                        <FormattedMessage id={!id ? "create.new.room" : "Calendar.Room.List"} />
                                    </Text>
                                </View>
                                <View style={[modalStyle.modalInput, modalStyle.paddingBottom60, { paddingHorizontal: 17 }]} >
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
                                    <FormattedMessage id="create.new.room.capacity">
                                        {placeholder =>
                                            <Input
                                                size={"lg"}
                                                _focus
                                                w="100%"
                                                type="text"
                                                placeholder={placeholder.toString()}
                                                value={capacity}
                                                onChangeText={(e) => setCapacity(e)}
                                                my={3}
                                                style={{ height: 40, backgroundColor: "#fff" }}
                                                keyboardType="numeric"
                                            />
                                        }
                                    </FormattedMessage>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 18, }}> <FormattedMessage id="create.new.room.enabled" /></Text>
                                        <Switch
                                            trackColor={{ false: "#7D7D7D", true: "#429CFC" }}
                                            thumbColor={enabled ? "#007BFF" : "#F4F3F4"}
                                            ios_backgroundColor="#7D7D7D"
                                            onValueChange={() => setEnabled(!enabled)}
                                            value={enabled}
                                            style={{ transform: [{ scaleX: Platform.OS === 'ios' ? 1 : 1.2 }, { scaleY: Platform.OS === 'ios' ? 1 : 1.2 }] }}
                                        />
                                    </View>
                                </View>
                                <View style={modalStyle.ModalBottom}>
                                    <TouchableOpacity
                                        style={[modalStyle.button, modalStyle.buttonClose]}
                                        onPress={() => setModal(false)}
                                    >
                                        <Text style={modalStyle.textStyle}>
                                            <FormattedMessage id="common.button.close" />
                                        </Text>
                                    </TouchableOpacity>
                                    {!id ?
                                        <TouchableOpacity
                                            style={[modalStyle.button, modalStyle.buttonAdd]}
                                            onPress={() => handleCreateRoom()} disabled={(!name && !capacity) || calendarRequest}
                                        >
                                            <Text style={modalStyle.textStyle}>
                                                <FormattedMessage id="common.button.confirm" />
                                            </Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            style={[modalStyle.button, modalStyle.buttonAdd]}
                                            onPress={() => handleUpdateRoom()} disabled={(!name && !capacity) || calendarRequest}
                                        >
                                            <Text style={modalStyle.textStyle}>
                                                <FormattedMessage id="common.button.confirm" />
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </ >
    )
}

export default CreateUpdateRoom
