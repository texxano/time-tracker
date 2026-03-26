import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Input, Icon, Checkbox } from "native-base";
import {
  Text,
  Modal,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";
import { updateUserProfile } from "../../../redux/actions/UsersTeams/user.actions";
import InitialUser from "../../../components/InitialUser";
import { modalStyle } from "../../../asset/style/components/modalStyle";

const ModalEditUser = ({ dataUser, openFromModal }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const user = state.user;

  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [id] = useState(dataUser.id);
  const [firstName, setFirstName] = useState(dataUser.firstName);
  const [lastName, setLastName] = useState(dataUser.lastName);
  const [phoneNumber, setPhoneNumber] = useState(dataUser.phoneNumber);
  const [email, setEmail] = useState(dataUser.userName);
  const [password, setPassword] = useState(null);
  const [language] = useState(dataUser.language);
  const [countryCode] = useState(dataUser.countryCode);
  const [timeZoneId] = useState(dataUser.timeZoneId);
  const [enableTracking] = useState(dataUser.enableTracking);
  const [show, setShow] = React.useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const [errorPas, setErrorPas] = useState(false);
  useEffect(() => {
    closeModal();
  }, [user]);
  const closeModal = () => {
    setModalEditVisible(false);
    setChangePassword(false);
    setSubmitted(false);
    setPassword(null);
    setErrorPas(false);
  };
  function validatePassword(p) {
    if (p.length < 8) {
      setErrorPassword("login.form.password.error.min");
      return false;
    }
    if (p.search(/^(?=.*[a-z])(?=.*[A-Z])/) === -1) {
      setErrorPassword("login.form.password.error.capitalLetters");
      return false;
    }
    if (p.search(/\d/) === -1) {
      setErrorPassword("login.form.password.error.numbers");
      return false;
    }
    return true;
  }
  const handleUpdateUser = () => {
    setSubmitted(true);
    if (
      (submitted && !firstName && !lastName) ||
      (changePassword && !password)
    ) {
    } else if (!firstName || !lastName || (changePassword && !password)) {
    } else {
      const payload = {
        id,
        firstName,
        lastName,
        phoneNumber,
        email,
        language,
        countryCode,
        timeZoneId,
        enableTracking,
      };
      if (password) {
        if (validatePassword(password)) {
          dispatch(updateUserProfile(payload, password));
          setErrorPas(false);
        } else {
          setErrorPas(true);
        }
      } else {
        dispatch(updateUserProfile(payload));
      }
    }
  };
  const handleModalVisible = () => {
    setModalEditVisible(!modalEditVisible);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={modalStyle.centeredView}>
              <View style={modalStyle.modalView}>
                <View style={modalStyle.modalViewTitle}>
                  <Text style={modalStyle.modalTitle}>
                    <FormattedMessage id="users.edit.title" />
                  </Text>
                </View>
                <Box style={[modalStyle.modalInput, { paddingHorizontal: 17 }]}>
                  <FormattedMessage id="projects.form.users.firstName.placeholder">
                    {(placeholder) => (
                      <Input
                        size={"lg"}
                        _focus
                        w="100%"
                        type="text"
                        placeholder={placeholder.toString()}
                        value={firstName}
                        onChangeText={(e) => setFirstName(e)}
                        my={3}
                        style={{ height: 40, backgroundColor: "#fff" }}
                      />
                    )}
                  </FormattedMessage>
                  {submitted && !firstName && (
                    <Text style={{ fontSize: 14, color: "#dc3545" }}>
                      <FormattedMessage id="projects.form.users.firstName.error.required" />
                    </Text>
                  )}
                  <FormattedMessage id="projects.form.users.lastName.placeholder">
                    {(placeholder) => (
                      <Input
                        size={"lg"}
                        _focus
                        w="100%"
                        type="text"
                        placeholder={placeholder.toString()}
                        value={lastName}
                        onChangeText={(e) => setLastName(e)}
                        my={3}
                        style={{ height: 40, backgroundColor: "#fff" }}
                      />
                    )}
                  </FormattedMessage>
                  {submitted && !lastName && (
                    <Text style={{ fontSize: 14, color: "#dc3545" }}>
                      <FormattedMessage id="projects.form.users.lastName.error.required" />
                    </Text>
                  )}
                  <FormattedMessage id="projects.form.users.email.placeholder">
                    {(placeholder) => (
                      <Input
                        size={"lg"}
                        _focus
                        w="100%"
                        type="text"
                        placeholder={placeholder.toString()}
                        value={email}
                        onChangeText={(e) => setEmail(e)}
                        my={3}
                        keyboardType="email-address"
                        style={{ height: 40, backgroundColor: "#fff" }}
                        isDisabled={true}
                      />
                    )}
                  </FormattedMessage>
                  <FormattedMessage id="projects.form.users.phoneNumber.placeholder">
                    {(placeholder) => (
                      <Input
                        size={"lg"}
                        _focus
                        w="100%"
                        keyboardType="numeric"
                        placeholder={placeholder.toString()}
                        value={phoneNumber}
                        onChangeText={(e) => setPhoneNumber(e)}
                        my={3}
                        style={{ height: 40, backgroundColor: "#fff" }}
                      />
                    )}
                  </FormattedMessage>
                  {changePassword ? (
                    <>
                      <FormattedMessage id="projects.form.users.password.placeholder">
                        {(placeholder) => (
                          <Input
                            size={"lg"}
                            _focus
                            w="100%"
                            type={show ? "text" : "password"}
                            placeholder={placeholder.toString()}
                            value={password}
                            onChangeText={(e) => setPassword(e)}
                            my={3}
                            style={{ height: 40, backgroundColor: "#fff" }}
                            InputRightElement={
                              <>
                                {show ? (
                                  <Icon
                                    as={
                                      <Feather
                                        name="eye"
                                        size={16}
                                        color="black"
                                      />
                                    }
                                    size="sm"
                                    m={2}
                                    onPress={() => setShow(!show)}
                                  />
                                ) : (
                                  <Icon
                                    as={
                                      <Feather
                                        name="eye-off"
                                        size={16}
                                        color="black"
                                      />
                                    }
                                    size="sm"
                                    m={2}
                                    onPress={() => setShow(!show)}
                                  />
                                )}
                              </>
                            }
                          />
                        )}
                      </FormattedMessage>
                      {errorPas ? (
                        <Text style={{ fontSize: 14, color: "#dc3545" }}>
                          <FormattedMessage id={errorPassword} />
                        </Text>
                      ) : (
                        <></>
                      )}
                      {submitted && !password && changePassword && (
                        <Text style={{ fontSize: 14, color: "#dc3545" }}>
                          <FormattedMessage id="login.form.password.error.required" />
                        </Text>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                  <Box style={{ flexDirection: "row" }} my={3}>
                    <Text style={{ paddingRight: 18 }}>
                      <FormattedMessage id="users.profile.newPassword" />
                    </Text>
                    <Checkbox
                      onChange={() => setChangePassword(!changePassword)}
                      value={changePassword}
                      colorScheme="green"
                      size="sm"
                    />
                  </Box>
                </Box>
                <Box style={modalStyle.ModalBottom}>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonClose]}
                    onPress={closeModal}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="common.button.close" />
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonAdd]}
                    onPress={handleUpdateUser}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="projects.form.users.delete.modal.title" />
                    </Text>
                  </TouchableOpacity>
                </Box>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
      {openFromModal ? (
        <TouchableOpacity
          style={modalStyle.modalTitleEditView}
          onPress={handleModalVisible}
        >
          <Text style={modalStyle.modalMoreTitlekUser}>
            <FormattedMessage id="common.button.edit" />
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity onPress={handleModalVisible}>
            <InitialUser
              FirstName={dataUser.firstName}
              LastName={dataUser.lastName}
              color={dataUser.color}
            />
          </TouchableOpacity>
          <View onPress={handleModalVisible}>
            <Text style={modalStyle.title}>
              {firstName} {lastName}
            </Text>
            <Text
              style={[modalStyle.title, { fontSize: 14 }]}
              onPress={handleModalVisible}
            >
              {email}
            </Text>
          </View>
        </>
      )}
    </>
  );
};
export default ModalEditUser;
