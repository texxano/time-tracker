import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Text,
  Modal,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FormattedMessage } from "react-intl";

import http from "../../../services/http";
import {
  deleteByIdCalendarEvent,
  acceptCalendarEvent,
  declineCalendarEvent,
} from "../../../redux/actions/Calender/calendar.actions";
import { NavigationService } from "../../../navigator";

import FormatDateTime from "../../../components/FormatDateTime";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import { styles } from "../Calendar.Styles"

const ViewEventModal = ({ modalViewEvent, close, idEvent }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const calendarState = state.calendar;
  const calendarRequest = state.calendar.request;
  const [dataResponse, setDataResponse] = useState({});

  useEffect(() => {
    const getData = async () => {
    if (idEvent && modalViewEvent) {
      http.get(`/calendarm/events/${idEvent}`)
        .then((data) => {
          setDataResponse(data);
        })
    }
  };
  getData();
  }, [idEvent, calendarState, modalViewEvent]);

  useEffect(() => {
    if (calendarState?.data) {
      close();
    }
  }, [calendarState]);

  const deleteEvent = (id) => {
    
    dispatch(deleteByIdCalendarEvent(id));
  };
  const acceptedEvent = (id) => {
    dispatch(acceptCalendarEvent(id));
  };
  const declineEvent = (id) => {
    dispatch(declineCalendarEvent(id));
  };

  return (
    <Modal animationType="slide" transparent={true} visible={modalViewEvent}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={modalStyle.centeredViewSmall}>
          <View style={modalStyle.modalViewEvent}>
            <View style={[modalStyle.modalEditClose, { paddingRight: 10 }]} >
              <TouchableWithoutFeedback onPress={close}>
                <Ionicons name="close" size={26} color="#6c757d" />
              </TouchableWithoutFeedback>
            </View>
            <Text style={{ fontSize: 20, borderBottomWidth: 1, width: '100%', paddingVertical: 5 }}><FormattedMessage id="projects.form.title.placeholder" />: {dataResponse.title}</Text>
            {dataResponse.description &&
              <Text style={{ fontSize: 16, width: '100%', paddingVertical: 5 }}>
                <FormattedMessage id="projects.form.description.placeholder" />: {dataResponse.description}
              </Text>
            }
            {dataResponse?.calendarmRoomId &&
              <View style={styles.viewDescription}>
                <Text style={{ fontSize: 16 }}>
                  <FormattedMessage id="Calendar.Room.List" />:{" "}
                  {dataResponse?.calendarmRoomName}
                </Text>
              </View>
            }
            {dataResponse?.start ? (
              <View style={{ flexDirection: "row", alignItems: "center", width: '100%', paddingVertical: 5 }}>

                <Text style={styles.text16500}>
                  <FormatDateTime datevalue={dataResponse.start} type={dataResponse?.isAllDay ? 2 : 0} />
                  {" "}-{" "}
                </Text >
                <Text style={styles.text16500}>
                  <FormatDateTime datevalue={dataResponse.end} type={dataResponse?.isAllDay ? 2 : 0} />
                </Text>
                <MaterialCommunityIcons name="calendar" size={24} color="#6c757d" style={{ paddingLeft: 10 }} />
                {!dataResponse?.isAllDay &&
                  <Text style={styles.text16500}>
                    <FormatDateTime datevalue={dataResponse.end} type={1} />
                  </Text>}
              </View>
            ) : (
              <></>
            )}

            <View
              style={styles.modalbootomEvent}
            >
              {dataResponse.isCreatedByMe ? (
                <>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonOrangeOutline]}
                    onPress={() => NavigationService.navigate('Calendar', { locationActive: "3", id: dataResponse.id, update: true })}
                  >
                    <Text style={modalStyle.textOrangeOutline}>
                      {" "}
                      <FormattedMessage id="common.button.update" />
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonDelete]}
                    onPress={() => deleteEvent(dataResponse.id)}
                    disabled={calendarRequest !== undefined}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="common.button.delete" />
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <></>
              )}

              {dataResponse.iAccepted === false ? (
                <>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonDecline]}
                    onPress={() => declineEvent(dataResponse.id)}
                    disabled={calendarRequest !== undefined}
                  >
                    <Text style={modalStyle.textStyleDecline}>
                      <FormattedMessage id="reject.event" />
                    </Text>
                  </TouchableOpacity>{" "}
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonAccepted]}
                    onPress={() => acceptedEvent(dataResponse.id)}
                    disabled={calendarRequest !== undefined}
                  >
                    <Text style={modalStyle.textStyleAccepted}>
                      <FormattedMessage id="accepted.event" />
                    </Text>
                  </TouchableOpacity>

                </>
              ) : (
                <></>
              )}
              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonBlueOutline]}
                onPress={() => NavigationService.navigate('Calendar', { locationActive: "3", id: dataResponse.id, update: false })}
              >
                <Text style={modalStyle.textBlueOutline}>
                  <FormattedMessage id="view.more" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewEventModal;
