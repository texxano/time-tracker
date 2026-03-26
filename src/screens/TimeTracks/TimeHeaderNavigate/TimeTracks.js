import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";

import { NavigationService } from "../../../navigator";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../../services/http";
import {
  startTimeTrack,
  stopTimeTrack,
  isTracking,
  deleteByIdTimeTrack,
  deleteAllTimeTrack,
} from "../../../redux/actions/TimeTracks/timeTracks.actions";
// Redux

// Components
import Pagination from "../../../components/Pagination";
import TotalWorkTimeTrack from "../components/TotalWorkTimeTrack";
import FormatDateTime from "../../../components/FormatDateTime";
import ModalDelete from "../../../components/Modal/ModalDelete";
import ModalReport from "../../../components/Modal/ModalReport";
import ModalStopTime from "../components/ModalStopTime";
// Components

import { styles } from "../TimeTracks.Styles";
import ItemTimeTracks from "../components/ItemTimeTracks";
import AppContainerClean from "../../../components/AppContainerClean";

const TimeTracks = (route) => {
  const location = route.navigation.state.params.location;

  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const userIdState = state.userDataRole.userId;

  const isTrackingState = state.isTimeTracks.isTracking;
  const trackingState = state.timeTracks.data;
  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(true);
  const [pagination, setpagination] = useState(0);

  const [dataFirstTrack, setDataFirstTrack] = useState([]);
  const [modalTimeTracks, setModalTimeTracks] = useState(false);
  useEffect(() => {
    const getData = async () => {
      setModalTimeTracks(false);
      http.get(`/timetracker/tracks?page=${currentPage}`).then((data) => {
        setDataResponse(data.list);
        setPageIndex(data.pageIndex);
        setTotalPages(data.totalPages);
        setRequestApi(false);
        if (data.list.length !== 0) {
          setDataLength(false);
          if (currentPage === 1) {
            setDataFirstTrack(data.list[0]);
            dispatch(isTracking(data.list[0].isTracking));
          }
        } else {
          setDataLength(true);
          dispatch(isTracking(false));
        }
      });
    };
    getData();
  }, [currentPage, trackingState]);

  // Start Sotop Time Prack
  const handleTimeTrack = (status) => {
    if (status) {
      dispatch(startTimeTrack());
    } else {
      dispatch(stopTimeTrack());
    }
  };
  const handleOpenModal = () => {
    setModalTimeTracks(true);
  };
  // Start Sotop Time Track

  const handleDeletedById = (id) => {
    dispatch(deleteByIdTimeTrack(id));
  };
  const handleDeletedAll = () => {
    dispatch(deleteAllTimeTrack());
  };

  return (
    <AppContainerClean location="TimeTracks" pagination={pagination}>
      <ModalStopTime
        handleTimeTrack={handleTimeTrack}
        modalTimeTracks={modalTimeTracks}
        setModalTimeTracks={setModalTimeTracks}
        time={dataFirstTrack.start}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "#6c757d",
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
            <FormattedMessage id="Time.Tracks" />{" "}
          </Text>
          <>
            {dataFirstTrack.start || isTrackingState ? (
              <ModalDelete
                description={"timeLogs.delete.modal.description"}
                deleted={handleDeletedAll}
                type={0}
              />
            ) : (
              <Text style={{ paddingVertical: 10 }}></Text>
            )}
          </>
        </View>
        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate(location || "Dashboard", {
              location: location,
            });
          }}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
          <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginTop: 30,
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      >
        {isTrackingState ? (
          <>
            <TouchableOpacity
              onPress={handleOpenModal}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ffc107",
                height: 80,
                width: 100,
                borderRadius: 10,
                marginRight: 20,
              }}
            >
              <Text style={{ fontSize: 20, color: "#fff" }}>
                <FormattedMessage id="Stop" />
              </Text>
            </TouchableOpacity>
            {dataFirstTrack.start ? (
              <View>
                <View style={{ flexDirection: "row", paddingBottom: 10 }}>
                  <Text style={{ fontSize: 16 }}>
                    <FormattedMessage id="the.work.started.at" />
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>
                    {" "}
                    <FormatDateTime
                      datevalue={dataFirstTrack.start}
                      type={0}
                    />{" "}
                  </Text>
                </View>

                <Text style={{ fontSize: 16 }}>
                  <FormattedMessage id="Total" />:{" "}
                  <TotalWorkTimeTrack
                    startDate={dataFirstTrack.start}
                    stopDate={new Date()}
                  />
                </Text>
              </View>
            ) : (
              <></>
            )}
          </>
        ) : (
          <TouchableOpacity
            onPress={() => handleTimeTrack(true)}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#4CAF50",
              height: 80,
              width: 100,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 20, color: "#fff" }}>
              <FormattedMessage id="Start" />
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {dataResponse?.length ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderBottomColor: "#6c757d",
            paddingBottom: 10,
          }}
        >
          <ModalReport reportFor={1} />
        </View>
      ) : null}
      <FlatList
        data={dataResponse}
        renderItem={({ item, index }) => {
          return (
            <View key={index}>
              <ItemTimeTracks data={item} userId={userIdState} />
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      {requestApi ? <ActivityIndicator size="large" color="#6c757d" /> : <></>}
      {/* { dataLength ? (<Text style={styles.dataLength}><FormattedMessage id="comments.list.noItems" /></Text>) : (<></>)} */}

      <Pagination
        onPageChange={(page) => setCurrentPage(page)}
        currentPage={pageIndex}
        total={totalPages}
      />
    </AppContainerClean>
  );
};

export default TimeTracks;
