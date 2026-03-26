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
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Input, TextArea } from "native-base";

// Redux
import { useDispatch, useSelector } from "react-redux";
import http from "../../../services/http";
// Redux
import Pagination from "../../../components/Pagination";
import { documentTaskServices } from "../../../services/DocumentTask/documentTask.Services";
import { documentTasksTypes } from "../../../redux/type/DocumentTask/documentTasks.types";

import { modalStyle } from "../../../asset/style/components/modalStyle";
import Search from "../../../components/Search";
const windowWidth = Dimensions.get("window").width;

export const CollapsibleView = ({ title, onPress, isOpen, children }) => {
  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            backgroundColor: "#fff",
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 20, color: "#111" }}>{title}</Text>
        </View>
      </TouchableWithoutFeedback>
      {isOpen ? (
        <View
          style={{
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: "#ccc",
            borderBottomLeftRadius: 5,
            borderBottomrightRadius: 5,
            backgroundColor: "#fff",
            paddingHorizontal: 15,
            paddingTop: 20,
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
};
const ArchiveConfigurationList = () => {
  const state = useSelector((state) => state);
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const idRootProject = state.idRootProject.id;
  const documentTaskIsSubervisor =
    state.userDataModule?.documentTaskIsSubervisor;
  const dispatch = useDispatch();
  const documentTasksRequest = state.documentTask.documentTasksRequest;
  const documentTasksState = state.documentTask.data;

  const [dataResponse, setDataResponse] = useState([]);
  const [dataResponseSub, setDataResponsSub] = useState([]);

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
        .get(`/doctask/tasks/numbers${search ? `?search=${search}` : ""}`)
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list.sort((x, y) => x.number - y.number));
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        });
    }
  }, [documentTasksRequest, currentPage, search, documentTasksState]);

  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [baseNumberId, setBaseNumberId] = useState("");

  const success = (data) => ({
    type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS,
    data: data,
  });

  const handleConfirm = async () => {
    if (number) {
      if (baseNumberId) {
        let request =
          await documentTaskServices.createDocumentTaskBaseNumbersSub({
            baseNumberId,
            number,
            description,
          });
        if (request.id) {
          handleCloseModal();
          dispatch(success(request));
        }
      }
      let request = await documentTaskServices.createDocumentTaskBaseNumbers({
        number,
        description,
      });
      if (request.id) {
        handleCloseModal();
        dispatch(success(request));
      }
    }
  };
  const getSubNumber = (number) => {
    if (!documentTasksRequest && number) {
      http
        .get(
          `/doctask/tasks/numbers/sub?BaseNumber=${number}&PageSize=50${
            search ? `&search=${search}` : ""
          }`
        )
        .then((data) => {
          setDataResponsSub(data.list);
        });
    }
  };
  const [openItemId, setOpenItemId] = useState(null);
  const handleToggle = (id, number) => {
    if (openItemId === id) {
      setOpenItemId(null);
    } else {
      setOpenItemId(id);
      getSubNumber(number);
      setDataResponsSub([]);
    }
  };
  const handleOpenModal = (id) => {
    setModalCreate(true);
    setBaseNumberId(id);
  };
  const handleCloseModal = () => {
    setDescription("");
    setNumber("");
    setModalCreate(false);
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCreate}
        style={{ height: 500 }}
      >
        <View style={modalStyle.centeredView}>
          <View style={modalStyle.modalView}>
            <View style={modalStyle.modalViewTitle}>
              <Text style={modalStyle.modalTitle}>
                <FormattedMessage
                  id={
                    baseNumberId
                      ? "crete.new.main.subnumber"
                      : "crete.new.main.number"
                  }
                />
              </Text>
            </View>
            <View
              style={[
                modalStyle.modalInput,
                modalStyle.paddingBottom60,
                { paddingHorizontal: 17 },
              ]}
            >
              <FormattedMessage id="archive.sign.collection.name">
                {(placeholder) => (
                  <Input
                    size={"lg"}
                    _focus
                    w="100%"
                    type="text"
                    placeholder={placeholder.toString()}
                    value={number}
                    onChangeText={(e) => setNumber(e)}
                    keyboardType="numeric"
                    my={3}
                    style={{ height: 40, backgroundColor: "#fff" }}
                  />
                )}
              </FormattedMessage>
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
      </Modal>
      <View
        style={{
            display: "flex",
          flexDirection: "row",     
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 18, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="document.task.collection.list" />
        </Text>
        {isOwnerForRoot ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => handleOpenModal("")}
            style={modalStyle.btnCircle}
          >
            <Entypo name="plus" size={24} color="#6c757d" />
          </TouchableOpacity>
        </View>
      ) : null}
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

      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
      <FlatList
        data={dataResponse}
        renderItem={({ item, index }) => {
          return (
            <CollapsibleView
              title={`${item.number} - ${item.description}`}
              onPress={() => handleToggle(item.id, item.number)}
              isOpen={openItemId === item.id}
            >
              {openItemId === item.id && (
                <View key={index} style={{ marginBottom: 10 }}>
                  {isOwnerForRoot ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text>
                        <FormattedMessage id="crete.new.main.subnumber" />{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleOpenModal(item.id)}
                        style={modalStyle.btnCircle}
                      >
                        <Entypo name="plus" size={18} color="#6c757d" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  <FlatList
                    data={dataResponseSub}
                    renderItem={({ item, index }) => {
                      return (
                        <View
                          key={index}
                          style={[styles.box, { borderColor: "#ccc" }]}
                        >
                          <Text
                            style={{ fontSize: 17 }}
                          >{`${item.number} - ${item.description}`}</Text>
                        </View>
                      );
                    }}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                  />
                </View>
              )}
            </CollapsibleView>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      {dataLength ? (
        <Text style={{ paddingTop: 10 }}>
          <FormattedMessage id="document.task.collection.noItems" />{" "}
        </Text>
      ) : (
        <></>
      )}
      {!dataLength ? (
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={pageIndex}
          total={totalPages}
          height={10}
        />
      ) : (
        <></>
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

export default ArchiveConfigurationList;
