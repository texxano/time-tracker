/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";

import { NavigationService } from "../../navigator";

// Redux
import { useSelector } from "react-redux";
import http from "../../services/http";
// Redux

// Components
import ItemStepTask from "./components/ItemStepTask";
import ModalEditStepTask from "./components/ModalEditStepTask";
import ModalStepTask from "./components/ModalStepTask";
import { modalStyle } from "../../asset/style/components/modalStyle";

// // Components

const TaskView = ({ id, projectViewMode, dataNavigate }) => {
  const state = useSelector((state) => state);
  const taskRequest = state.tasks.taskRequest;
  const [dataResponse, setDataResponse] = useState({});
  const [modal, setModal] = useState(false);
  const [modalComplete, setModalComplete] = useState(false);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    const getData = async () => {
      if (!taskRequest) {
        setRequestApi(true);
        const response = await http.get(`/shotgun/tasks/${id}`);
        setRequestApi(false);
        setDataResponse(response);
      }
    };

    getData();
  }, [taskRequest, id ]);

  const handleNavigateBack = () => {
    if (projectViewMode) {
      NavigationService.navigate("TaskProject", {
        projectId: dataNavigate.projectId,
        parentId: dataNavigate.parentId,
        permissionCode: dataNavigate.permissionCode,
        taskId: null,
      });
    } else {
      NavigationService.navigate("Task", { locationActive: "", id: "" });
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => handleNavigateBack()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 10,
        }}
      >
        <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
        <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: "#ebf0f3",
          padding: 15,
          borderRadius: 5,
          height: "auto",
        }}
      >
        {requestApi ? (
          <ActivityIndicator size="large" color="#6c757d" />
        ) : (
          <></>
        )}

        {dataResponse.name ? (
          <View style={{ marginVertical: 5 }}>
            <View
              style={{
                marginVertical: 5,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                backgroundColor: "#fff",
                padding: 10,
              }}
            >
              <View>
                <Text style={{ fontSize: 20, paddingBottom: 10 }}>
                  {dataResponse.name}
                </Text>
                {dataResponse.description && (
                  <Text style={{ fontSize: 16 }}>
                    {dataResponse.description}
                  </Text>
                )}
              </View>
            </View>
            {!dataResponse.isCompleted ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginVertical: 5,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  backgroundColor: "#fff",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 17 }}>
                    <FormattedMessage id="New.Step.In.Task" />{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModal(true)}
                    style={[modalStyle.buttonGreeanOutline, { padding: 5 }]}
                  >
                    <AntDesign name="plussquareo" size={18} color="#28a745" />
                  </TouchableOpacity>
                </View>
                {dataResponse.steps?.length !== 0 ? (
                  <TouchableOpacity
                    onPress={() => setModalComplete(true)}
                    style={[
                      modalStyle.button,
                      modalStyle.buttonGreeanOutline,
                      { flexDirection: "row", alignItems: "center" },
                    ]}
                  >
                    <Text style={modalStyle.textGreeanOutline}>
                      <FormattedMessage id="Complete.Step.Task.Button" />{" "}
                    </Text>
                    <AntDesign name="checksquareo" size={18} color="#28a745" />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            <View>
              {dataResponse.steps
                ?.sort((a, b) => a.order - b.order)
                ?.map((data, index) => {
                  const isCompletedBefore = dataResponse.steps?.sort(
                    (a, b) => a.order - b.order
                  )[index - 1]?.isCompleted;
                  return (
                    <View key={index}>
                      <ItemStepTask
                        data={data}
                        isCompletedBefore={isCompletedBefore}
                        index={index - 1}
                      />
                    </View>
                  );
                })}
            </View>
          </View>
        ) : (
          <></>
        )}
      </View>
      <ModalEditStepTask
        id={dataResponse.id}
        type={0}
        modal={modal}
        setModal={setModal}
      />
      <ModalStepTask
        id={dataResponse.id}
        type={2}
        modal={modalComplete}
        setModal={setModalComplete}
      />
    </>
  );
};
const styles = StyleSheet.create({
  statusView: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusProject1: {
    fontSize: 18,
    paddingLeft: 3,
    color: "#ffc107",
  },
  statusProject2: {
    fontSize: 18,
    paddingLeft: 3,
    color: "#28a745",
  },
});
export default TaskView;
