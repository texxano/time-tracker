/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import DatePicker from "react-native-neat-date-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSelector, useDispatch } from "react-redux";
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Entypo } from "@expo/vector-icons";

import http from "../../../services/http";
import { dateFormat } from "../../../utils/dateFormat";

import {
  applyUserTimeShift,
  createUserTimeShift,
} from "../../../redux/actions/TimeTracks/timeShiftUser.actions";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import { styles } from "../../../asset/style/components/header";
import { styles as stylesInpute } from "../../Calendar/Calendar.Styles";
import FormatDateTime from "../../../components/FormatDateTime";

const Applyshifts = ({ userId }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const state = useSelector((state) => state);
  const trackingState = state.timeTracks;

  const [modalShiftUser, setModalShiftUser] = useState(false);
  const [requestFor, setRequestFor] = useState(0);

  useEffect(() => {
    if (trackingState) {
      setModalShiftUser(false);
    }
  }, [trackingState]);

  const [startDateTime, setStartDateTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setendTime] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(null);

  const onConfirm = (date) => {
    setShowDatePicker(false);
    if (date) {
      if (requestFor) {
        setStartDateTime(date.date);
      } else {
        setStartDate(date.startDateString);
        setEndDate(date.endDateString);
      }
    }
  };
  const [isTimeStartVisible, setTimeStartVisible] = useState(false);
  const [isTimeEndVisible, setTimeEndVisible] = useState(false);

  const hideDatePicker = () => {
    setTimeStartVisible(false);
    setTimeEndVisible(false);
  };

  const handleConfirmTimeStart = (date) => {
    setStartTime(date);
    var dt = new Date(date);
    var dateEnd = dt.setMinutes(dt.getMinutes() + 60);
    setendTime(new Date(dateEnd));
    setTimeStartVisible(false);
  };
  const onChangeHoursOff = (date) => {
    setendTime(date);
    setTimeEndVisible(false);
  };

  const [dataResponse, setDataResponse] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!requestFor && modalShiftUser) {
      http.get(`/timetracker/templates?PageSize=50`).then((data) => {
        setDataResponse(
          data?.list?.map((val) => ({
            label: val.name,
            value: val.id,
          }))
        );
      });
    }
  }, [modalShiftUser, requestFor]);

  const handleOpenModal = () => {
    setModalShiftUser(true);
    setStartDateTime();
    setStartTime();
    setendTime();
    setStartDate();
    setEndDate();
    setOpen();
    setSelectedValue();
  };
  const handleApplyShift = () => {
    if (!requestFor && selectedValue && startDate) {
      const payload = {
        userId,
        from: startDate,
        to: endDate,
        shiftTemplateId: selectedValue,
      };
      dispatch(applyUserTimeShift(payload));
    } else if (requestFor && startDateTime && startTime && endTime) {
      const payload = {
        userId,
        shiftDate: dateFormat(startDateTime),
        fromHour: startTime.getHours(),
        fromMin: startTime.getMinutes(),
        toHour: endTime.getHours(),
        toMin: endTime.getMinutes(),
      };
      dispatch(createUserTimeShift(payload));
    }
  };
  const handleOpenPicker = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  return (
    <>
      <Modal animationType="slide" transparent={true} visible={modalShiftUser}>
        <DatePicker
          colorOptions={{ headerColor: "#2196F3" }}
          isVisible={showDatePicker}
          mode={requestFor ? "single" : "range"}
          onCancel={() => setShowDatePicker(false)}
          onConfirm={onConfirm}
          minDate={new Date()}
        />
        <DateTimePickerModal
          isVisible={isTimeStartVisible}
          mode="time"
          onConfirm={handleConfirmTimeStart}
          onCancel={hideDatePicker}
          date={startTime}
        />
        <DateTimePickerModal
          isVisible={isTimeEndVisible}
          mode="time"
          onConfirm={onChangeHoursOff}
          onCancel={hideDatePicker}
          date={endTime}
          minimumDate={startTime}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={modalStyle.centeredView}>
            <View style={modalStyle.modalView}>
              <View style={modalStyle.modalViewTitle}>
                <Text style={modalStyle.modalTitle}>
                  <FormattedMessage id="Apply.Shift.Modal.Title" />
                </Text>
              </View>
              <View style={[styles.viewHeader, { width: "90%" }]}>
                <TouchableOpacity
                  style={!requestFor ? styles.box : styles.box2}
                  onPress={() => setRequestFor(0)}
                >
                  <Text style={!requestFor ? styles.title : styles.title2}>
                    <FormattedMessage id="My.Time.Tracks" />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={requestFor ? styles.box : styles.box2}
                  onPress={() => setRequestFor(1)}
                >
                  <Text style={requestFor ? styles.title : styles.title2}>
                    <FormattedMessage id="Create.Personal.Shift" />
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: "100%", padding: 17 }}>
                {(() => {
                  if (!requestFor) {
                    return (
                      <>
                        <TouchableOpacity
                          onPress={() => handleOpenPicker()}
                          style={[
                            stylesInpute.eventSwithch,
                            { paddingVertical: 10 },
                          ]}
                        >
                          <View>
                            {startDate ? (
                              <Text style={{ fontSize: 17 }}>
                                <FormatDateTime
                                  datevalue={startDate}
                                  type={1}
                                />
                                -
                                <FormatDateTime datevalue={endDate} type={1} />
                              </Text>
                            ) : (
                              <Text style={{ fontSize: 17, color: "#9a9a9a" }}>
                                <FormattedMessage id="Date" />
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                        <DropDownPicker
                          open={open}
                          setOpen={setOpen}
                          value={selectedValue}
                          items={dataResponse}
                          setValue={setSelectedValue}
                          zIndex={9999}
                          placeholder={<FormattedMessage id="Shift.Template" />}
                          style={{
                            fontSize: 13,
                            borderColor: "#dee2e6",
                            borderRadius: 5,
                            backgroundColor: "#fff",
                          }}
                          dropDownContainerStyle={{
                            borderColor: "#dee2e6",
                          }}
                          listItemLabelStyle={{
                            fontWeight: "500",
                            fontSize: 15,
                          }}
                          textStyle={{
                            fontWeight: "500",
                            fontSize: 15,
                          }}
                          dropDownDirection="TOP"
                          // disabled={false}
                        />
                      </>
                    );
                  } else if (requestFor) {
                    return (
                      <>
                        <TouchableOpacity
                          onPress={() => handleOpenPicker()}
                          style={[
                            stylesInpute.eventSwithch,
                            { paddingVertical: 10 },
                          ]}
                        >
                          <Text style={{ fontSize: 17 }}>
                            {startDateTime ? (
                              <FormatDateTime
                                datevalue={startDateTime}
                                type={1}
                              />
                            ) : (
                              <Text style={{ color: "#9a9a9a" }}>
                                <FormattedMessage id="Date" />
                              </Text>
                            )}
                          </Text>
                        </TouchableOpacity>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <TouchableOpacity
                            onPress={() => setTimeStartVisible(true)}
                            style={stylesInpute.inputDate}
                          >
                            <Text style={{ fontSize: 17 }}>
                              {startTime ? (
                                <FormatDateTime
                                  datevalue={startTime}
                                  type={0}
                                />
                              ) : (
                                <>{intl.formatMessage({ id: "Hour.From" })}</>
                              )}
                            </Text>
                          </TouchableOpacity>
                          <Text
                            style={{
                              fontSize: 17,
                              padding: 5,
                              marginBottom: 7,
                            }}
                          >
                            {" "}
                            -{" "}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setTimeEndVisible(true)}
                            style={stylesInpute.inputDate}
                          >
                            <Text style={{ fontSize: 17 }}>
                              {endTime ? (
                                <FormatDateTime datevalue={endTime} type={0} />
                              ) : (
                                <>{intl.formatMessage({ id: "Hour.To" })}</>
                              )}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    );
                  }
                })()}
              </View>
              <View style={modalStyle.ModalBottom}>
                <TouchableOpacity
                  style={[modalStyle.button, modalStyle.buttonClose]}
                  onPress={() => setModalShiftUser(false)}
                >
                  <Text style={modalStyle.textStyle}>
                    <FormattedMessage id="common.button.close" />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyle.button, modalStyle.buttonAdd]}
                  onPress={() => handleApplyShift()}
                >
                  <Text style={modalStyle.textStyle}>
                    <FormattedMessage id="common.button.confirm" />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableOpacity
        onPress={handleOpenModal}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 17 }}>
          <FormattedMessage id="Apply.Shift.Modal.Title" />
        </Text>
        <View
          style={{
            backgroundColor: "#dee2e6",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#c7cbcf",
            padding: 6,
            marginLeft: 15,
            alignSelf: "flex-startTime",
          }}
        >
          <Entypo name="plus" size={24} color="#6c757d" />
        </View>
      </TouchableOpacity>
    </>
  );
};

export default Applyshifts;
