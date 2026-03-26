/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { Input, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";

import { documentTaskSectorsServices } from "../../../services/DocumentTask/documentTaskSectors.Services";
import { documentTasksTypes } from "../../../redux/type/DocumentTask/documentTasks.types";
// Redux
import { useSelector, useDispatch } from "react-redux";
// Redux
import http from "../../../services/http";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import SelectUser from "../../../components/SelectUser";

const ModalSector = ({ modal, setModal, type, sector }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState(null);
  const [sectorSupervisorId, setSectorSupervisorId] = useState(null);
  const [projectId, setProjectId] = useState(sector?.projectId ?? "");
  const [dataProject, setDataProject] = useState([]);
  const [searchProject, setSearchProject] = useState("");

  useEffect(() => {
    if (sector?.name && type) {
      setName(sector?.name);
      setNumber(sector?.number?.toString());
      setSearchProject(sector?.projectTitle);
    }
  }, [sector]);

  const success = (data) => ({
    type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS,
    data: data,
  });

  const handleConfirm = async () => {
    setSubmitted(true);
    if (type === 0 && name) {
      const payload = {
        name,
        number,
        sectorSupervisorId,
        projectId,
      };
      let request =
        await documentTaskSectorsServices.createDocumentTasksSectors(payload);
      if (request.createdBy) {
        handleCloseModal();
        dispatch(success(request));
      }
    } else if (type === 1 && name) {
      const payload = {
        id: sector?.id,
        newSectorSupervisorId: sectorSupervisorId,
      };
      let request =
        await documentTaskSectorsServices.updateDocumentTasksSupervizor(
          payload
        );
      if (request.status === 200) {
        handleCloseModal();
        dispatch(success(request.url));
      }
    }
  };

  const getSuggestionsSearch = async (value) => {
    setSearchProject(value);
    if (value.length >= 3) {
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
      setSearchProject(suggestion.content);
      setDataProject([]);
    }
  }
  const clearSearch = () => {
    setDataProject([]);
    setSearchProject("");
    setProjectId(null);
    Keyboard.dismiss();
  };

  const handleCloseModal = () => {
    clearSearch();
    setName("");
    setNumber("");
    setSubmitted(false);
    setModal(false);
  };
  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        style={{ height: 500 }}
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
                    {(() => {
                      if (type === 0) {
                        return (
                          <FormattedMessage id="document.task.sector.create" />
                        );
                      } else if (type === 1) {
                        return (
                          <FormattedMessage id="document.task.sector.edit" />
                        );
                      }
                    })()}
                  </Text>
                </View>
                <View
                  style={[
                    modalStyle.modalInput,
                    modalStyle.paddingBottom60,
                    { paddingHorizontal: 17 },
                  ]}
                >
                  <FormattedMessage id="sector.name">
                    {(placeholder) => (
                      <Input
                        size={"lg"}
                        _focus
                        w="100%"
                        type="text"
                        placeholder={placeholder.toString()}
                        value={name}
                        onChangeText={(e) => setName(e)}
                        my={3}
                        style={{ height: 40, backgroundColor: "#fff" }}
                        isDisabled={type}
                      />
                    )}
                  </FormattedMessage>
                  <FormattedMessage id="sector.number">
                    {(placeholder) => (
                      <Input
                        size={"lg"}
                        _focus
                        w="100%"
                        type="text"
                        placeholder={placeholder.toString()}
                        value={number}
                        onChangeText={(e) => setNumber(e)}
                        my={3}
                        keyboardType="numeric"
                        style={{ height: 40, backgroundColor: "#fff" }}
                        isDisabled={type}
                      />
                    )}
                  </FormattedMessage>
                  <View style={styles.container}>
                    {!type && (
                      <Text>
                        <FormattedMessage id="link.sector.with.project" />
                      </Text>
                    )}
                    <FlatList
                      data={dataProject}
                      renderItem={({ item, index }) => {
                        return (
                          <View key={index}>
                            <TouchableOpacity
                              onPress={() => getSuggestProject(item)}
                              style={styles.userContainer}
                            >
                              <View style={{ margin: 10 }}>
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
                    <FormattedMessage id="search">
                      {(placeholder) => (
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
                          placeholder={placeholder.toString()}
                          value={searchProject}
                          onChangeText={(e) => getSuggestionsSearch(e)}
                          mb={3}
                          style={{ height: 40, backgroundColor: "#fff" }}
                          isDisabled={type}
                        />
                      )}
                    </FormattedMessage>
                  </View>
                  <Text>
                    <FormattedMessage id="choose.sector.supervisor" />
                  </Text>

                  <SelectUser setUserId={setSectorSupervisorId} />
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
                    onPress={handleConfirm}
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
  title: {
    fontSize: 18,
    marginBottom: 10,
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
export default ModalSector;
