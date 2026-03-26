/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import { Entypo } from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
// Redux
import Pagination from "../../components/Pagination";
import ModalCUDTask from "./components/ModalCUDTask";
import ItemTask from "./components/ItemTask";

import { modalStyle } from "../../asset/style/components/modalStyle";
const windowWidth = Dimensions.get("window").width;

const TaskList = ({ projectId, projectViewMode, dataNavigate }) => {
  const state = useSelector((state) => state);
  const shotgunIsSupervisor = state.userDataModule?.shotgunIsSupervisor;
  const taskRequest = state.tasks.taskRequest;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [modalCreate, setModalCreate] = useState(false);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    if (!taskRequest) {
      setRequestApi(true);
      http
        .get(
          `${
            shotgunIsSupervisor ? `/shotgun/tasks` : "/shotgun/tasks/mine"
          }?pageSize=10${projectId ? `&projectId=${projectId}` : ""}${
            currentPage ? `&page=${currentPage}` : ""
          }`
        )
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);

          setDataLength(data.list.length === 0);
        });
    }
  }, [taskRequest]);

  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        padding: 15,
        borderRadius: 5,
        height: "auto",
      }}
    >
      <ModalCUDTask
        modal={modalCreate}
        setModal={setModalCreate}
        type={0}
        projectId={projectId}
      />
      <View
        style={{
          flexDirection: windowWidth > 420 ? "row" : "column",
          justifyContent: "space-between",
          alignItems: windowWidth > 420 ? "center" : "flex-start",
          paddingBottom: 15,
        }}
      >
        <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="shotgun.task.title" />
        </Text>
        {shotgunIsSupervisor ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text>
              <FormattedMessage id="Shotgun.Task.Create" />{" "}
            </Text>
            <TouchableOpacity
              onPress={() => setModalCreate(true)}
              style={modalStyle.btnCircle}
            >
              <Entypo name="plus" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}
      </View>

      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
      <FlatList
        data={dataResponse}
        renderItem={({ item, index }) => {
          return (
            <View key={item.id}>
              <ItemTask
                data={item}
                projectViewMode={projectViewMode}
                dataNavigate={dataNavigate}
              />
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      {dataLength ? (
        <Text style={{ paddingTop: 10 }}>
          <FormattedMessage id="shotgun.task..noItems" />{" "}
        </Text>
      ) : (
        <></>
      )}
      {!dataLength ? (
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

export default TaskList;
