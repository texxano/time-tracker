import React, { useState, useEffect } from "react";
import { ActivityIndicator, Switch, ScrollView } from "react-native";
import { Text, Input, Button, Box, View } from "native-base";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import http from "../../services/http";
import { updateMyProfile } from "../../redux/actions/UsersTeams/user.actions";

import InitialUser from "../../components/InitialUser";
import HeaderProfile from "./components/HeaderProfile";
import LanguageSelectProfile from "../../components/LanguageSelectProfile";
import SelectDropDown from "../../components/SelectDropDown";

import { profileStyle } from "../../asset/style/Profile/profileStyle";
import AppContainerClean from "../../components/AppContainerClean";

const Profile = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const user = state.user;
  const userId = state.userDataRole.userId;
  const firstNameState = state.userData.firstName;
  const lastNamestate = state.userData.lastName;
  const phoneNumberState = state.userData.phoneNumber;
  const colorState = state.userData.color;
  const enableTrackingState = state.userData.enableTracking;
  const request = state.user.userRequest;

  const [firstName, setFirstName] = useState(firstNameState);
  const [lastName, setLastName] = useState(lastNamestate);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(phoneNumberState);
  const [submitted, setSubmitted] = useState(false);
  const [changeProfile, setChangeProfile] = useState(true);
  const [selectLanguage, setSelectLanguage] = useState("");
  const [enableTracking, setEnableTracking] = useState(enableTrackingState);
  const [countryCode, setCountryCode] = useState("");
  const [timeZoneId, setTimeZoneId] = useState("");

  useEffect(() => {
    const getData = async () => {
      if (user) {
        setChangeProfile(true);
        http.get(`/users/me`).then((data) => {
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setEmail(data.userName);
          setPhoneNumber(data.phoneNumber);
          setSelectLanguage(data.language);
          setFirstName(data.firstName);
          setEnableTracking(data.enableTracking);
          setCountryCode(data.countryCode);
          setTimeZoneId(data.timeZoneId);
        });
      }
    };
    getData();
  }, [user]);

  function handleChangeProfile(type) {
    if (type === "edit") {
      setChangeProfile(false);
    } else {
      setChangeProfile(true);
      setFirstName(firstNameState);
      setLastName(lastNamestate);
      setPhoneNumber(phoneNumberState);
    }
  }
  function handleProfile() {
    setSubmitted(true);
    if (submitted && !firstName && !lastName && !email && !language) {
    } else if (!firstName || !lastName) {
    } else {
      dispatch(
        updateMyProfile(
          userId,
          firstName,
          lastName,
          phoneNumber,
          email,
          selectLanguage,
          enableTracking,
          countryCode
        )
      );
    }
  }

  return (
    <AppContainerClean location={"Profile"}>
      <HeaderProfile location={"Profile"} />
      <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
        <ScrollView style={{ flex: 1}}>
          <View
            style={{
              backgroundColor: "#ebf0f3",
              padding: 15,
              borderRadius: 5,
              height: "auto",
            }}
          >
            <Box style={{ alignSelf: "flex-start" }}>
              <InitialUser
                FirstName={firstNameState}
                LastName={lastNamestate}
                color={colorState}
              />
            </Box>
            <Box style={profileStyle.box}>
              <Text style={profileStyle.text}>
                <FormattedMessage id="projects.form.users.firstName.placeholder" />
              </Text>
              <Box style={{ width: "60%" }}>
                <FormattedMessage id="projects.form.users.firstName.placeholder">
                  {(placeholder) => (
                    <Input
                      size={"lg"}
                      _focus
                      w="100%"
                      mx={3}
                      type="text"
                      placeholder={placeholder.toString()}
                      value={firstName}
                      onChangeText={(e) => setFirstName(e)}
                      my={3}
                      isDisabled={changeProfile}
                      style={{ height: 40, backgroundColor: "#fff" }}
                    />
                  )}
                </FormattedMessage>
                {submitted && !firstName && (
                  <Text style={{ fontSize: 14, color: "#dc3545" }}>
                    <FormattedMessage id="projects.form.users.firstName.error.required" />
                  </Text>
                )}
              </Box>
            </Box>
            <Box style={profileStyle.box}>
              <Text style={profileStyle.text}>
                <FormattedMessage id="projects.form.users.lastName.placeholder" />
              </Text>
              <Box style={{ width: "60%" }}>
                <FormattedMessage id="projects.form.users.lastName.placeholder">
                  {(placeholder) => (
                    <Input
                      size={"lg"}
                      _focus
                      w="100%"
                      mx={3}
                      type="text"
                      placeholder={placeholder.toString()}
                      value={lastName}
                      onChangeText={(e) => setLastName(e)}
                      my={3}
                      isDisabled={changeProfile}
                      style={{ height: 40, backgroundColor: "#fff" }}
                    />
                  )}
                </FormattedMessage>
                {submitted && !lastName && (
                  <Text style={{ fontSize: 14, color: "#dc3545" }}>
                    <FormattedMessage id="projects.form.users.lastName.error.required" />
                  </Text>
                )}
              </Box>
            </Box>
            <Box style={profileStyle.box}>
              <Text style={profileStyle.text}>
                <FormattedMessage id="projects.form.users.email.placeholder" />
              </Text>
              <FormattedMessage id="projects.form.users.email.placeholder">
                {(placeholder) => (
                  <Input
                    size={"lg"}
                    _focus
                    w="60%"
                    mx={3}
                    type="text"
                    placeholder={placeholder.toString()}
                    value={email}
                    my={3}
                    isDisabled={true}
                    keyboardType="email-address"
                    style={{ height: 40, backgroundColor: "#fff" }}
                  />
                )}
              </FormattedMessage>
            </Box>

            <Box style={profileStyle.box}>
              <Text style={profileStyle.text}>
                <FormattedMessage id="projects.form.users.phoneNumber.placeholder" />
              </Text>
              <FormattedMessage id="projects.form.users.phoneNumber.placeholder">
                {(placeholder) => (
                  <Input
                    size={"lg"}
                    _focus
                    w="60%"
                    mx={3}
                    keyboardType="numeric"
                    placeholder={placeholder.toString()}
                    value={phoneNumber}
                    onChangeText={(e) => setPhoneNumber(e)}
                    my={3}
                    isDisabled={changeProfile}
                    style={{ height: 40, backgroundColor: "#fff" }}
                  />
                )}
              </FormattedMessage>
            </Box>
            <Box style={[profileStyle.boxNotifications, { marginRight: 20 }]}>
              <Text style={profileStyle.textNotifications}>
                <FormattedMessage id="Enable.Tracking" />
              </Text>
              <Switch
                trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                thumbColor={enableTracking ? "#007bff" : "#f4f3f4"}
                ios_backgroundColor="#7d7d7d"
                onValueChange={() => setEnableTracking(!enableTracking)}
                value={enableTracking}
                disabled={changeProfile}
              />
            </Box>
            <Box style={profileStyle.box}>
              <Text style={profileStyle.text}>
                <FormattedMessage id="projects.form.users.language.placeholder" />
              </Text>
              <View style={{ width: "63%" }}>
                <LanguageSelectProfile
                  onSelected={(val) => {
                    setSelectLanguage(val);
                  }}
                  selected={selectLanguage}
                  disable={changeProfile}
                />
              </View>
            </Box>
            <Box style={[profileStyle.box, { marginVertical: 15 }]}>
              <Text style={profileStyle.text}>
                <FormattedMessage id="country.placeholder" />
              </Text>
              <View style={{ width: "63%" }}>
                <SelectDropDown
                  onSelected={(val) => {
                    setCountryCode(val);
                  }}
                  selected={countryCode}
                  type={2}
                  zIndex={20}
                  disable={changeProfile}
                />
              </View>
            </Box>
            <Box style={[profileStyle.box, { marginBottom: 15 }]}>
              <Text style={profileStyle.text}>
                <FormattedMessage id="time.zone.placeholder" />
              </Text>
              <View style={{ width: "63%" }}>
                <SelectDropDown
                  onSelected={(val) => {
                    setTimeZoneId(val);
                  }}
                  selected={timeZoneId}
                  type={1}
                  zIndex={10}
                  disable={changeProfile}
                />
              </View>
            </Box>

            {changeProfile ? (
              <Button
                style={[profileStyle.button, profileStyle.buttonEdit]}
                my={2}
                w="100%"
                onPress={() => handleChangeProfile("edit")}
              >
                <Text style={{ color: "#fff" }}>
                  <FormattedMessage id="users.profile.change" />
                </Text>
              </Button>
            ) : (
              <Box
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  style={[profileStyle.button, profileStyle.buttonClose]}
                  my={2}
                  w="30%"
                  onPress={() => handleChangeProfile("close")}
                >
                  <Text style={{ color: "#fff" }}>
                    <FormattedMessage id="common.button.close" />
                  </Text>
                </Button>
                <Button
                  style={[profileStyle.button, profileStyle.buttonAdd]}
                  my={2}
                  w="30%"
                  onPress={handleProfile}
                >
                  {request ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff" }}>
                      <FormattedMessage id="common.button.save" />
                    </Text>
                  )}
                </Button>
              </Box>
            )}
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </AppContainerClean>
  );
};
export default Profile;
