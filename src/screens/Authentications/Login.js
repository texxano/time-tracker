import React, { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import {
  Image,
  ActivityIndicator,
  TouchableNativeFeedback,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  Keyboard,
  Linking,
  Modal,
  View,
  FlatList,
  Switch,
} from "react-native";
import { Text, Input, Icon, Box, Button, Checkbox } from "native-base";
import { Feather, Entypo } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";

import { NavigationService } from "../../navigator";
import { login } from "../../redux/actions/Authentication/userAuth.actions";
import { validatePassword, validateEmail } from "../../utils/validate";
import { styles } from "../../asset/style/Authentications.styles";
import LoginGoogle from "./LoginGoogle";
import Constants from "expo-constants";
import AppContainerClean from "../../components/AppContainerClean";

const Login = () => {
  const state = useSelector((state) => state);
  const titleFailure = state.auth.title;
  const request = state.auth.request;
  const rememberLogin = state.rememberLogin;
  const dispatch = useDispatch();
  const [username, setUsername] = useState(rememberLogin.username || "");
  const [password, setPassword] = useState(rememberLogin.password || "");
  const [validateEmailStaus, setvalidateEmailStaus] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const [errorPas, setErrorPas] = useState(false);
  const [show, setShow] = React.useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [remember, setRemember] = useState(rememberLogin.remember);
  let modelName = Device.modelName;
  let deviceName = Device.deviceName;
  const payloadMobile = {
    expoPushToken: expoPushToken,
    name: deviceName,
    serialNumber: modelName,
    platform: Platform.OS === "android" ? 0 : 1,
  };
  console.log(expoPushToken, "expoPushToken");

  const passwordStatus = validatePassword(password);
  useEffect(() => {
    if (!validateEmail(username.trim()) && username) {
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
  }, [username, password]);

  const handleLogIn = () => {
    setSubmitted(true);
    if (submitted && !username && !password) {
    } else if (!username || !password) {
    } else if (!validateEmail(username.trim()) || passwordStatus.error) {
    } else {
      const payload = {
        username: username.trim(),
        password: password,
      };
      // Debug: Log token status at login time
      console.log('🔑 Login clicked - Push token status:', expoPushToken ? '✅ Ready' : '❌ Not ready');
      console.log('📦 payloadMobile.expoPushToken:', payloadMobile.expoPushToken);
      
      dispatch(login(payload, payloadMobile, remember));
      Keyboard.dismiss();
    }
  };
  useEffect(() => {
    registerForPushNotificationsAsync().then((tokenExpo) =>
      setExpoPushToken(tokenExpo)
    );
  }, []);

  const navigateForgotPassword = () => {
    setSubmitted(false);
    setUsername("");
    setPassword("");
    NavigationService.navigate("ForgotPassword", {});
  };

  return (
    <>
      <AppContainerClean location={"Login"}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <Box style={styles.box}>
              <View style={styles.box2}>
                <TouchableNativeFeedback
                  onPress={() => {
                    NavigationService.navigate("Login");
                  }}
                >
                  <Image
                    style={styles.logo}
                    source={require("../../asset/image/logo.png")}
                  />
                </TouchableNativeFeedback>
                <Text mb={3} fontSize="xl" fontWeight={600}>
                  {" "}
                  <FormattedMessage id="login.form.title" />
                </Text>
                <Text fontSize="md">
                  <FormattedMessage id="login.form.subtitle" />
                </Text>
                <FormattedMessage id="login.form.username.placeholder">
                  {(placeholder) => (
                    <Input
                      size={"lg"}
                      w="80%"
                      type="text"
                      placeholder={placeholder.toString()}
                      value={username}
                      onChangeText={(e) => setUsername(e)}
                      my={3}
                      keyboardType="email-address"
                      style={{ height: 40, backgroundColor: "#fff" }}
                    />
                  )}
                </FormattedMessage>
                {submitted && !username && (
                  <Text style={styles.textError}>
                    <FormattedMessage id="login.form.username.error.required" />
                  </Text>
                )}
                {submitted && validateEmailStaus && (
                  <Text style={styles.textError}>
                    <FormattedMessage id="projects.form.users.email.error.format" />
                  </Text>
                )}
                <FormattedMessage id="login.form.password.placeholder">
                  {(placeholder) => (
                    <Input
                      size={"lg"}
                      w="80%"
                      placeholder={placeholder.toString()}
                      type={show ? "text" : "password"}
                      value={password}
                      onChangeText={(e) => setPassword(e)}
                      InputRightElement={
                        <>
                          {show ? (
                            <Icon
                              as={<Feather name="eye" />}
                              size="sm"
                              m={2}
                              style={{ color: "#aeafb0" }}
                              onPress={() => setShow(!show)}
                            />
                          ) : (
                            <Icon
                              as={<Feather name="eye-off" />}
                              size="sm"
                              m={2}
                              style={{ color: "#aeafb0" }}
                              onPress={() => setShow(!show)}
                            />
                          )}
                        </>
                      }
                      style={{ height: 40, backgroundColor: "#fff" }}
                    />
                  )}
                </FormattedMessage>
                <Box style={styles.boxChecbox}>
                  <Checkbox
                    isChecked={remember}
                    onChange={() => setRemember(!remember)}
                    value={remember}
                    colorScheme="red"
                  />
                  <Text style={{ paddingLeft: 18 }}>
                    <FormattedMessage id="Remember.Me" />
                  </Text>
                </Box>
                {submitted && !password && (
                  <Text style={styles.textError}>
                    <FormattedMessage id="login.form.password.error.required" />
                  </Text>
                )}
                {submitted && errorPas ? (
                  <Text style={styles.textError}>
                    <FormattedMessage id={errorPassword} />
                  </Text>
                ) : (
                  <></>
                )}
                {submitted && titleFailure ? (
                  <Text style={styles.textError}>
                    <FormattedMessage id={titleFailure} />
                  </Text>
                ) : (
                  <Text></Text>
                )}
                <TouchableOpacity
                  style={[styles.button, styles.buttonAdd]}
                  onPress={handleLogIn}
                  disabled={request === true}
                >
                  {request === true ? (
                    <ActivityIndicator size="small" color="#6c757d" />
                  ) : (
                    <>
                      <Text style={styles.textSend}>
                        <FormattedMessage id="common.button.login" />
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {/* <LoginGoogle payloadMobile={payloadMobile} /> */}
                <View style={styles.viewSingUp}>
                  <TouchableOpacity
                    onPress={() => navigateForgotPassword()}
                    style={{ alignSelf:"center"}}
                  >
                    <Text style={[styles.textSingUp,]}>
                      <FormattedMessage id="forgot.password" />
                    </Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    onPress={() =>
                      Linking.openURL("https://texxano.com/signUp")
                    }
                  >
                    <Text style={styles.textSingUp}>Sign Up</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
              <Box style={styles.bottomElemet}>
                <TouchableNativeFeedback
                  onPress={() => {
                    NavigationService.navigate("Overview", {
                      location: "Login",
                    });
                  }}
                  style={styles.quickstartBox1}
                >
                  <Box style={styles.quickstartBox}>
                    <Entypo name="info" size={18} color="#fff" />
                    <Text style={{ color: "#fff" }}>
                      <FormattedMessage id="more.info" />
                    </Text>
                  </Box>
                </TouchableNativeFeedback>
              </Box>
            </Box>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </AppContainerClean>
    </>
  );
};

export default Login;

async function registerForPushNotificationsAsync() {
  let tokenExpo;
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      tokenExpo = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;
      console.log("📱 Expo Push Token:", tokenExpo);
      
      // Also get the native FCM token for Firebase Console testing
      try {
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        console.log("🔥 Native FCM Token:", deviceToken.data);
        console.log("📋 Copy this FCM token for Firebase Console:", deviceToken.data);
      } catch (fcmError) {
        console.log("⚠️ Could not get native FCM token:", fcmError.message);
      }
    } catch (error) {
      console.log(error, "error");
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return tokenExpo;
}
