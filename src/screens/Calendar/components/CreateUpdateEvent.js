import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, Switch, Platform, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, ScrollView, Keyboard } from 'react-native';
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Input, TextArea } from "native-base";
import DatePicker from 'react-native-neat-date-picker'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from "react-redux";

import http from "../../../services/http";
import { NavigationService } from "../../../navigator";
import { createCalendarEvent, updateCalendarEvent } from '../../../redux/actions/Calender/calendar.actions'

import InitialUser from "../../../components/InitialUser";
import AddGuests from './AddGuests';
import ViewEvent from "./ViewEvent";
import FormatDateTime from "../../../components/FormatDateTime";
import RoomSelectAvailable from "./RoomSelectAvailable";

import { globalStyles } from "../../../asset/style/globalStyles";
import { modalStyle } from "../../../asset/style/components/modalStyle"
import { styles } from "../Calendar.Styles";

const CreateUpdateEvent = ({ idEvent, update }) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const state = useSelector(state => state)
    const calendarState = state.calendar
    const calendarRequest = state.calendar.request
    const [id, setId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [isAllDay, setIsAllDay] = useState(false);
    const [guests1, setGuests1] = useState([]);
    const [reserveRoom, setReserveRoom] = useState(false);

    const [calendarmRoomId, setCalendarmRoomId] = useState("");
    const [calendarmRoomName, setCalendarmRoomName] = useState("");

    const [isCreatedByMe, SetIsCreatedByMe] = useState(false);
    const [dataResponse, setDataResponse] = useState({});
    function getIdGuest(input) {
        var output = [];
        for (var i = 0; i < input.length; ++i)
            output.push(input[i].id);
        return output;
    }
    var guests = getIdGuest(guests1);

    const handleCreateEvent = () => {
        const payload = { title, description, isPrivate, isAllDay, start, end, calendarmRoomId: calendarmRoomId ? calendarmRoomId : null, guests }
        dispatch(createCalendarEvent(payload))
    }
    const handleUpdateEvent = () => {
        const payload = { id, title, description, isPrivate, isAllDay, start, end, calendarmRoomId: calendarmRoomId ? calendarmRoomId : null, guests }
        dispatch(updateCalendarEvent(payload))
    }

    const guestsPush = (value) => {
        let itemState = guests1.map(x => { return x.id; })
        let existItem = itemState.find(x => x === value.id);
        if (!existItem) {
            setGuests1([...guests1, value])
        }
    }
    const handleRemoveguests = (id) => {
        let index = guests1.map(x => { return x.id; }).indexOf(id);
        guests1.splice(index, 1)
        setGuests1([...guests1])
    }

    const onChangeIsPrivate = () => {
        setIsPrivate(!isPrivate)
        setGuests1([])

    }
    const onChangereserveRoom = () => {
        setReserveRoom(!reserveRoom)
        setCalendarmRoomId("")
        setCalendarmRoomName("")
    }


    useEffect(() => {
        if (idEvent !== "create" && !calendarRequest) {
            http.get(`/calendarm/events/${idEvent}`)
                .then((data) => {
                    setId(data.id);
                    setTitle(data.title);
                    setDescription(data.description);
                    setIsPrivate(data.isPrivate);
                    setStart(new Date(data.start));
                    setEnd(new Date(data.end));
                    setIsAllDay(data.isAllDay);
                    setGuests1(data.responsesToEvent);
                    setCalendarmRoomId(data.calendarmRoomId)
                    setCalendarmRoomName(data.calendarmRoomName)
                    if (data.calendarmRoomId) {
                        setReserveRoom(!reserveRoom)
                    }
                    SetIsCreatedByMe(data.isCreatedByMe)
                    setDataResponse(data)
                })
        } else {
            setTitle("");
            setDescription("");
            setIsPrivate(false);
            setStart(new Date());
            setEnd(new Date());
            setIsAllDay(false);
            setGuests1([]);
            setCalendarmRoomId("")
            setCalendarmRoomName("")
            SetIsCreatedByMe(false)
            setDataResponse([])
        }
    }, [idEvent, calendarState, calendarRequest]);


    const [showDatePicker, setShowDatePicker] = useState(null)
    const onConfirm = (date) => {
        setShowDatePicker(false)
        if (date) {
            setStart(date.date)
        }
    }
    const [isTimeStartVisible, setTimeStartVisible] = useState(false);
    const [isTimeEndVisible, setTimeEndVisible] = useState(false);

    const hideDatePicker = () => {
        setTimeStartVisible(false);
        setTimeEndVisible(false);
    };

    const handleConfirmTimeStart = (date) => {
        setStart(date)
        var dt = new Date(date);
        var dateEnd = dt.setMinutes(dt.getMinutes() + 30)
        setEnd(new Date(dateEnd))
        setTimeStartVisible(false);

    }
    const onChangeHoursOff = (date) => {
        setEnd(date)
        setTimeEndVisible(false);
    }
    const handleOpenPicker = () => {
        Keyboard.dismiss()
        setShowDatePicker(true)
    }

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={showDatePicker} >
                <DatePicker
                    colorOptions={{ headerColor: '#2196F3', }}
                    isVisible={showDatePicker}
                    mode={'single'}
                    onCancel={() => setShowDatePicker(false)}
                    onConfirm={onConfirm}
                    minDate={new Date()}
                />
            </Modal>
            <DateTimePickerModal
                isVisible={isTimeStartVisible}
                mode="time"
                onConfirm={handleConfirmTimeStart}
                onCancel={hideDatePicker}
                date={start}
            />
            <DateTimePickerModal
                isVisible={isTimeEndVisible}
                mode="time"
                onConfirm={onChangeHoursOff}
                onCancel={hideDatePicker}
                date={end}

            />
            <View
                style={[globalStyles.rowSpaceBetweenAlignItems, { paddingBottom: 10 }]}
            >
                <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
                    <FormattedMessage id={idEvent === "create" ? "create.new.event" : "common.button.update"} />
                </Text>
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            NavigationService.navigate("Calendar", { locationActive: "" });
                        }}
                        style={globalStyles.rowSpaceBetweenAlignItems}
                    >
                        <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
                        <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ backgroundColor: '#ebf0f3', padding: 15, borderRadius: 5, height: 'auto' }}>
                {(isCreatedByMe && update) || idEvent === "create" ? (
                    <>
                        {/* <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={{ flex: 1 }}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                        <KeyboardAwareScrollView keyboardShouldPersistTaps='always' >

                            <ScrollView style={{ flex: 1, paddingBottom: 500 }}>
                                <FormattedMessage id="projects.form.title.placeholder">
                                    {placeholder =>
                                        <Input
                                            size={"lg"}
                                            _focus
                                            w="100%"
                                            type="text"
                                            placeholder={placeholder.toString()}
                                            value={title}
                                            onChangeText={(e) => setTitle(e)}
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
                                <View style={styles.eventSwithch}>
                                    <Text style={{ fontSize: 17, }}>
                                        <FormattedMessage id="all.day" />
                                    </Text>
                                    <Switch
                                        trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                        thumbColor={isAllDay ? "#007bff" : "#f4f3f4"}
                                        ios_backgroundColor="#7d7d7d"
                                        onValueChange={() => setIsAllDay(!isAllDay)}
                                        value={isAllDay}
                                    />
                                </View>

                                {isAllDay ? (
                                    <TouchableOpacity onPress={() => handleOpenPicker()} style={[styles.eventSwithch, { paddingVertical: 10 }]}>
                                        <Text style={{ fontSize: 17 }}>
                                            {start ? (<FormatDateTime datevalue={start} type={1} />) : (<FormattedMessage id="Date" />)}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View>
                                        <TouchableOpacity onPress={() => handleOpenPicker()} style={[styles.eventSwithch, { paddingVertical: 10 }]}>
                                            <Text style={{ fontSize: 17 }}>
                                                {start ? (<FormatDateTime datevalue={start} type={1} />) : (<FormattedMessage id="Date" />)}
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{ flexDirection: "row", alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => setTimeStartVisible(true)} style={styles.inputDate}>
                                                <Text style={{ fontSize: 17 }}><FormatDateTime datevalue={start} type={0} /></Text>
                                            </TouchableOpacity>
                                            <Text style={{ fontSize: 17, padding: 5, marginBottom: 7 }}> - </Text>
                                            <TouchableOpacity onPress={() => setTimeEndVisible(true)} style={styles.inputDate}>
                                                <Text style={{ fontSize: 17 }}><FormatDateTime datevalue={end} type={0} /></Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                )}

                                <View style={styles.eventSwithch}>
                                    <Text style={{ fontSize: 17, }}>
                                        <FormattedMessage id="reserve.room" />
                                    </Text>
                                    <Switch
                                        trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                        thumbColor={reserveRoom ? "#007bff" : "#f4f3f4"}
                                        ios_backgroundColor="#7d7d7d"
                                        onValueChange={onChangereserveRoom}
                                        value={reserveRoom}
                                    />
                                </View>
                                {(reserveRoom || calendarmRoomId) &&
                                    <View style={{ paddingBottom: 10 }}>
                                        <RoomSelectAvailable
                                            setRoom={val => { setCalendarmRoomId(val) }}
                                            room={calendarmRoomId}
                                            start={start}
                                            end={end}
                                            reserveRoom={reserveRoom}
                                        />
                                    </View>

                                }
                                <View style={styles.eventSwithch}>
                                    <Text style={{ fontSize: 17, }}>
                                        <FormattedMessage id="private.event" />
                                    </Text>
                                    <Switch
                                        trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                                        thumbColor={isPrivate ? "#007bff" : "#f4f3f4"}
                                        ios_backgroundColor="#7d7d7d"
                                        onValueChange={onChangeIsPrivate}
                                        value={isPrivate}
                                    />
                                </View>

                                {guests1?.length ? <>
                                    <Text><FormattedMessage id="Guests" /></Text>
                                    {guests1?.map((data, index) =>
                                        <View key={index} style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            borderColor: "#ccc",
                                            marginVertical: 5,
                                            backgroundColor: "#fff",
                                            borderWidth: 1,
                                            paddingHorizontal: 8,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}>
                                            <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
                                                <InitialUser FirstName={data.firstName} LastName={data.lastName} email={data.email} color={data.color} />
                                                <View >
                                                    <Text style={{ fontSize: 16, paddingLeft: 20, fontWeight: '500' }}>{data.firstName} {data.lastName}</Text>
                                                    <Text style={{ fontSize: 13, paddingLeft: 20 }}>{data.email}</Text>
                                                </View>
                                            </View>

                                            <TouchableOpacity onPress={() => handleRemoveguests(data.id)} >
                                                <AntDesign name="closecircleo" size={24} color="black" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </> : null}
                                <View>
                                    {!isPrivate ? (
                                        <AddGuests addGuests={value => { guestsPush(value) }} dataSelect={guests1} />
                                    ) : (<></>)}
                                    <View>
                                        {idEvent === "create" ?
                                            (
                                                <TouchableOpacity
                                                    onPress={() => handleCreateEvent()}
                                                    disabled={(!title || !start || !end) || calendarRequest!==undefined}
                                                    style={[modalStyle.button, modalStyle.buttonGreeanOutline]}
                                                >
                                                    <Text style={modalStyle.textGreeanOutline}><FormattedMessage id="common.button.confirm" /></Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    onPress={() => handleUpdateEvent()}
                                                    disabled={(!title || !start || !end) || calendarRequest!==undefined}
                                                    style={[modalStyle.button, modalStyle.buttonGreeanOutline]}
                                                >
                                                    <Text style={modalStyle.textGreeanOutline}><FormattedMessage id="common.button.update" /></Text>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </View>
                                </View>

                            </ ScrollView>
                        </KeyboardAwareScrollView>
                        {/* </TouchableWithoutFeedback>
                        </KeyboardAvoidingView> */}
                    </>
                ) : (
                    <>
                        <ViewEvent dataResponse={dataResponse} />

                    </>
                )

                }
            </View>
        </>
    )
}
const styles2 = {
    container: {
        flex: 1,
    },
    searchInput: {
        width: '100%',
        height: 40,
        borderColor: '#d6d6d6',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: "#fff",
        paddingLeft: 10,
        marginBottom: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
};
export default CreateUpdateEvent
