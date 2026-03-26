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
import { useSelector } from "react-redux";
import http from "../../../services/http";
// Redux
import Pagination from "../../../components/Pagination";
import ModalSector from "./ModalSector";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import Search from "../../../components/Search";
import ItemSektor from "./ItemSektor";
const windowWidth = Dimensions.get("window").width;

const DocumentTaskSektorList = ({}) => {
  const state = useSelector((state) => state);
  const documentTaskIsSupervisor =
    state.userDataModule?.documentTaskIsSupervisor;
  const documentTasksRequest = state.documentTask.documentTasksRequest;
  const documentTasksState = state.documentTask.data;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [search, setSearch] = useState("");
  const [dataLength, setDataLength] = useState(false);
  const [modalCreate, setModalCreate] = useState(false);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    if (!documentTasksRequest) {
      setRequestApi(true);
      http
        .get(`/doctask/sectors${search ? `?search=${search}` : ""}`)
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        });
    }
  }, [documentTasksRequest, documentTasksState, currentPage, search]);

  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        padding: 15,
        borderRadius: 5,
        height: "auto",
        flex: 1,
      }}
    >
      <ModalSector modal={modalCreate} setModal={setModalCreate} type={0} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 18, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="sectors.title" />
        </Text>
        {documentTaskIsSupervisor ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
    
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
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Search
          onSearch={(value) => {
            setSearch(value);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          placeholder={"sectors.filter.title"}
        />
      </View>

      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
      <FlatList
        data={dataResponse}
        renderItem={({ item, index }) => {
          return (
            <View>
              <ItemSektor data={item} />
            </View>
          );
        }}
        keyExtractor={(item, index) => item.id?.toString() || item.objectID?.toString() || `sector-${index}`}
      />
      {dataLength ? (
        <Text style={{ paddingTop: 10 }}>
          <FormattedMessage id="document.task.sector.noItems" />{" "}
        </Text>
      ) : (
        <></>
      )}
      {!dataLength ? (
        <View style={{ width: "80%" }}>
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
          height={10}
        />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default DocumentTaskSektorList;
