import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Input, TextArea, Checkbox } from "native-base";
import { Entypo, EvilIcons } from "@expo/vector-icons";

import {
  createRootProject,
  createProject,
} from "../../../redux/actions/Project/project.actions";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import { globalStyles } from "../../../asset/style/globalStyles";
import { dateFormat } from "../../../utils/dateFormat";
import ModalDueDate from "../../../components/Modal/ModalDueDate";
import FormatDateTime from "../../../components/FormatDateTime";

const ModalCreateProject = ({ parentId }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const isAdministrator = state.userDataRole?.isAdministrator;
  const projectRequest = state.project.projectRequest;
  const projectState = state.project;
  const [submitted, setSubmitted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [addUsers, setAddUsers] = useState(false);
  const [onlyThesePermissions, setOnlyThesePermissions] = useState(false);

  useEffect(() => {
    if (projectState.success) {
      closeModal();
    }
  }, [projectState.success]);

  const closeModal = () => {
    setModalVisible(false);
    setSubmitted(false);
    setTitle("");
    setDescription("");
    setAddress("");
    setDueDate(null);
    setAddUsers(false);
    setOnlyThesePermissions(false);
  };
  const handleModalVisible = () => {
    setModalVisible(!modalVisible);
  };
  const handleProject = () => {
    setSubmitted(true);
    if (submitted && !title) {
    } else if (!title) {
    } else {
      if (parentId) {
        const payload = {
          title,
          description,
          parentId,
          address,
          dueDate: dateFormat(dueDate),
          onlyThesePermissions,
        };
        dispatch(createProject(payload, addUsers));
      } else {
        const payload = {
          title,
          description,
          address,
          dueDate: dateFormat(dueDate),
        };
        dispatch(createRootProject(payload));
      }
    }
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
                    <FormattedMessage id="projects.form.new.title" />
                  </Text>
                </View>
                <View
                  style={[modalStyle.modalInput, { paddingHorizontal: 17 }]}
                >
                  <FormattedMessage id="projects.form.title.placeholder">
                    {(placeholder) => (
                      <Input
                        size={"lg"}
                        _focus
                        w="100%"
                        type="text"
                        placeholder={placeholder.toString()}
                        value={title}
                        onChangeText={(e) => setTitle(e)}
                        my={3}
                        style={{ height: 40, backgroundColor: "#fff" }}
                      />
                    )}
                  </FormattedMessage>
                  {submitted && !title && (
                    <Text style={{ fontSize: 14, color: "#dc3545" }}>
                      <FormattedMessage id="projects.form.title.error.required" />
                    </Text>
                  )}
                  {isAdministrator ? (
                    <FormattedMessage id="projects.form.address.placeholder">
                      {(placeholder) => (
                        <Input
                          size={"lg"}
                          _focus
                          w="100%"
                          type="text"
                          placeholder={placeholder.toString()}
                          value={address}
                          onChangeText={(e) => setAddress(e)}
                          my={3}
                          style={{ height: 40, backgroundColor: "#fff" }}
                        />
                      )}
                    </FormattedMessage>
                  ) : (
                    <>
                      <FormattedMessage id="projects.form.description.placeholder">
                        {(placeholder) => (
                          <TextArea
                            size={"lg"}
                            _focus
                            w="100%"
                            type="text"
                            placeholder={placeholder.toString()}
                            value={description}
                            onChangeText={(e) => setDescription(e)}
                            my={3}
                            style={{ backgroundColor: "#fff" }}
                          />
                        )}
                      </FormattedMessage>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: 10,
                          minHeight: 50,
                        }}
                      >
                        <ModalDueDate
                          onDeadlineChange={(value) => {
                            setDueDate(value);
                          }}
                          date={true}
                        />
                        {dueDate ? (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: "#e5e5e5",
                              borderRadius: 5,
                            }}
                          >
                            <Text style={{ fontSize: 16, padding: 5 }}>
                              <FormatDateTime datevalue={dueDate} type={1} />
                            </Text>
                            <TouchableOpacity
                              onPress={() => setDueDate(null)}
                              style={{
                                borderLeftWidth: 1,
                                borderColor: "#e5e5e5",
                                padding: 5,
                              }}
                            >
                              <EvilIcons
                                name="close"
                                size={23}
                                color="#6c757d"
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <Text> </Text>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          paddingTop: 10,
                          paddingBottom: 20,
                        }}
                      >
                        <Text style={{ fontSize: 16, paddingRight: 5 }}>
                          <FormattedMessage id="add.users.youd.like.share.project" />
                        </Text>
                        <Checkbox
                          isChecked={addUsers}
                          onChange={() => setAddUsers(!addUsers)}
                          value={addUsers}
                          colorScheme="green"
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          paddingTop: 10,
                          paddingBottom: 20,
                        }}
                      >
                        <Text style={{ fontSize: 16, paddingRight: 5 }}>
                          <FormattedMessage id="create.project.with.this.users" />
                        </Text>
                        <Checkbox
                          isChecked={onlyThesePermissions}
                          onChange={() =>
                            setOnlyThesePermissions(!onlyThesePermissions)
                          }
                          value={onlyThesePermissions}
                          colorScheme="green"
                        />
                      </View>
                    </>
                  )}
                  {submitted && projectState.failure ? (
                    <Text style={{ fontSize: 14, color: "#dc3545" }}>
                      {projectState.failure}
                    </Text>
                  ) : (
                    <></>
                  )}
                </View>
                <View style={modalStyle.ModalBottom}>
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
                    onPress={handleProject}
                    disabled={projectRequest}
                  >
                    <Text style={modalStyle.textStyle}>
                      {projectRequest ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <FormattedMessage id="projects.form.users.delete.modal.title" />
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {isAdministrator || parentId ? (
        <TouchableOpacity
          onPress={handleModalVisible}
          style={globalStyles.btnCircle}
        >
          <Entypo name="plus" size={16} color="#2196F3" />
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </>
  );
};

export default ModalCreateProject;
