/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";
// Redux
import { useSelector } from "react-redux";
import http from "../../../services/http";
// Components
import Pagination from "../../../components/Pagination";
import InitialUser from "../../../components/InitialUser";
import ItemTimeUserProjectCharget from "./ItemTimeUserProjectCharget";
import ModalCUDUserProjectCharge from "./ModalCUDUserProjectCharge";
import { globalStyles } from "../../../asset/style/globalStyles";

const TimeUserProjectCharget = ({ id, userData }) => {
  const state = useSelector((state) => state);
  const isAdministrator = state.userData?.isAdministrator;
  const trackingState = state.timeTracks;
  const timeTracksRequest = state.timeTracks.timeTracksRequest;

  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (!timeTracksRequest) {
      setRequestApi(true);
      http
        .get(
          `/timetracker/users/${id}/charges?PageSize=15${
            currentPage ? `&page=${currentPage}` : ""
          }`
        )
        .then((data) => {
          setRequestApi(false);
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setDataLength(data.list.length === 0);
        })
        .catch(() => {});
    }
  }, [currentPage, isAdministrator, trackingState]);

  return (
    <View
      style={{
        backgroundColor: "#ebf0f3",
        padding: 15,
        borderRadius: 5,
        height: "auto",
      }}
    >
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="User.Project.Charget" />
        </Text>
      </View>

      {userData?.firstName ? (
        <View
          style={{
            alignItems: "flex-start",
            marginBottom: 10,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <InitialUser
              FirstName={userData?.firstName}
              LastName={userData?.lastName}
              email={userData?.email}
              color={userData?.color}
            />
            <View style={{ paddingLeft: 17 }}>
              <Text style={{ fontSize: 17, fontWeight: "500" }}>
                {userData?.firstName} {userData?.lastName}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "500" }}>
                {userData?.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setModal(true)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 17 }}>
              <FormattedMessage id="Add.Project.Charget" />
            </Text>
            <View
              style={{
                backgroundColor: "#dee2e6",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#c7cbcf",
                padding: 6,
                marginLeft: 15,
                alignSelf: "flex-startTime",
              }}
            >
              <Entypo name="plus" size={24} color="#6c757d" />
            </View>
          </TouchableOpacity>
          <ModalCUDUserProjectCharge
            userId={id}
            modal={modal}
            setModal={setModal}
            type={1}
          />
        </View>
      ) : null}
      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}

      <FlatList
        data={dataResponse}
        renderItem={({ item, index }) => {
          return (
            <View key={index}>
              <ItemTimeUserProjectCharget data={item} userId={id} />
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      {dataLength ? (
        <Text style={globalStyles.dataLength}>
          <FormattedMessage id="project.charget.list.noItems" />
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

export default TimeUserProjectCharget;
