import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ActivityIndicator, View } from "react-native";
import { FormattedMessage } from "react-intl";
import { Text, Icon, Input, Box, Button } from "native-base";
import { Feather } from "@expo/vector-icons";
import HeaderProfile from "./components/HeaderProfile";
import { updatePassword } from "../../redux/actions/UsersTeams/user.actions";
import { profileStyle } from "../../asset/style/Profile/profileStyle";
import AppContainerClean from "../../components/AppContainerClean";

const Password = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const userId = state.userDataRole.userId;
  const request = state.user.userRequest;
  const user = state.user;
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [matchPassword, steMatchPassword] = useState(false);

  useEffect(() => {
    setPassword("");
    setNewPassword("");
  }, [user]);

  const [errorPassword, setErrorPassword] = useState("");
  const [errorPas, setErrorPas] = useState(false);
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

  function handlePassword() {
    if (password === newPassword) {
      if (validatePassword(password)) {
        dispatch(updatePassword(userId, newPassword, true));
        setErrorPas(false);
      } else {
        setErrorPas(true);
      }
      steMatchPassword(false);
    } else {
      steMatchPassword(true);
    }
  }
  return (
    <>
      <AppContainerClean location={"Password"}>
        <HeaderProfile location={"Password"} />
        <View
          style={{
            backgroundColor: "#ebf0f3",
            padding: 15,
            borderRadius: 5,
          }}
        >
          <Box>
            <Text style={{ color: "#6c757d", fontSize: 17 }}>
              <FormattedMessage id="users.profile.newPassword" />
            </Text>
            <FormattedMessage id="login.form.password.placeholder">
              {(placeholder) => (
                <Input
                  size={"lg"}
                  _focus
                  w="100%"
                  my={3}
                  placeholder={placeholder.toString()}
                  _light={{ placeholderTextColor: "blueGray.400" }}
                  _dark={{ placeholderTextColor: "blueGray.50" }}
                  type={show ? "text" : "password"}
                  onChangeText={(e) => setPassword(e)}
                  InputRightElement={
                    <>
                      {show ? (
                        <Icon
                          as={<Feather name="eye" size={16} color="black" />}
                          size="sm"
                          m={2}
                          onPress={() => setShow(!show)}
                        />
                      ) : (
                        <Icon
                          as={
                            <Feather name="eye-off" size={16} color="black" />
                          }
                          size="sm"
                          m={2}
                          onPress={() => setShow(!show)}
                        />
                      )}
                    </>
                  }
                  style={{ height: 40, backgroundColor: "#fff" }}
                />
              )}
            </FormattedMessage>
          </Box>

          <Box>
            <Text style={{ color: "#6c757d", fontSize: 17 }}>
              <FormattedMessage id="users.profile.confirmPassword" />
            </Text>
            <FormattedMessage id="login.form.password.placeholder">
              {(placeholder) => (
                <Input
                  size={"lg"}
                  _focus
                  w="100%"
                  my={3}
                  placeholder={placeholder.toString()}
                  _light={{ placeholderTextColor: "blueGray.400" }}
                  _dark={{ placeholderTextColor: "blueGray.50" }}
                  type={show2 ? "text" : "password"}
                  onChangeText={(e) => setNewPassword(e)}
                  InputRightElement={
                    <>
                      {show2 ? (
                        <Icon
                          as={<Feather name="eye" size={16} color="black" />}
                          size="sm"
                          m={2}
                          onPress={() => setShow2(!show2)}
                        />
                      ) : (
                        <Icon
                          as={
                            <Feather name="eye-off" size={16} color="black" />
                          }
                          size="sm"
                          m={2}
                          onPress={() => setShow2(!show2)}
                        />
                      )}
                    </>
                  }
                  style={{ height: 40, backgroundColor: "#fff" }}
                />
              )}
            </FormattedMessage>
          </Box>
          {matchPassword ? (
            <Text style={{ fontSize: 14, color: "#dc3545" }}>
              <FormattedMessage id="login.form.password.dontmatch" />
            </Text>
          ) : (
            <></>
          )}
          {errorPas ? (
            <Text style={{ fontSize: 14, color: "#dc3545" }}>
              <FormattedMessage id={errorPassword} />
            </Text>
          ) : (
            <></>
          )}
          {password && password === newPassword ? (
            <Button
              style={[profileStyle.button, profileStyle.buttonAdd]}
              my={2}
              w="100%"
              onPress={handlePassword}
            >
              {request ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: "#fff" }}>
                  <FormattedMessage id="common.button.save" />
                </Text>
              )}
            </Button>
          ) : null}
        </View>
      </AppContainerClean>
    </>
  );
};
export default Password;
