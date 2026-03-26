import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormattedMessage } from "react-intl";

import { NavigationService } from "../../../navigator";
// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../../services/http";
import {
  startTimeTrack,
  stopTimeTrack,
  startTimeTrackForProject,
  isTracking,
} from "../../../redux/actions/TimeTracks/timeTracks.actions";
// Redux

// Components
import Pagination from "../../../components/Pagination";
import { dateFormat } from "../../../utils/dateFormat";
import ModalStopTime from "../components/ModalStopTime";
// Components

import { styles } from "../TimeTracks.Styles";
import { globalStyles } from "../../../asset/style/globalStyles";
import { TimeAndSumeCostTrack } from "../components/TimeAndSumeCostTrack";
import AppContainerClean from "../../../components/AppContainerClean";

const TimeTracksCharge = (route) => {
  const location = route.navigation.state.params.location;

  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const timeTracksRequest = state.timeTracks.timeTracksRequest;
  const trackingState = state.timeTracks.data;
  const userId = state.userDataRole.userId;

  const [dataResponse, setDataResponse] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(false);
  const [pagination, setpagination] = useState(0);

  const [dataFirstTrack, setDataFirstTrack] = useState([]);
  const [dataCharge, setDataCharge] = useState({});
  const [dataDefaultModule, setDataDefaultModule] = useState({});
  const [requestChargeApi, setRequestChargeApi] = useState(true);

  const [modalTimeTracks, setModalTimeTracks] = useState(false);

  const to = new Date();
  const from = new Date().setDate(to.getDate() - 10);

  useEffect(() => {
    const getData = async () => {
      setRequestChargeApi(true);
      http
        .get(
          `/timetracker/users/${userId}/charges${
            currentPage ? `?page=${currentPage}` : ""
          }`
        )
        .then((data) => {
          setDataResponse(data.list);
          setPageIndex(data.pageIndex);
          setTotalPages(data.totalPages);
          setRequestChargeApi(false);
          if (data.list.length !== 0) {
            if (currentPage === 1) {
              setDataLength(false);
            }
          } else {
            setDataLength(true);
            dispatch(isTracking(false))
          }
        });
    };
    getData();
  }, [currentPage, timeTracksRequest]);

  useEffect(() => {
    const getData = async () => {
      setModalTimeTracks(false);
      http
        .get(
          `/timetracker/tracks?From=${dateFormat(from)}&To=${dateFormat(to)}`
        )
        .then((data) => {
          setDataCharge(data.list?.find((x) => x.isTracking === true));
          dispatch(isTracking(data.list?.find((x) => x.isTracking === true)?.isTracking ? true : false))
        });
      http.get(`/timetracker/users/me`).then((data) => {
        setDataDefaultModule(data);
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
  const handleStartTimeTrackCharge = (projectId) => {
    const payload = { projectId, description: null };
    dispatch(startTimeTrackForProject(payload));
  };
  const handleStopTimeTrack = () => {
    dispatch(stopTimeTrack());
  };

  return (
    <AppContainerClean
      location="TimeTracks"
      pagination={pagination}
    >
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
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
          <FormattedMessage id="User.Project.Charget" />
        </Text>
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
      {requestChargeApi ? (
        <ActivityIndicator size="large" color="#6c757d" />
      ) : (
        <></>
      )}
      <View
        style={
          !dataCharge?.projectId && dataCharge?.isTracking
            ? styles.box
            : styles.boxTrack
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.boxtitle}>
            <Text style={{ fontSize: 18, paddingBottom: 5 }}>
              <FormattedMessage id="Start.Time.Tracks.Default" />
            </Text>
          </View>
          {!dataCharge?.projectId && dataCharge?.isTracking ? (
            <TouchableOpacity
              onPress={() => handleStopTimeTrack(true)}
              style={{
                backgroundColor: "#dc3545",
                borderRadius: 5,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: "#fff" }}>
                <FormattedMessage id="Stop" />
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleTimeTrack(true)}
              style={{
                backgroundColor: "#4CAF50",
                borderRadius: 5,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: "#fff" }}>
                <FormattedMessage id="Start" />
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ fontSize: 18, paddingBottom: 10 }}>
          <FormattedMessage id="price.per.hour" />:{" "}
          <Text style={{ fontWeight: "500" }}>
            {dataDefaultModule.pricePerHour}
            {dataDefaultModule.currencyCode}
          </Text>
        </Text>
        {!dataCharge?.projectId && dataCharge?.isTracking ? (
          <TimeAndSumeCostTrack
            dataCharge={dataCharge}
            data={dataDefaultModule}
          />
        ) : (
          ""
        )}
      </View>
      {dataResponse.map((data, index) => (
        <View
          key={index}
          style={
            dataCharge?.projectId === data?.projectId && dataCharge?.isTracking
              ? styles.box
              : styles.boxTrack
          }
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={styles.boxtitle}>
              <Text style={{ fontSize: 18, paddingBottom: 5 }}>
                {data.projectTitle}{" "}
              </Text>
            </View>
            {dataCharge?.projectId === data?.projectId &&
            dataCharge?.isTracking ? (
              <TouchableOpacity
                onPress={() => handleStopTimeTrack(true)}
                style={{
                  backgroundColor: "#dc3545",
                  borderRadius: 5,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 14, color: "#fff" }}>
                  <FormattedMessage id="Stop" />
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => handleStartTimeTrackCharge(data?.projectId)}
                  style={{
                    backgroundColor: "#4CAF50",
                    borderRadius: 5,
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#fff" }}>
                    <FormattedMessage id="Start" />
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <Text style={{ fontSize: 18, paddingBottom: 10 }}>
            <FormattedMessage id="price.per.hour" />:
            <Text style={{ fontWeight: "500" }}>
              {" "}
              {data.pricePerHour} {data.currencyCode}
            </Text>{" "}
          </Text>
          {dataCharge?.projectId === data?.projectId &&
          dataCharge?.isTracking ? (
            <TimeAndSumeCostTrack dataCharge={dataCharge} data={data} />
          ) : (
            ""
          )}
        </View>
      ))}
      {dataLength ? (
        <Text style={globalStyles.dataLength}>
          <FormattedMessage id="project.charget.list.noItems" />{" "}
        </Text>
      ) : (
        <></>
      )}
      <Pagination
        onPageChange={(page) => setCurrentPage(page)}
        currentPage={pageIndex}
        total={totalPages}
      />
    </AppContainerClean>
  );
};

export default TimeTracksCharge;
