/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Box, TextArea } from "native-base";
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
} from "react-native";
import DatePicker from "react-native-neat-date-picker";
import { useDispatch, useSelector } from "react-redux";

import {
  closeSickLeave,
  requestsVacationSick,
} from "../../../redux/actions/Vacation/vacationRequests.actions";
import { modalStyle } from "../../../asset/style/components/modalStyle";

import FormatDateTime from "../../../components/FormatDateTime";

import colors from "../../../constants/Colors";
import { mx, my, p } from "../../../asset/style/utilities.style";
import FileOrPicUpload from "../../../components/FileOrPicUpload/FileOrPicUpload";

const ModalRequestSeekLeave = ({
  type,
  sickLeaveId,
  isSickLeaveModalOpen,
  toggleModal,
}) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const { iosCameraStart } = state.documentTask;
  const [startSickDate, setStartSickDate] = useState(null);
  const [showStartSickDate, setShowStartSickDate] = useState(false);

  const [endSickDate, setEndSickDate] = useState(null);
  const [showEndSickDate, setShowEndSickDate] = useState(false);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  // Updated checkAvailability returns a promise and updates availableDays.
  const handleSubmit = async () => {
    if (type === "start") {
      if (startSickDate) {
        const formattedStartDate = formatDate(startSickDate);
        const dataBody = {
          requestedFrom: formattedStartDate,
          requesterComment: comment,
          decreaseFromAvailableVacation: false,
        };
        dispatch(requestsVacationSick(dataBody));
      }
    } else if (type === "close") {
      if (endSickDate && file) {
        const formattedEndDate = formatDate(endSickDate);
        const dataBody = {
          id: sickLeaveId,
          requestDocument: file,
          endDate: formattedEndDate,
        };

        dispatch(closeSickLeave(dataBody));
      }
    }
    toggleModal();
  };

  useEffect(() => {
    setFile(null);
    setEndSickDate(null);
    setStartSickDate(null);
    setComment("");
  }, [isSickLeaveModalOpen]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isSickLeaveModalOpen}
    >
      <DatePicker
        colorOptions={{ headerColor: "#2196F3" }}
        isVisible={showStartSickDate}
        mode={"single"}
        onCancel={() => setShowStartSickDate(false)}
        onConfirm={(date) => {
          setStartSickDate(date.date);
          setShowStartSickDate(false);
        }}
        minDate={new Date()}
        dateStringFormat="dd/MM/yyyy"
      />
      <DatePicker
        colorOptions={{ headerColor: "#2196F3" }}
        isVisible={showEndSickDate}
        mode={"single"}
        onCancel={() => setShowEndSickDate(false)}
        onConfirm={(date) => {
          setEndSickDate(date.date);
          setShowEndSickDate(false);
          return;
        }}
        minDate={new Date()}
        dateStringFormat="dd/MM/yyyy"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <>
            <View style={[modalStyle.centeredView]}>
              <View style={modalStyle.modalView}>
                <Box style={modalStyle.modalInput}>
                  {!iosCameraStart && (
                    <View style={modalStyle.modalViewTitle}>
                      <Text style={modalStyle.modalTitle}>
                        {type === "start" ? (
                          <FormattedMessage id="start.sick.leave" />
                        ) : (
                          <FormattedMessage id="close.sick.leave" />
                        )}
                      </Text>
                    </View>
                  )}

                  <View style={[mx[4]]}>
                    {type === "start" ? (
                      <>
                        <TouchableOpacity
                          onPress={() => setShowStartSickDate(true)}
                          style={{ marginBottom: 10 }}
                        >
                          <Text
                            style={[
                              styles.inputDate,
                              {
                                color: startSickDate
                                  ? colors.black
                                  : colors.gray_100,
                              },
                            ]}
                          >
                            {startSickDate ? (
                              <FormatDateTime
                                datevalue={startSickDate}
                                type={1}
                              />
                            ) : (
                              <FormattedMessage id="Date" />
                            )}
                          </Text>
                        </TouchableOpacity>
                        <FormattedMessage id="Comment.vacation.optional">
                          {(placeholder) => (
                            <TextArea
                              size={"lg"}
                              _focus
                              w="100%"
                              type="text"
                              placeholder={placeholder.toString()}
                              value={comment}
                              onChangeText={(e) => setComment(e)}
                              style={{ backgroundColor: "#fff" }}
                              my={3}
                            />
                          )}
                        </FormattedMessage>
                      </>
                    ) : (
                      <>
                        <View style={[my[4], mx[4]]}>
                          <FileOrPicUpload
                            document={file}
                            setDocument={setFile}
                 
                          />
                        </View>
                             {/* solving ioscamera UI issues */}
                        {!iosCameraStart && 
                          <TouchableOpacity
                          onPress={() => setShowEndSickDate(true)}
                          style={{ marginBottom: 10 }}
                        >
                          <Text
                            style={[
                              styles.inputDate,
                              {
                                color: endSickDate
                                  ? colors.black
                                  : colors.gray_100,
                              },
                            ]}
                          >
                            {endSickDate ? (
                              <FormatDateTime
                                datevalue={endSickDate}
                                type={1}
                              />
                            ) : (
                              <FormattedMessage id="Date" />
                            )}
                          </Text>
                        </TouchableOpacity>
                        }
                      </>
                    )}
                  </View>
                </Box>
                     {/* solving ioscamera UI issues */}
                {!iosCameraStart && (
                  <Box style={modalStyle.ModalBottom}>
                    <TouchableOpacity
                      style={[modalStyle.button, modalStyle.buttonClose]}
                      onPress={toggleModal}
                    >
                      <Text style={modalStyle.textStyle}>
                        <FormattedMessage id="common.button.close" />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modalStyle.button, modalStyle.buttonAdd]}
                      onPress={handleSubmit}
                      disabled={
                        (type === "start" && !startSickDate) ||
                        (type === "close" && (!endSickDate || !file))
                      }
                    >
                      <Text style={modalStyle.textStyle}>
                        <FormattedMessage id="common.button.confirm" />
                      </Text>
                    </TouchableOpacity>
                  </Box>
                )}
              </View>
            </View>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
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
});
export default ModalRequestSeekLeave;
