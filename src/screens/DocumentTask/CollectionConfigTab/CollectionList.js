import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Input } from "native-base";
// Redux
import { useSelector } from "react-redux";
import http from "../../../services/http";
// Redux
import { NavigationService } from "../../../navigator";
import { documentTaskBooksServices } from "../../../services/DocumentTask/documentTaskBook.Services";

import Search from "../../../components/Search";
import Pagination from "../../../components/Pagination";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import colors from "../../../constants/Colors";

import CreateBookForm from "./createBook/CreateBookForm";
import InvoicesCollectionList from "./invoicesCollections/InvoicesColleciontList";
import { my } from "../../../asset/style/utilities.style";
const windowWidth = Dimensions.get("window").width;

const CollectionList = () => {
  const state = useSelector((state) => state);
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const documentTasksRequest = state.documentTask.documentTasksRequest;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [search, setSearch] = useState("");
  const [dataLength, setDataLength] = useState(false);
  const [modalCreate, setModalCreate] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [reloadApi, setReloadApi] = useState("");

  useEffect(() => {
    if ( !documentTasksRequest) {
      setRequestApi(true);
      // TODO  year
      http
        .get(`/doctask/books${search ? `&search=${search}` : ""}`)
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        });
    }
  }, [
  
    documentTasksRequest,
    currentPage,
    search,
    reloadApi,
  ]);

  const [name, setName] = useState("");

  const handleConfirm = () => {
    if (name) {
      try {
        documentTaskBooksServices.createDocumentTaskBook({ name }).then(() => {
          setReloadApi(new Date());
          setName("");
          setModalCreate(false);
        });
      } catch (error) {
        console.error("Error uploading document:", error);
      }
    }
  };
  const handleCloseModal = () => {
    setName("");
    setModalCreate(false);
  };

  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        padding: 15,
        borderRadius: 5,
        height: "auto",
        flex: 1
      }}
    >
      <CreateBookForm setReloadApi={setReloadApi} showModal={modalCreate} close={() => setModalCreate(false)} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems:"center",
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize:18, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="document.task.collection.list" />
        </Text>
        {isOwnerForRoot ? (
          <View style={[{ flexDirection: "row", alignItems: "center" }, my[1]]}>
    
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
          placeholder={"document.task.collection.filter.title"}
        />
      </View>

      {requestApi ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6c757d" />
        </View>
      ) : (
        <FlatList
          data={dataResponse}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  NavigationService.navigate("DocumentTask", {
                    locationActive: "7",
                    id: item.id,
                  })
                }
                style={[
                  styles.box,
                  { borderColor: "#ccc", backgroundColor: item.color },
                ]}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: colors.white,
                    fontWeight: "bold",
                  }}
                >
                  {item.name.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 16, color: colors.white }}>
                  {item.creationYear}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => item.id?.toString() || item.objectID?.toString() || `book-${index}`}
          ListFooterComponent={() => (
            <View>
              <InvoicesCollectionList
                reloadApi={reloadApi}
                search={search}
                currentPage={currentPage}
              />
              {dataLength ? (
                <Text style={{ paddingTop: 10 }}>
                  <FormattedMessage id="document.task.collection.noItems" />{" "}
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
          )}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  box: {
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});

export default CollectionList;
