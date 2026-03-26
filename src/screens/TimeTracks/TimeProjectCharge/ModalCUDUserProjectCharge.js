/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Input, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";

import http from "../../../services/http";
import {
  createUserProjectCharge,
  updateUserProjectCharge,
} from "../../../redux/actions/TimeTracks/timeProjectCharge.actions";

import CurrencySelect from "../../../components/CurrencySelect";

import { modalStyle } from "../../../asset/style/components/modalStyle";

const ModalCUDUserProjectCharge = ({
  modal,
  setModal,
  userId,
  type,
  id,
  pricePerHourSelect,
  currencyCodeSelect,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const state = useSelector((state) => state);
  const trackingState = state.timeTracks;

  const [pricePerHour, setPricePerHour] = useState(
    pricePerHourSelect?.toString()
  );
  const [currencyCode, setCurrencyCode] = useState(currencyCodeSelect);
  const [dataProject, setDataProject] = useState([]);

  const [projectId, setProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [searchProject, setSearchProject] = useState("");

  useEffect(() => {
    if (id) {
      setPricePerHour(pricePerHourSelect?.toString());
      setCurrencyCode(currencyCodeSelect);
    }
  }, [id]);

  useEffect(() => {
    if (trackingState) {
      handleCloseModal();
    }
  }, [trackingState]);

  const handlePost = () => {
    if (type === 1) {
      handleCreateUserProjectCharge();
    } else if (type === 2) {
      handleUpdateUserProjectCharge();
    }
  };

  const handleCreateUserProjectCharge = () => {
    if (userId && projectId && projectTitle && pricePerHour && currencyCode) {
      const payload = {
        userId,
        projectId,
        projectTitle,
        pricePerHour: parseInt(pricePerHour),
        currencyCode,
      };
      dispatch(createUserProjectCharge(payload));
    }
  };
  const handleUpdateUserProjectCharge = () => {
    if (id && pricePerHour && currencyCode) {
      const payload = {
        id,
        pricePerHour: parseInt(pricePerHour),
        currencyCode,
      };
      dispatch(updateUserProjectCharge(payload));
    }
  };
  const getSuggestionsSearch = async (value) => {
    setSearchProject(value);
    if (value.length >= 3 ) {
      http
        .get(
          `/projects/globalsearch/?searchType=0${
            value ? `&search=${value}` : ""
          }`
        )
        .then((data) => {
          setDataProject(data.list);
        });
    }
  };

  function getSuggestProject(suggestion) {
    if (suggestion.id) {
      setProjectId(suggestion.id);
      setProjectTitle(suggestion.content);
      setDataProject([]);
    }
  }
  const clearSearch = () => {
    setDataProject([]);
    searchProject("");
    setProjectTitle("");
    setProjectId(null);
    Keyboard.dismiss();
  };

  const handleCloseModal = () => {
    setDataProject([]);
    setProjectId(null);
    setModal(false);
    setSearchProject("");
    if (type === 1) {
      setPricePerHour("");
      setCurrencyCode("");
    }
  };
  return (
    <>
      <Modal animationType="slide" transparent={true} visible={modal}>
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
                    {type === 1 ? (
                      <FormattedMessage id="Add.Project.Charget" />
                    ) : (
                      <FormattedMessage id="Edit.Project.Charget" />
                    )}
                  </Text>
                </View>

                <View style={{ width: "100%", padding: 17 }}>
                  {type === 1 ? (
                    <View style={styles.container}>
                      <Text>
                        <FormattedMessage id="Select.Project" />
                      </Text>
                      <FlatList
                        data={dataProject}
                        renderItem={({ item, index }) => {
                          return (
                            <View key={index}>
                              <TouchableOpacity
                                onPress={() => getSuggestProject(item)}
                                style={styles.userContainer}
                              >
                                <View style={{ marginLeft: 20 }}>
                                  <Text
                                    style={{ fontSize: 16, fontWeight: "500" }}
                                  >
                                    {item?.content}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          );
                        }}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.searchContainer}
                      />
                      <Input
                        size={"lg"}
                        InputRightElement={
                          searchProject.length !== 0 ? (
                            <Icon
                              onPress={clearSearch}
                              style={{
                                marginLeft: 10,
                                marginRight: 15,
                                color: "#aeafb0",
                                fontSize: 22,
                              }}
                              as={<Ionicons name="close-sharp" />}
                            />
                          ) : (
                            <></>
                          )
                        }
                        w="100%"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "projects.filter.title",
                        })}
                        value={searchProject}
                        onChangeText={(e) => getSuggestionsSearch(e)}
                        mb={3}
                        style={{ height: 40, backgroundColor: "#fff" }}
                      />
                    </View>
                  ) : null}
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        textAlign: "left",
                        width: "100%",
                        paddingTop: 10,
                      }}
                    >
                      <FormattedMessage id="price.per.hour" />
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <FormattedMessage id="price.per.hour">
                        {(placeholder) => (
                          <Input
                            size={"lg"}
                            _focus
                            w="60%"
                            keyboardType="numeric"
                            placeholder={placeholder.toString()}
                            value={pricePerHour}
                            onChangeText={(e) => setPricePerHour(e)}
                            my={3}
                            style={{ height: 40, backgroundColor: "#fff" }}
                          />
                        )}
                      </FormattedMessage>

                      <CurrencySelect
                        modal={modal}
                        currencyCode={currencyCode}
                        setCurrencyCode={setCurrencyCode}
                        selectet={currencyCode}
                      />
                    </View>
                  </>
                </View>

                <View style={modalStyle.ModalBottom}>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonClose]}
                    onPress={() => handleCloseModal()}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="common.button.close" />
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonAdd]}
                    onPress={() => handlePost()}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="common.button.confirm" />
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingHorizontal: 4,
  },
  searchContainer: {
    borderWidth: 0.5,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
});
export default ModalCUDUserProjectCharge;
