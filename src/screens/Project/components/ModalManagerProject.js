import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FormattedMessage } from "react-intl";
import { Feather, Ionicons, AntDesign, EvilIcons } from "@expo/vector-icons";
import { Input, TextArea } from "native-base";
import { useSelector, useDispatch } from "react-redux";

import http from "../../../services/http";
import { updateProject } from "../../../redux/actions/Project/project.actions";
import SelectStatusProject from "./ItemProject/SelectStatusProject";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import MuteUnMuteNotifications from "./ItemProject/MuteUnMuteNotifications";
import ModalDeleteProject from "./ModalDeleteProject";
import ModalDueDate from "../../../components/Modal/ModalDueDate";
import FormatDateTime from "../../../components/FormatDateTime";
import { dateFormat } from "../../../utils/dateFormat";
import ModalReport from "../../../components/Modal/ModalReport";
import ModalDeleteMyPermission from "./ModalDeleteMyPermission";
import ModalMoveProject from "../../../components/ModalMove";

const ModalManagerProject = ({ projectdata }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const projectState = state.project;
  const reportsState = state.reports.data;
  const projectRequest = state.project.projectRequest;
  const [modalEdit, setModalEdit] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [dataCapacity, setDataCapacity] = useState(0);
  const [title, setTitle] = useState(projectdata.title);
  const [description, setDescription] = useState(projectdata.description);
  const [statusProject, setStatusProject] = useState(projectdata.status);
  const [address, setAddress] = useState(projectdata.address);
  const [dueDate, setDueDate] = useState(projectdata.dueDate);
  const [modalMoveProject, setModalMoveproject] = useState(false);
  const [blockReason, setBlockReason] = useState(projectdata.blockReason);

  useEffect(() => {
    if (projectState.success || reportsState?.date) {
      setModalEdit(false);
      setModalEditVisible(false);
    }
  }, [projectState.success, reportsState]);

  const handleUpdateProject = () => {
    setSubmitted(true);
    if (submitted && !title && !statusProject) {
    } else if (!title && !statusProject) {
    } else {
      const payload = {
        id: projectdata.id,
        title,
        description,
        status: statusProject,
        capacity: dataCapacity,
        address,
        dueDate: dateFormat(dueDate),
        blockReason,
      };
      dispatch(updateProject(payload));
    }
  };

  const handleCalculate = () => {
    http.get(`/projects/${projectdata.id}/size`).then((data) => {
      setDataCapacity(data);
    });
  };

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  const handleModalVisible = () => {
    setModalEditVisible(!modalEditVisible);

  };
  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalEditVisible}
        style={{ height: 500 }}
      >
        <Modal animationType="slide" transparent={true} visible={modalEdit}>
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
                      <FormattedMessage id="projects.form.edit.title" />
                    </Text>
                  </View>
                  <View
                    style={[
                      modalStyle.modalInput,
                      modalStyle.paddingBottom60,
                      { paddingHorizontal: 17 },
                    ]}
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
                    {/* <FormattedMessage id="projects.form.address.placeholder">
                                            {placeholder =>
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
                                            }
                                        </FormattedMessage> */}
                    <SelectStatusProject
                      onSelect={(value) => {
                        setStatusProject(value);
                      }}
                      select={projectdata.status}
                    />
                    {statusProject === 3 ? (
                      <FormattedMessage id="projects.form.address.placeholder">
                        {(placeholder) => (
                          <Input
                            size={"lg"}
                            _focus
                            w="100%"
                            type="text"
                            placeholder={placeholder.toString()}
                            value={blockReason}
                            onChangeText={(e) => setBlockReason(e)}
                            my={3}
                            style={{ height: 40, backgroundColor: "#fff" }}
                          />
                        )}
                      </FormattedMessage>
                    ) : (
                      <></>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 10,
                      }}
                    >
                      <Input
                        size={"lg"}
                        _focus
                        w="50%"
                        isDisabled
                        value={formatBytes(dataCapacity).toString()}
                        onChangeText={(e) => setDataCapacity(e)}
                        style={{ height: 40, backgroundColor: "#fff" }}
                        my={3}
                      />
                      <Text
                        style={[modalStyle.button, modalStyle.buttonCalculate]}
                        onPress={handleCalculate}
                      >
                        <FormattedMessage id="Calculate" />
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {dueDate ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingTop: 10,
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>
                            <FormatDateTime datevalue={dueDate} type={1} />{" "}
                          </Text>
                          {projectdata.parentId ? (
                            <>
                              <TouchableOpacity
                                onPress={() => setDueDate(projectdata.dueDate)}
                              >
                                <AntDesign
                                  name="back"
                                  size={24}
                                  color="#6c757d"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => setDueDate(null)}
                              >
                                <EvilIcons
                                  name="close"
                                  size={24}
                                  color="#6c757d"
                                />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <></>
                          )}
                        </View>
                      ) : (
                        <></>
                      )}
                      {projectdata.parentId ? (
                        <ModalDueDate
                          projectdata={projectdata}
                          onDeadlineChange={(value) => {
                            setDueDate(value);
                          }}
                          date={true}
                        />
                      ) : (
                        <></>
                      )}
                    </View>
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
                      onPress={() => setModalEdit(false)}
                    >
                      <Text style={modalStyle.textStyle}>
                        <FormattedMessage id="common.button.close" />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modalStyle.button, modalStyle.buttonAdd]}
                      onPress={() => handleUpdateProject()}
                      disabled={projectRequest}
                    >
                      <Text style={modalStyle.textStyle}>
                        {projectRequest ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <FormattedMessage id="common.button.confirm" />
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
        <ModalMoveProject
          modal={modalMoveProject}
          setModal={setModalMoveproject}
          idProps={projectdata.id}
          type={1}
        />
        <View style={modalStyle.centeredViewSmall}>
          <View style={modalStyle.modalViewEdit}>
            <View style={modalStyle.modalEditClose}>
              <TouchableWithoutFeedback
                onPress={() => setModalEditVisible(!modalEditVisible)}
              >
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableWithoutFeedback>
            </View>
            <MuteUnMuteNotifications
              projectId={projectdata.id}
              isMutedForNotifications={projectdata.isMutedForNotifications}
            />
            {projectdata.loggedUserPermissionCode >= 2 ? (
              <>
                <TouchableOpacity
                  style={modalStyle.modalTitleEditView}
                  onPress={() => setModalEdit(true)}
                >
                  <Text style={modalStyle.modalTitleEdit}>
                    <FormattedMessage id="common.button.edit" />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={modalStyle.modalTitleEditView}
                  onPress={() => setModalMoveproject(true)}
                >
                  <Text style={modalStyle.modalTitleEdit}>
                    <FormattedMessage id="document.task.move" />
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <></>
            )}

            {projectdata.loggedUserPermissionCode === 3 ? (
              <>
                <ModalReport projectId={projectdata.id} reportFor={0} />
                <ModalDeleteProject
                  projectId={projectdata.id}
                  projectName={projectdata.title}
                />
              </>
            ) : (
              <></>
            )}
            {projectdata.loggedUserPermissionCode < 3 ? (
              <ModalDeleteMyPermission
                projectId={projectdata.id}
                projectTitle={projectdata.title}
              />
            ) : (
              <></>
            )}
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={handleModalVisible}>
        <Text>
          <Feather name="more-vertical" size={24} color="#6c757d" />
        </Text>
      </TouchableOpacity>
    </>
  );
};
export default ModalManagerProject;
