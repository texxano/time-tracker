/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Box, Input, TextArea } from "native-base";
import {
  Text,
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import DatePicker from "react-native-neat-date-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSelector, useDispatch } from "react-redux";

import {
  requestsVacationDays,
  requestsVacationHours,
} from "../../../redux/actions/Vacation/vacationRequests.actions";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import { dateFormat } from "../../../utils/dateFormat";

import FormatDateTime from "../../../components/FormatDateTime";
import SelectUser from "../../../components/SelectUser";
import http from "../../../services/http";
import colors from "../../../constants/Colors";
import { my, p } from "../../../asset/style/utilities.style";
import { vacationTypes } from "../../../redux/type/Vacation/vacation.types";

const addWorkingDays = (startDate, workingDays) => {
  let date = new Date(startDate);
  while (workingDays > 0) {
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      workingDays--;
    }
    if (workingDays > 0) {
      date.setDate(date.getDate() + 1);
    }
  }
  return date;
};

const formatDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

const parseEmbeddedJson = (rawMessage = "") => {
  if (typeof rawMessage !== "string") {
    return null;
  }
  const jsonStart = rawMessage.indexOf("{");
  if (jsonStart === -1) {
    return null;
  }
  try {
    return JSON.parse(rawMessage.slice(jsonStart));
  } catch (error) {
    return null;
  }
};

const normalizeVacationError = (candidate) => {
  if (!candidate) {
    return null;
  }

  if (Array.isArray(candidate)) {
    for (const item of candidate) {
      const parsed = normalizeVacationError(item);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  }

  if (candidate.status && candidate.title) {
    return candidate;
  }

  if (candidate instanceof Error) {
    const parsed = parseEmbeddedJson(candidate.message);
    return parsed || null;
  }

  if (typeof candidate === "string") {
    return parseEmbeddedJson(candidate);
  }

  if (candidate.message && typeof candidate.message === "string") {
    return parseEmbeddedJson(candidate.message);
  }

  if (candidate.title) {
    return candidate;
  }

  return null;
};

const extractVacationError = (vacationsState) => {
  if (!vacationsState) {
    return null;
  }

  return (
    normalizeVacationError(vacationsState.datefailure) ||
    normalizeVacationError(vacationsState.error) ||
    normalizeVacationError(vacationsState.data)
  );
};

const ModalRequestVacation = ({
  myVacationConfiguration,
  disabled = false,
}) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const vacations = state.vacations;
  const intl = useIntl();
  const [modalVacationUse, setModalVacationUse] = useState(false);
  console.log("vacations", vacations);//
  const [requestFor, setRequestFor] = useState(0);
  const [requestApi, setRequestApi] = useState(false);

  const [showDateStart, setShowDateStart] = useState(false);
  const [showDateEnd, setShowDateEnd] = useState(false);

  const [requestedFrom, setRequestedFrom] = useState();
  const [requestedTo, setRequestedTo] = useState();
  const [hoursOff, setHoursOff] = useState("");
  const [requesterComment, setRequesterComment] = useState("");
  const [numberOfDays, setNumberOfDays] = useState("");
  const [decreaseFromAvaliableVacation, setDecreaseFromAvaliableVacation] =
    useState(true);
  const [proposedSubstituteUserId, setProposedSubstituteUserId] = useState("");

  const [validateAvailableHoursOff, setValidateAvailableHoursOff] =
    useState(false);
  const [validateAvalableDaysOff, setValidateAvalableDaysOff] = useState(false);
  const [daysOffMessage, setDaysOffMessage] = useState("");

  const [requestedDays, setRequestedDays] = useState(0);
  const [availableDays, setAvailableDays] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const [vacationRequestError, setVacationRequestError] = useState("");

  const maxHour = myVacationConfiguration?.hoursPerWorkingDay;
  const maxday = myVacationConfiguration?.avalableDaysOff;

  const [showDateTimeStart, setShowDateTimeStart] = useState(false);

  const [startDateTime, setStartDateTime] = useState(null);
  const [startTime, setStartTime] = useState(() => {
    const defaultStart = new Date();
    defaultStart.setHours(9, 0, 0, 0); // 9:00 AM
    return defaultStart;
  });
  const [endTime, setEndTime] = useState(() => {
    const defaultEnd = new Date();
    defaultEnd.setHours(17, 0, 0, 0); // 5:00 PM
    return defaultEnd;
  });
  const [isTimeStartVisible, setTimeStartVisible] = useState(false);
  const [isTimeEndVisible, setTimeEndVisible] = useState(false);

  useEffect(() => {
    if (!vacations) {
      return;
    }

    const serverError = extractVacationError(vacations);

    if (
      serverError &&
      Number(serverError.status) === 500 &&
      serverError.title === "Not.Enough.Vacation.Time.Available"
    ) {
      setVacationRequestError(
        intl.formatMessage({ id: "Not.Enough.Vacation.Time.Available" })
      );
      setModalVacationUse(true);
      return;
    }
    if (
      serverError &&
      Number(serverError.status) === 500 &&
      serverError.title === "Team.Configuration.Not.Found"
    ) {
      setVacationRequestError(
        intl.formatMessage({ id: "Team.Configuration.Not.Found" })
      );
      setModalVacationUse(true);
      return;
    }

    // Keep modal open if still in request phase
    if (vacations?.lastActionType === vacationTypes.VACATION_REQUEST) {
      return;
    }

    // Close modal on successprobaj da n
    if (vacations?.lastActionType === vacationTypes.VACATION_SUCCESS) {
      setVacationRequestError("");
      setModalVacationUse(false);
      setDaysOffMessage("");
      return;
    }

    // Close modal on other failures (not the specific error handled above)
    if (vacations?.lastActionType === vacationTypes.VACATION_FAILURE) {
      setVacationRequestError("");
      setModalVacationUse(false);
      setDaysOffMessage("");
    }
  }, [vacations, intl]);

  // Calculate default hoursOff when startTime and endTime are set
  useEffect(() => {
    if (startTime && endTime) {
      const calculatedHours = endTime.getHours() - startTime.getHours();
      if (calculatedHours > 0) {
        setHoursOff(calculatedHours);
      }
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (requestedFrom && numberOfDays) {
      const calculatedToDate = calculateEndDate(
        requestedFrom,
        Number(numberOfDays)
      );
      setRequestedTo(calculatedToDate);
      checkAvailability(requestedFrom, calculatedToDate);
    }
  }, [requestedFrom, numberOfDays]);

  // Updated checkAvailability returns a promise and updates availableDays.
  const checkAvailability = (start, end) => {
    const requestPayload = {
      RequestedFrom: formatDate(start),
      RequestedTo: formatDate(end),
      DecreaseFromAvaliableVacation: true,
    };
    setRequestApi(true);
    http
      .post("/vacations/requests/check-availability", requestPayload)
      .then((response) => {
        setRequestApi(false);
        if (response && response.remainingDays >= 0) {
          setValidateAvalableDaysOff(false);
          setRequestedDays(response.requestedDays);
          setAvailableDays(response.availableDays);
          setRemainingDays(response.remainingDays);
          setDaysOffMessage(
            intl.formatMessage(
              { id: "vacation.available.daysOff" },
              {
                requestedDays: response.requestedDays,
                availableDays: response.availableDays,
                remainingDays: response.remainingDays,
              }
            )
          );
        } else {
          setValidateAvalableDaysOff(true);
          setAvailableDays(response.availableDays); // set even if not available
          setDaysOffMessage(
            intl.formatMessage(
              { id: "vacation.no.available.daysOff" },
              {
                requestedDays: response.requestedDays,
                availableDays: response.availableDays,
              }
            )
          );
        }
      })
      .catch((error) => {
        setRequestApi(false);
        console.error("Error checking available days off:", error.message);
        setValidateAvalableDaysOff(true);
        setDaysOffMessage(
          intl.formatMessage({ id: "vacation.available.daysOff.error" })
        );
      });
  };

  const handleRequestsVacation = () => {
    const validatePayload = (payload, requiredFields) => {
      return requiredFields.every((field) => {
        const value = payload[field];
        // Handle different types of validation
        if (field === "hoursOff") {
          return value !== "" && value !== null && value !== undefined && value > 0;
        }
        if (field === "requestedFrom" || field === "requestedTo") {
          return value !== null && value !== undefined;
        }
        return value;
      });
    };

    const commonFields = {
      requestedFrom: requestedFrom ? formatDate(requestedFrom) : null,

      requesterComment,
      decreaseFromAvaliableVacation,
    };
    let payload = {};
    switch (requestFor) {
      case 0:
        payload = {
          ...commonFields,
          requestedTo: requestedTo ? formatDate(requestedTo) : null,
          proposedSubstituteUserId:
            proposedSubstituteUserId !== "" ? proposedSubstituteUserId : null,
        };
     
        if (
          validatePayload(payload, [
            "requestedFrom",
            "requestedTo",
            "decreaseFromAvaliableVacation",
          ])
        ) {
          dispatch(requestsVacationDays(payload));
        }
        break;
      case 1:
        payload = { ...commonFields, hoursOff };
        if (
          validatePayload(payload, [
            "requestedFrom",
            "hoursOff",
            "decreaseFromAvaliableVacation",
          ])
        ) {
          dispatch(requestsVacationHours(payload));
        }
        break;
      //   case 2:
      //     payload = { ...commonFields, requestedTo, proposedSubstituteUserId };
      //     if (
      //       validatePayload(payload, [
      //         "requestedFrom",
      //         "requestedTo",
      //         "decreaseFromAvaliableVacation",
      //       ])
      //     ) {
      //       dispatch(requestsVacationSick(payload));
      //     }
      // break;
      default:
        console.error("Invalid request type");
    }
  };

  const handleOpenModal = () => {
    if (disabled) {
      return;
    }
    setShowDateStart(false);
    setShowDateEnd(false);
    setModalVacationUse(true);
    setRequestedFrom(null);
    setRequestedTo(null);
    setValidateAvalableDaysOff(false);
    setValidateAvailableHoursOff(false);
    setProposedSubstituteUserId("");
    setDecreaseFromAvaliableVacation(true);
    setRequesterComment("");
    setNumberOfDays("");
    setDaysOffMessage("");
    setVacationRequestError("");
    setRequestFor(0);
    setStartDateTime(null);
    
    // Reset to default times
    const defaultStart = new Date();
    defaultStart.setHours(9, 0, 0, 0); // 9:00 AM
    setStartTime(defaultStart);
    
    const defaultEnd = new Date();
    defaultEnd.setHours(17, 0, 0, 0); // 5:00 PM
    setEndTime(defaultEnd);
    
    // Calculate default hoursOff (8 hours)
    setHoursOff(8);
  };

  function handleDecrease() {
    setDecreaseFromAvaliableVacation(!decreaseFromAvaliableVacation);
  }

  //   const onChangeDaysOff = (date) => {

  //     setShowDateEnd(false);
  //     if (requestedFrom && date?.date) {
  //       const difference = date.date.getTime() + 82800 - requestedFrom?.getTime();
  //       const days = Math.ceil(difference / (1000 * 3600 * 24));
  //       if (maxday > days) {
  //         setRequestedFrom(dateFormat(requestedFrom));
  //         setRequestedTo(dateFormat(date.date));
  //         setValidateAvalableDaysOff(false);
  //       } else {
  //         setValidateAvalableDaysOff(true);
  //       }
  //     }
  //   };

  const selectDateTimeStart = (date) => {
    setStartDateTime(date.date);
    setRequestedFrom(date.date);
    setShowDateTimeStart(false);
  };

  const hideDatePicker = () => {
    setTimeStartVisible(false);
    setTimeEndVisible(false);
  };
  const handleConfirmTimeStart = (date) => {
    setStartTime(date);
    setTimeStartVisible(false);
  };

  const onChangeHoursOff = (date) => {
    setEndTime(date);
    setTimeEndVisible(false);
    
    if (startTime && date) {
      const hoursOff = date.getHours() - startTime.getHours();
      
      if (maxHour >= hoursOff) {
        setHoursOff(hoursOff);
        // Only update requestedFrom if startDateTime is available and we haven't set it yet
        if (startDateTime && !requestedFrom) {
          setRequestedFrom(
            new Date(startDateTime.setHours(startTime.getHours()))
          );
        }
        setValidateAvailableHoursOff(false);
      } else {
        setValidateAvailableHoursOff(true);
      }
    }
  };

  const calculateEndDate = (startDate, days) => {
    if (!startDate) return null;
    return addWorkingDays(startDate, days);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVacationUse}
      >
        <DatePicker
          colorOptions={{ headerColor: "#2196F3" }}
          isVisible={showDateStart}
          mode={"single"}
          onCancel={() => setShowDateStart(false)}
          onConfirm={(date) => {
            setRequestedFrom(date.date);
            setShowDateStart(false);
            return;
          }}
          minDate={new Date()}
        />
        <DatePicker
          colorOptions={{ headerColor: "#2196F3" }}
          isVisible={showDateEnd}
          mode={"single"}
          onCancel={() => setShowDateEnd(false)}
          onConfirm={(date) => {
            setRequestedTo(date.date);
            setShowDateEnd(false);
            return;
          }}
          minDate={new Date()}
        />
        <DatePicker
          colorOptions={{ headerColor: "#2196F3" }}
          isVisible={showDateTimeStart}
          mode={"single"}
          onCancel={() => setShowDateTimeStart(false)}
          onConfirm={selectDateTimeStart}
          minDate={new Date()}
        />
        <DateTimePickerModal
          isVisible={isTimeStartVisible}
          mode="time"
          onConfirm={handleConfirmTimeStart}
          onCancel={hideDatePicker}
        />
        <DateTimePickerModal
          isVisible={isTimeEndVisible}
          mode="time"
          onConfirm={onChangeHoursOff}
          onCancel={hideDatePicker}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={modalStyle.centeredView}>
              <View style={modalStyle.modalView}>
                <Box style={modalStyle.modalInput}>
                  <View style={modalStyle.modalViewTitle}>
                    <Text style={modalStyle.modalTitle}>
                      <FormattedMessage id="Vacation.Request.Modal.Title" />
                    </Text>
                  </View>
                  {vacationRequestError ? (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorBannerText}>
                        {vacationRequestError}
                      </Text>
                    </View>
                  ) : null}
                  <View style={{ paddingHorizontal: 10 }}>
                    <>
                      <Box style={styles.viewHeader}>
                        <TouchableOpacity
                          onPress={() => setRequestFor(0)}
                          style={requestFor === 0 ? styles.box : styles.box2}
                        >
                          <Text
                            style={
                              requestFor === 0 ? styles.title : styles.title2
                            }
                          >
                            {" "}
                            <FormattedMessage id="Day" />
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setRequestFor(1)}
                          style={requestFor === 1 ? styles.box : styles.box2}
                        >
                          <Text
                            style={
                              requestFor === 1 ? styles.title : styles.title2
                            }
                          >
                            <FormattedMessage id="Hour" />
                          </Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                          onPress={() => setRequestFor(2)}
                          style={requestFor === 2 ? styles.box : styles.box2}
                        >
                          <Text
                            style={
                              requestFor === 2 ? styles.title : styles.title2
                            }
                          >
                            <FormattedMessage id="Vacation.Request.Sick" />
                          </Text>
                        </TouchableOpacity> */}
                      </Box>
                      {/* <FormattedMessage id="Available.Days.Off">
                        {(placeholder) => (
                          <Input
                            size={"lg"}
                            _focus
                            w="70%"
                            type="text"
                            keyboardType="numeric"
                            placeholder={placeholder.toString()}
                            value={numberOfDays}
                            onChangeText={(e) => setNumberOfDays(e)}
                            style={{ backgroundColor: "#fff" }}
                            my={3}
                          />
                        )}
                      </FormattedMessage> */}
                      {(() => {
                        if (requestFor === 0) {
                          return (
                            <>
                              <Box
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => {
                                    Keyboard.dismiss();
                                    setShowDateStart(true);
                                  }}
                                  style={{ marginBottom: 10, width: "45%" }}
                                >
                                  <Text
                                    style={[
                                      styles.inputDate,
                                      {
                                        color: requestedFrom
                                          ? colors.black
                                          : colors.gray_100,
                                      },
                                    ]}
                                  >
                                    {requestedFrom ? (
                                      <FormatDateTime
                                        datevalue={requestedFrom}
                                        type={1}
                                      />
                                    ) : (
                                      <FormattedMessage id="from" />
                                    )}
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => {
                                    Keyboard.dismiss();
                                    setShowDateEnd(true);
                                  }}
                                  style={{ marginBottom: 10, width: "45%" }}
                                >
                                  <Text
                                    style={[
                                      styles.inputDate,
                                      {
                                        color: requestedTo
                                          ? colors.black
                                          : colors.gray_100,
                                      },
                                    ]}
                                  >
                                    {requestedTo ? (
                                      <FormatDateTime
                                        datevalue={requestedTo}
                                        type={1}
                                      />
                                    ) : (
                                      <FormattedMessage id="tu" />
                                    )}
                                  </Text>
                                </TouchableOpacity>
                              </Box>
                              {daysOffMessage && (
                                <View
                                  style={[
                                    {
                                      borderRadius: 5,
                                      backgroundColor: validateAvalableDaysOff
                                        ? colors.error_200
                                        : colors.success_80,
                                    },
                                    p[2],
                                    my[2],
                                  ]}
                                >
                                  <Text
                                    style={[
                                      {
                                        color: validateAvalableDaysOff
                                          ? colors.white
                                          : colors.success_100,
                                      },
                                    ]}
                                  >
                                    {daysOffMessage}
                                  </Text>
                                </View>
                              )}
                            </>
                          );
                        } else if (requestFor === 1) {
                          return (
                            <View>
                              <TouchableOpacity
                                onPress={() => {
                                  Keyboard.dismiss();
                                  setShowDateTimeStart(true);
                                }}
                                style={{ marginBottom: 10 }}
                              >
                                <Text
                                  style={[
                                    styles.inputDate,
                                    {
                                      color: startDateTime
                                        ? colors.black
                                        : colors.gray_100,
                                    },
                                  ]}
                                >
                                  {startDateTime ? (
                                    <FormatDateTime
                                      datevalue={startDateTime}
                                      type={1}
                                    />
                                  ) : (
                                    <FormattedMessage id="Day" />
                                  )}
                                </Text>
                              </TouchableOpacity>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => {
                                    Keyboard.dismiss();
                                    setTimeStartVisible(true);
                                  }}
                                  style={{ marginBottom: 10 }}
                                >
                                  <Text style={styles.inputDate}>
                                    <FormatDateTime
                                      datevalue={startTime}
                                      type={0}
                                    />
                                  </Text>
                                </TouchableOpacity>
                                <Text style={{ fontSize: 18, padding: 5 }}>
                                  {" "}
                                  -{" "}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    Keyboard.dismiss();
                                    setTimeEndVisible(true);
                                  }}
                                  style={{ marginBottom: 10 }}
                                >
                                  <Text style={styles.inputDate}>
                                    <FormatDateTime
                                      datevalue={endTime}
                                      type={0}
                                    />
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              {validateAvailableHoursOff && daysOffMessage && (
                                <Text
                                  style={{ fontSize: 14, color: "#dc3545" }}
                                >
                                  <FormattedMessage id="Not.Enough.Vacation.Time.Available" />
                                </Text>
                              )}
                            </View>
                          );
                        }
                      })()}
                      <View>
                        <Text style={{ fontSize: 14, color: "#6c757d" }}>
                          <FormattedMessage id="Vacation.Proposed.Substitute" />
                        </Text>
                        <SelectUser setUserId={setProposedSubstituteUserId} />
                      </View>
                      <FormattedMessage id="Comment.vacation.optional">
                        {(placeholder) => (
                          <TextArea
                            size={"lg"}
                            _focus
                            w="100%"
                            type="text"
                            placeholder={placeholder.toString()}
                            value={requesterComment}
                            onChangeText={(e) => setRequesterComment(e)}
                            style={{ backgroundColor: "#fff" }}
                            my={3}
                          />
                        )}
                      </FormattedMessage>
                    </>
                    {/* <Box
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                        justifyContent: "space-between",
                        paddingHorizontal: 10,
                        paddingBottom: 10,
                      }}
                    >
                      <Text>
                        <FormattedMessage id="Decrease.from.avaliable.vacation" />
                      </Text>
                      <Switch
                        trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                        thumbColor={
                          decreaseFromAvaliableVacation ? "#007bff" : "#f4f3f4"
                        }
                        ios_backgroundColor="#7d7d7d"
                        onValueChange={handleDecrease}
                        value={decreaseFromAvaliableVacation}
                      />
                    </Box> */}
                  </View>
                </Box>
                <Box style={modalStyle.ModalBottom}>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonClose]}
                    onPress={() => setModalVacationUse(false)}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="common.button.close" />
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonAdd]}
                    onPress={handleRequestsVacation}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="common.button.confirm" />
                    </Text>
                  </TouchableOpacity>
                </Box>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
      <TouchableOpacity
        onPress={handleOpenModal}
        style={[
          modalStyle.btnVacation,
          disabled && styles.actionButtonDisabled,
        ]}
        disabled={disabled}
      >
        <FontAwesome5 name="umbrella-beach" size={20} color="#4CAF50" />
      </TouchableOpacity>
    </>
  );
};
const styles = StyleSheet.create({
  boxDate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    marginBottom: 10,
  },
  inputDate: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
  },
  viewHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    backgroundColor: "#ebf0f3",
    borderRadius: 10,
    padding: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  box: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  box2: {
    alignItems: "center",
    padding: 5,
  },
  title: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "600",
  },
  title2: {
    color: "#21252980",
    fontSize: 14,
    fontWeight: "600",
  },
  errorBanner: {
    backgroundColor: colors.error_200,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorBannerText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});
export default ModalRequestVacation;
