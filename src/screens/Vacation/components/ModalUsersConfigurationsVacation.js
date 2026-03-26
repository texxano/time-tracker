/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "native-base";
import {
  Text,
  Modal,
  TouchableOpacity,
  View,
  Switch,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { userApproverVacation } from "../../../redux/actions/Vacation/vacationUserConfigurations.actions";
import { modalStyle } from "../../../asset/style/components/modalStyle";

const ModalUsersConfigurationsVacation = ({ dataUser }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const vacations = state.vacations;
  const [modalVacationUse, setModalVacationUse] = useState(false);

  useEffect(() => {
    if (vacations) {
      setModalVacationUse(false);
    }
  }, [vacations]);
  const userId = dataUser?.userId;
  const [availableDaysOff, setAvailableDaysOff] = useState(
    dataUser?.availableDaysOff?.toString()
  );
  const [hoursPerWorkingDay, setHoursPerWorkingDay] = useState(
    dataUser?.hoursPerWorkingDay?.toString()
  );
  const [availableHoursOff, setAvailableHoursOff] = useState(
    dataUser?.availableHoursOff?.toString()
  );
  const [isSupervisor, setIsSupervisor] = useState(dataUser?.isSupervisor);
  const [canSeeAllUsers, setCanSeeAllUsers] = useState(dataUser?.canSeeAllUsers);
  const [canApprove, setCanApprove] = useState(dataUser?.canApprove);

  const handleOpenModal = () => {
    setModalVacationUse(true);
  };
  const minday = 1;
  const maxday = 100;
  const handleChangeAvailableDaysOff = (event) => {
    const value = Math.max(minday, Math.min(maxday, Number(event)));
    setAvailableDaysOff(value);
  };
  const minHour = 1;
  const maxHour = 23;
  const handleChangeHoursPerWorking = (event) => {
    const value = Math.max(minHour, Math.min(maxHour, Number(event)));
    setHoursPerWorkingDay(value);
  };
  const handleChangeAvailableHoursOff = (event) => {
    const value = Math.max(minHour, Math.min(maxHour, Number(event)));
    setAvailableHoursOff(value);
  };

  const handleUserApproverVacation = () => {
    const payload = {
      userId,
      availableDaysOff,
      hoursPerWorkingDay,
      availableHoursOff,
      isSupervisor,
      canSeeAllUsers,
      canApprove
    };
 
    dispatch(userApproverVacation(payload));
  };



  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVacationUse}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            {dataUser ? (
              <View style={modalStyle.centeredView}>
                <View style={modalStyle.modalView}>
                  <View style={modalStyle.modalViewTitle}>
                    <Text style={modalStyle.modalTitle}>
                      {dataUser.firstName} {dataUser.lastName}
                    </Text>
                  </View>
                  <View
                    style={[modalStyle.modalInput, { paddingHorizontal: 17 }]}
                  >
                    <View>
                      <Text>
                        <FormattedMessage id="Available.Days.Off" />
                      </Text>
                      <FormattedMessage id="Available.Days.Off">
                        {(placeholder) => (
                          <Input
                            size={"lg"}
                            value={availableDaysOff}
                            onChangeText={handleChangeAvailableDaysOff}
                            _focus
                            w="100%"
                            keyboardType="numeric"
                            placeholder={placeholder.toString()}
                            my={3}
                            style={{ height: 40, backgroundColor: "#fff" }}
                          />
                        )}
                      </FormattedMessage>
                    </View>
                    <View>
                      <Text>
                        <FormattedMessage id="hours.working.day" />
                      </Text>
                      <FormattedMessage id="hours.working.day">
                        {(placeholder) => (
                          <Input
                            size={"lg"}
                            _focus
                            w="100%"
                            keyboardType="numeric"
                            placeholder={placeholder.toString()}
                            my={3}
                            style={{ height: 40, backgroundColor: "#fff" }}
                            value={hoursPerWorkingDay}
                            onChangeText={handleChangeHoursPerWorking}
                          />
                        )}
                      </FormattedMessage>
                    </View>
                    <View>
                      <Text>
                        <FormattedMessage id="available.hours.Off" />
                      </Text>
                      <FormattedMessage id="available.hours.Off">
                        {(placeholder) => (
                          <Input
                            size={"lg"}
                            _focus
                            w="100%"
                            keyboardType="numeric"
                            placeholder={placeholder.toString()}
                            my={3}
                            style={{ height: 40, backgroundColor: "#fff" }}
                            value={availableHoursOff}
                            onChangeText={handleChangeAvailableHoursOff}
                          />
                        )}
                      </FormattedMessage>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        paddingBottom: 15,
                      }}
                    >
                      <Text style={{ color: "#6c757d", fontSize: 14,  }}>
                        <FormattedMessage id="Is.Supervisor" />
                      </Text>
                      <Switch
                        trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                        thumbColor={isSupervisor ? "#007bff" : "#f4f3f4"}
                        ios_backgroundColor="#7d7d7d"
                        onValueChange={() => setIsSupervisor(!isSupervisor)}
                        value={isSupervisor}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        paddingBottom: 15,
                      }}
                    >
                      <Text style={{ color: "#6c757d", fontSize: 14,  }}>
                        <FormattedMessage id="vacation.CanViewAllUserSee" />
                      </Text>
                      <Switch
                        trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                        thumbColor={canSeeAllUsers ? "#007bff" : "#f4f3f4"}
                        ios_backgroundColor="#7d7d7d"
                        onValueChange={() => setCanSeeAllUsers(!canSeeAllUsers)}
                        value={canSeeAllUsers}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        paddingBottom: 15,
                      }}
                    >
                      <Text style={{ color: "#6c757d", fontSize: 14,  }}>
                        <FormattedMessage id="vacation.CanApproveVacation" />
                      </Text>
                      <Switch
                        trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                        thumbColor={canApprove ? "#007bff" : "#f4f3f4"}
                        ios_backgroundColor="#7d7d7d"
                        onValueChange={() => setCanApprove(!canApprove)}
                        value={canApprove}
                      />
                    </View>
                  </View>
                  <View style={modalStyle.ModalBottom}>
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
                      onPress={handleUserApproverVacation}
                    >
                      <Text style={modalStyle.textStyle}>
                        <FormattedMessage id="common.button.confirm" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <></>
            )}
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
      <TouchableOpacity onPress={handleOpenModal}>
        <View
          style={{
            backgroundColor: "#ebf0f3",
            borderWidth: 1,
            borderColor: "#d3d8da",
            borderRadius: 8,
            padding: 6,
            marginLeft: 15,
            alignSelf: "flex-start",
          }}
        >
          <Feather name="edit" size={20} color="#6c757d" />
        </View>
      </TouchableOpacity>
    </>
  );
};

export default ModalUsersConfigurationsVacation;
