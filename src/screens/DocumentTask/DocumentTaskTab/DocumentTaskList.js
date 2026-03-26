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
import { Entypo, AntDesign } from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../../services/http";
import { documentTaskCount } from "../../../redux/actions/DocumentTask/documentTask.actions";
// Redux
import Pagination from "../../../components/Pagination";
import ModalDocTask from "./components/ModalDocTask";
import ItemDocumentTask from "./components/ItemDocumentTask";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import ModalFilter from "./components/ModalFilter";
const windowWidth = Dimensions.get("window").width;

const DocumentTaskList = ({ isArchivePerson = false }) => {
  const dispatch = useDispatch();
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
  const [modalFilter, setModalFilter] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [filterCode, setFilterCode] = useState(0);
  const [sectorNameSearch, setSectorNameSearch] = useState("");
  const [requesterSearch, setRequesterSearch] = useState("");
  const [dataBookSelect, setDataBookSelect] = useState({});
  useEffect(() => {
    onSearchFilter();
  }, [documentTasksState, currentPage]);

  const onSearchFilter = () => {
    if (!documentTasksRequest) {
      setRequestApi(true);
      // TODO eshte perdorur sectorNameSearch
      // sectorId
      http
        .get(
          `${
            isArchivePerson ? `/doctask/tasks` : "/doctask/tasks/mine"
          }?statusFilter=${filterCode ? filterCode : 0}&pageSize=10${
            currentPage ? `&page=${currentPage}` : ""
          }${sectorNameSearch ? `&sectorNameSearch=${sectorNameSearch}` : ""}${
            requesterSearch ? `&requesterSearch=${requesterSearch}` : ""
          }${search ? `&search=${search}` : ""}${
            dataBookSelect.id ? `&bookI=${dataBookSelect.id}` : ""
          }`
        )
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
          dispatch(documentTaskCount(data.list?.length));
        })
        .catch((error) => {})
        .finally(() => {
          setRequestApi(false);
        });
    }
  };

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
      <ModalDocTask
        modal={modalCreate}
        setModal={setModalCreate}
        type={0}
        mode={1}
      />
      <ModalFilter
        modal={modalFilter}
        setModal={setModalFilter}
        onSearchFilter={onSearchFilter}
        filterCode={filterCode}
        setFilterCode={setFilterCode}
        setSearch={setSearch}
        search={search}
        setCurrentPage={setCurrentPage}
        setRequesterSearch={setRequesterSearch}
        requesterSearch={requesterSearch}
        setSectorNameSearch={setSectorNameSearch}
        sectorNameSearch={sectorNameSearch}
        setDataBookSelect={setDataBookSelect}
        dataBookSelect={dataBookSelect}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 18, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="document.task.tilte" />
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
        <Text>
          <FormattedMessage id="Filter" />{" "}
        </Text>
        <TouchableOpacity
          onPress={() => setModalFilter(true)}
          style={modalStyle.btnCircle}
        >
          <AntDesign name="filter" size={24} color="#6c757d" />
        </TouchableOpacity>
      </View>

      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
      <FlatList
        data={dataResponse}
        renderItem={({ item, index }) => {
          return (
            <View key={item.id}>
              <ItemDocumentTask data={item} isArchivePerson={isArchivePerson} />
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      {dataLength ? (
        <Text style={{ paddingTop: 10 }}>
          <FormattedMessage id="document.task.noItems" />{" "}
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

export default DocumentTaskList;
