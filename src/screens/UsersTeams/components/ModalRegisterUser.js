import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Input, Icon } from "native-base";
import {
  Text,
  Modal,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, Entypo } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";
import { createUser } from "../../../redux/actions/UsersTeams/user.actions";
import { modalStyle } from "../../../asset/style/components/modalStyle";

import {
  validateText,
  validateEmail,
  validatePassword,
} from "../../../utils/validate";
import SelectDropDown from "../../../components/SelectDropDown";

const ModalRegisterUser = ({ rootId }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const user = state.user;
  const userRequest = state.user.userRequest;
  const countryCodeState = state.userData?.countryCode;
  const timeZoneIdState = state.userData?.timeZoneId;

  const [modalVisible, setModalVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validateEmailStaus, setvalidateEmailStaus] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const [errorPas, setErrorPas] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [step, setStep] = useState(true);
  const language = state.userData.language;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState(countryCodeState);
  const [timeZoneId, setTimeZoneId] = useState(timeZoneIdState);
  const [teamId, setTeamId] = useState(null);

  var result = "";
  var characters =
    "01234567890123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  const [password, setPassword] = useState(result);
  const [show, setShow] = React.useState(false);
  useEffect(() => {
    if (user) {
      closeModal();
    }
  }, [user]);
  const closeModal = () => {
    setPassword(result);
    setModalVisible(false);
    setSubmitted(false);
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEmail("");
    setTeamId("");
    setStep(true);
  };
  const passwordStatus = validatePassword(password);
  useEffect(() => {
    if (!validateEmail(email.trim()) && email) {
      setvalidateEmailStaus(true);
    } else {
      setvalidateEmailStaus(false);
    }
    if (passwordStatus.error && password) {
      setErrorPas(true);
      setErrorPassword(passwordStatus.error);
    } else {
      setErrorPas(false);
    }
  }, [email, password]);

  const handleUser = () => {
    const payload = {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      language,
      rootId,
      countryCode,
      timeZoneId,
    };
    console.log(payload, "payload");
    setSubmitted(true);
    
    // Check validation step by step
    if (submitted && !firstName && !lastName && !email && !password) {
      console.log('❌ Validation failed - all fields empty (submitted check)');
    } else if (!firstName || !lastName || !email || !password) {
      console.log('❌ Validation failed - missing required fields:', { firstName, lastName, email, password });
    } else if (
      !validateText(firstName) ||
      !validateText(lastName) ||
      !validateEmail(email.trim()) ||
      passwordStatus.error
    ) {
      // Extra validation for first and last names
      if (!validateText(firstName)) {
        setFirstNameError("Only letters are allowed");
        console.log('❌ First name validation failed - only letters are allowed');
      } else {
        setFirstNameError("");
      }
      if (!validateText(lastName)) {
        setLastNameError("Only letters are allowed");
        console.log('❌ Last name validation failed - only letters are allowed');
      } else {
        setLastNameError("");
      }
      if (!validateEmail(email.trim())) {
        console.log('❌ Email validation failed - invalid email format');
      }
      if (passwordStatus.error) {
        console.log('❌ Password validation failed:', passwordStatus.error);
      }
      
      console.log('❌ Validation failed - invalid field formats:', {
        firstNameValid: validateText(firstName),
        lastNameValid: validateText(lastName),
        emailValid: validateEmail(email.trim()),
        passwordValid: !passwordStatus.error,
        passwordStatus
      });
    } else {
      console.log('✅ All validations passed, proceeding with dispatch');
      if (teamId) {
        payload["teamId"] = teamId;
      }
      console.log('🚀 Dispatching createUser with final payload:', payload);
      dispatch(createUser(payload));
    }
  };

  const handleModalVisible = () => {
    setModalVisible(!modalVisible);
  };
  return (
    <>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
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
                <View style={modalStyle.modalViewTitle}>
                  <Text style={modalStyle.modalTitle}>
                    <FormattedMessage id="projects.form.users.modal.add.title" />
                  </Text>
                </View>
                <Box style={[modalStyle.modalInput, { paddingHorizontal: 17 }]}>
                  {userRequest ? (
                    <ActivityIndicator size="large" color="#6c757d" />
                  ) : (
                    <></>
                  )}
                  <>
                    {step ? (
                      <>
                        <FormattedMessage id="projects.form.users.firstName.placeholder">
                          {(placeholder) => (
                            <Input
                              size={"lg"}
                              _focus
                              w="100%"
                              type="text"
                              placeholder={placeholder.toString()}
                              value={firstName}
                              onChangeText={(e) => {
                                setFirstName(e);
                                if (firstNameError && validateText(e)) {
                                  setFirstNameError("");
                                }
                              }}
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
                        {firstNameError && (
                          <Text style={{ fontSize: 14, color: "#dc3545" }}>
                            {firstNameError}
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
                              onChangeText={(e) => {
                                setLastName(e);
                                if (lastNameError && validateText(e)) {
                                  setLastNameError("");
                                }
                              }}
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
                        {lastNameError && (
                          <Text style={{ fontSize: 14, color: "#dc3545" }}>
                            {lastNameError}
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
                              style={{ height: 40, backgroundColor: "#fff" }}
                              keyboardType="email-address"
                            />
                          )}
                        </FormattedMessage>
                        {submitted && !email && (
                          <Text style={{ fontSize: 14, color: "#dc3545" }}>
                            <FormattedMessage id="projects.form.users.email.error.required" />
                          </Text>
                        )}
                        {submitted && validateEmailStaus && (
                          <Text style={{ fontSize: 14, color: "#dc3545" }}>
                            <FormattedMessage id="projects.form.users.email.error.format" />
                          </Text>
                        )}
                        <FormattedMessage id="projects.form.users.password.placeholder">
                          {(placeholder) => (
                            <Input
                              size={"lg"}
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
                      </>
                    ) : (
                      <>
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
                        <SelectDropDown
                          onSelected={(val) => {
                            setTimeZoneId(val);
                          }}
                          selected={timeZoneId}
                          type={1}
                          zIndex={99}
                        />
                        <SelectDropDown
                          onSelected={(val) => {
                            setCountryCode(val);
                          }}
                          selected={countryCode}
                          type={2}
                          zIndex={999}
                        />
                        <SelectDropDown
                          onSelected={(val) => {
                            setTeamId(val);
                          }}
                          selected={teamId}
                          type={3}
                          zIndex={9999}
                        />
                      </>
                    )}
                  </>
                  {submitted && errorPas ? (
                    <Text style={{ fontSize: 14, color: "#dc3545" }}>
                      <FormattedMessage id={errorPassword} />
                    </Text>
                  ) : (
                    <></>
                  )}
                  <View style={{ alignItems: "flex-end", paddingBottom: 10 }}>
                    <TouchableOpacity
                      onPress={() => {
                        console.log('🔄 Step navigation clicked - Current step:', step);
                        console.log('📝 Current form data:', { firstName, lastName, email, password });
                        setStep(!step);
                        console.log('🔄 New step will be:', !step);
                      }}
                      style={[modalStyle.button, modalStyle.buttonBlueOutline]}
                    >
                      <Text style={modalStyle.textBlueOutline}>
                        {step ? <>Next {">"}</> : <>{"<"}Previous</>}
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                    onPress={handleUser}
                    disabled={userRequest}
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
      <TouchableOpacity
        onPress={handleModalVisible}
        style={modalStyle.btnCircle}
      >
        <Entypo name="plus" size={24} color="#6c757d" />
      </TouchableOpacity>
    </>
  );
};
export default ModalRegisterUser;
