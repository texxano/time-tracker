import React, { useState, useEffect } from "react";
import {
  Text,
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  Ionicons,
  AntDesign,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";
import { Input } from "native-base";

import { updateProject } from "../../../../redux/actions/Project/project.actions";
import { modalStyle } from "../../../../asset/style/components/modalStyle";
import { check } from "../../../../utils/statusUser";
import SelectStatusProject from "./SelectStatusProject";
import { dateFormat } from "../../../../utils/dateFormat";

const StatusProjectChange = ({ projectdata }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const projectRequest = state.project.projectRequest;

  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [statusProject, setStatusProject] = useState(projectdata.status);
  const [blockReason, setBlockReason] = useState(projectdata.blockReason);

  useEffect(() => {
    if (state.project) {
      setModalEditVisible(false);
    }
  }, [state.project]);

  const handleUpdateProject = () => {
    const payload = {
      id: projectdata.id,
      title: projectdata.title,
      description: projectdata.description,
      status: statusProject,
      capacity: projectdata.dataCapacity,
      address: projectdata.address,
      dueDate: dateFormat(projectdata.dueDate),
      blockReason,
    };
    dispatch(updateProject(payload));
  };

  useEffect(() => {
    if (statusProject !== projectdata.status && statusProject < 3) {
      handleUpdateProject();
    }
  }, [statusProject]);

  const handleModalVisible = () => {
    setModalEditVisible(!modalEditVisible);
  };

  const getStatusTextAndIcon = (status) => {
    switch (status) {
      case 0:
        return { color: "#17a2b8", textId: "projects.form.status.new" };
      case 1:
        return { color: "#ffc107", textId: "projects.form.status.progress" };
      case 2:
        return { color: "#28a745", textId: "projects.form.status.completed" };
      case 3:
        return { color: "#dc3545", textId: "projects.form.status.block" };
      default:
        return null;
    }
  };

  const { color, textId } = getStatusTextAndIcon(projectdata.status);

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditVisible}
      >
        <View style={modalStyle.centeredViewSmall}>
          <View style={modalStyle.modalViewEditStatus}>
            <View style={modalStyle.modalEditClose}>
              <TouchableWithoutFeedback
                onPress={() => setModalEditVisible(!modalEditVisible)}
              >
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableWithoutFeedback>
            </View>
            <Text style={modalStyle.modalTitleEdit}>
              <FormattedMessage id="projects.form.status.placeholder" />
            </Text>
            <View style={{ width: "70%", height: 200 }}>
              <SelectStatusProject
                onSelect={(value) => setStatusProject(value)}
                select={projectdata.status}
                openDropDown={statusProject === 3 ? false : true}
              />
              {statusProject === 3 ? (
                <View>
                  <FormattedMessage id="projects.form.status.placeholder">
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
                  <TouchableOpacity
                    style={[modalStyle.button, modalStyle.buttonAdd]}
                    onPress={() => handleUpdateProject()}
                    disabled={projectRequest}
                  >
                    <Text style={modalStyle.textStyle}>
                      <FormattedMessage id="common.button.confirm" />
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <></>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={handleModalVisible}
        disabled={
          projectdata.parentId ? projectdata.loggedUserPermissionCode < 2 : true
        }
      >
        <View style={styles.statusView}>
          <Text style={[styles.statusProject, { color }]}>
            {(() => {
              if (projectdata.status === 0) {
                return <AntDesign name="star" size={18} color={color} />;
              } else if (projectdata.status === 1) {
                return (
                  <MaterialIcons name="watch-later" size={18} color={color} />
                );
              } else if (projectdata.status === 2) {
                return <AntDesign name="checkcircle" size={18} color={color} />;
              } else if (projectdata.status === 3) {
                return (
                  <FontAwesome
                    name="exclamation-triangle"
                    size={18}
                    color={color}
                  />
                );
              }
            })()}
          </Text>
          <Text style={[styles.statusProject, { color }]}>
            <FormattedMessage id={textId} />
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  statusView: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusProject: {
    fontSize: 18,
    paddingLeft: 3,
  },
});

export default StatusProjectChange;
