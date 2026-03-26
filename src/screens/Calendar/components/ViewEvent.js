import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, } from "react-native";
import { FormattedMessage } from "react-intl";

import {
  deleteByIdCalendarEvent,
  acceptCalendarEvent,
  declineCalendarEvent,
} from "../../../redux/actions/Calender/calendar.actions";
import { NavigationService } from "../../../navigator";

import InitialUser from "../../../components/InitialUser";
import FormatDateTime from "../../../components/FormatDateTime";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import { styles } from "../Calendar.Styles";

const ViewEvent = ({ dataResponse }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const calendarRequest = state.calendar.request;

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
    <>
      <>
        <View
          style={styles.viewEventContainer}
        >
          <View style={styles.viewDescription}>
            <Text style={{ fontSize: 20 }}>
              <FormattedMessage id="projects.form.title.placeholder" />:{" "}
              {dataResponse?.title}
            </Text>
          </View>
          {dataResponse?.description &&
            <View style={styles.viewDescription}>
              <Text style={{ fontSize: 16 }}>
                <FormattedMessage id="projects.form.description.placeholder" />:{" "}
                {dataResponse?.description}
              </Text>
            </View>
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
              <MaterialCommunityIcons name="calendar" size={24} color="#6c757d" />
              <Text style={styles.text16500}>
                <FormatDateTime datevalue={dataResponse.start} type={dataResponse?.isAllDay ? 2 : 0} />
                {" "}-{" "}
              </Text >
              <Text style={styles.text16500}>
                <FormatDateTime datevalue={dataResponse.end} type={dataResponse?.isAllDay ? 2 : 0} />
              </Text>
              {!dataResponse?.isAllDay &&
                <Text style={[styles.text16500, { paddingHorizontal: 10 }]}>
                  <FormatDateTime datevalue={dataResponse.end} type={1} />
                </Text>}
            </View>
          ) : (
            <></>
          )}

          {dataResponse?.responsesToEvent &&
            dataResponse?.responsesToEvent.length > 0 ? (
            <View style={styles.guestsView}>
              <Text style={styles.guestsText}>
                <FormattedMessage id="Guests" />
              </Text>


              {dataResponse?.responsesToEvent.map((guest, index) => (
                <View key={index} style={styles.userItem}>
                  <View style={styles.itemUserCalendar}>
                    <InitialUser
                      FirstName={guest.firstName}
                      LastName={guest.lastName}
                      color={guest.color}
                    />
                    <View style={styles.pl2}>
                      <View style={styles.lineHeight}>
                        <Text style={styles.userName}>
                          {guest.firstName} {guest.lastName}{" "}
                          {guest.isEventOrganizer ? (
                            <FormattedMessage id="event.organizer" />
                          ) : (
                            ""
                          )}
                        </Text>
                        <Text style={styles.userEmail}>{guest.email}</Text>
                      </View>
                      {(() => {
                        if (guest.accepted === null) {
                          return (
                            <Text style={styles.pending}>
                              <FormattedMessage id="Pending" />
                            </Text>
                          );
                        } else if (guest.accepted === false) {
                          return (
                            <Text style={styles.decline}>
                              <FormattedMessage id="Declined" />
                            </Text>
                          );
                        } else if (guest.accepted === true) {
                          return (
                            <Text style={styles.accepted}>
                              <FormattedMessage id="Accepted" />
                            </Text>
                          );
                        }
                      })()}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
          {dataResponse?.isCreatedByMe ? (
            <Box
              style={{
                paddingVertical: 20,
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
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
                onPress={() => deleteEvent(dataResponse?.id)}
                disabled={calendarRequest}
              >
                <Text style={modalStyle.textStyle}>
                  {" "}
                  <FormattedMessage id="common.button.delete" />
                </Text>
              </TouchableOpacity>

            </Box>
          ) : (
            <></>
          )}
          {dataResponse?.iAccepted === false ? (
            <Box
              style={{
                fontSize: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                paddingVertical: 20,
              }}
            >
              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonDecline]}
                onPress={() => declineEvent(dataResponse?.id)}
                disabled={calendarRequest}
              >
                <Text style={modalStyle.textStyleDecline}>
                  <FormattedMessage id="reject.event" />
                </Text>
              </TouchableOpacity>{" "}
              <TouchableOpacity
                style={[modalStyle.button, modalStyle.buttonAccepted]}
                onPress={() => acceptedEvent(dataResponse?.id)}
                disabled={calendarRequest}
              >
                <Text style={modalStyle.textStyleAccepted}>
                  <FormattedMessage id="accepted.event" />
                </Text>
              </TouchableOpacity>
            </Box>
          ) : (
            <></>
          )}
        </View>
      </>
    </>
  );
};

export default ViewEvent;
