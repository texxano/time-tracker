import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Redux
import { useSelector } from "react-redux";
// Redux
import http from "../../services/http";
import { dateFormat } from "../../utils/dateFormat";

import FormatDateTime from "../../components/FormatDateTime";

import { globalStyles } from "../../asset/style/globalStyles";
// Components
import InitialUser from "../../components/InitialUser";

const windowWidth = Dimensions.get("window").width;

const TimeSheet = ({ userId, userData }) => {
  const state = useSelector((state) => state);
  const trackingState = state.timeTracks.data;
  const timeTracksRequest = state.timeTracks.timeTracksRequest;

  const [dataResponse, setDataResponse] = useState([]);
  const [requestApi, setRequestApi] = useState(true);
  const [dataLength, setDataLength] = useState(false);

  const selectedDate = new Date();
  const firstDayOfWeek = selectedDate.getDate() - selectedDate.getDay();
  const startOfWeek = new Date(selectedDate.setDate(firstDayOfWeek));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const [startDate, setStartDate] = useState(startOfWeek);
  const [endDate, setEndDate] = useState(endOfWeek);
  const getNextWeek = () => {
    const nextWeekStartDate = new Date(startDate);
    nextWeekStartDate.setDate(nextWeekStartDate.getDate() + 7);

    const nextWeekEndDate = new Date(nextWeekStartDate);
    nextWeekEndDate.setDate(nextWeekEndDate.getDate() + 6);

    return { startDate: nextWeekStartDate, endDate: nextWeekEndDate };
  };

  const getPrevWeek = () => {
    const prevWeekStartDate = new Date(startDate);
    prevWeekStartDate.setDate(prevWeekStartDate.getDate() - 7);

    const prevWeekEndDate = new Date(prevWeekStartDate);
    prevWeekEndDate.setDate(prevWeekEndDate.getDate() + 6);

    return { startDate: prevWeekStartDate, endDate: prevWeekEndDate };
  };

  const handleNextWeek = () => {
    const { startDate: nextStartDate, endDate: nextEndDate } = getNextWeek();
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    getDataResponse(nextStartDate, nextEndDate);
  };

  const handlePrevWeek = () => {
    const { startDate: prevStartDate, endDate: prevEndDate } = getPrevWeek();
    setStartDate(prevStartDate);
    setEndDate(prevEndDate);
    getDataResponse(prevStartDate, prevEndDate);
  };
  useEffect(() => {
    if (!timeTracksRequest) {
      getDataResponse(startDate, endDate);
    }
  }, [trackingState, userId]);

  const getDataResponse = (from, to) => {
    setRequestApi(true);
    let path1 = `/timetracker/sheets/user/${userId}`;
    let path2 = `/timetracker/sheets`;
    http
      .get(
        `${userId ? path1 : path2}?From=${dateFormat(from)}&To=${dateFormat(
          to
        )}`
      )
      .then((data) => {
        setRequestApi(false);
        setDataResponse(data);
        if (data.length !== 0) {
          setDataLength(false);
        } else {
          setDataLength(true);
        }
      });
  };

  const groupedData1 = dataResponse?.reduce((result, currentValue) => {
    const projectId =
      currentValue.projectId !== null ? currentValue.projectId : "null";
    if (!result[projectId]) {
      result[projectId] = [];
    }

    result[projectId].push(currentValue);
    return result;
  }, []);

  const groupedData = Object.entries(groupedData1);

  function getDayOfWeek(date, nr) {
    const chngDate = new Date(date);
    chngDate.setDate(chngDate.getDate() + nr);
    const mondayFormatted = `${chngDate.toLocaleString("default", {
      month: "short",
    })} ${chngDate.getDate()}`;

    return {
      mondayFormatted,
    };
  }

  function getSumDay(date, nr, project, total, projectTotal) {
    const chngDate = new Date(date);
    chngDate.setDate(chngDate.getDate() + nr);
    chngDate.setHours(0, 0, 0, 0);
    let data;

    if (total) {
      data = dataResponse;
    } else if (project) {
      data = project.filter(
        (data) => new Date(data.date).getTime() === new Date(chngDate).getTime()
      );
    } else if (projectTotal) {
      data = dataResponse.filter((data) => {
        if (data.projectId === null && projectTotal === "null") {
          return true;
        }
        return data.projectId === projectTotal;
      });
    } else {
      data = dataResponse.filter(
        (data) => new Date(data.date).getTime() === new Date(chngDate).getTime()
      );
    }

    const totalMinutesSum = data?.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalMinutes;
    }, 0);

    const hours = Math.floor(totalMinutesSum / 60);
    const remainingMinutes = totalMinutesSum % 60;
    let format = `${String(hours).padStart(2, "0")}:${String(
      remainingMinutes
    ).padStart(2, "0")}:00`;

    return totalMinutesSum ? <Text>{format}</Text> : <Text>{format}</Text>;
  }

  return (
    <View>
      {/* {userId ?
        <Text  onPress={() => history.push(`/timetracks/users`)()}>
          <i className="fa-solid fa-chevron-left"></i>
          &nbsp;Back
        </Text>
        : ""} */}
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
            <FormattedMessage id="Time.Sheet" />
          </Text>
        </View>
        <View
          style={{
            marginBottom: 10,
            backgroundColor: "#fff",
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => handlePrevWeek()}
            style={[
              globalStyles.btnCircle,
              {
                marginLeft: 0,
                borderTopEndRadius: 0,
                borderBottomEndRadius: 0,
              },
            ]}
            disabled={requestApi}
          >
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}>
              {"<"} Previous
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: windowWidth < 430 ? 15 : 17 }}>
            <FormatDateTime datevalue={startDate} type={1} /> -
            <FormatDateTime datevalue={endDate} type={1} />{" "}
          </Text>
          <TouchableOpacity
            onPress={() => handleNextWeek()}
            style={[
              globalStyles.btnCircle,
              {
                margin: 0,
                borderTopStartRadius: 0,
                borderBottomStartRadius: 0,
              },
            ]}
            disabled={requestApi}
          >
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#6c757d" }}>
              Next {">"}
            </Text>
          </TouchableOpacity>
        </View>
        {userData?.firstName ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
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
          </View>
        ) : null}
        {requestApi ? <View className="loader-line"></View> : <></>}
        <ScrollView horizontal={true}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={{ width: 150, fontSize: 16, fontWeight: "500" }}>
                <FormattedMessage id="projects.tabs.projects.title" />
              </Text>
              <View style={styles.dayWeek}>
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
                  (day, index) => (
                    <Text key={index} style={styles.day}>{`${day}, ${
                      getDayOfWeek(startDate, index).mondayFormatted
                    }`}</Text>
                  )
                )}
                <Text style={styles.total}>
                  <FormattedMessage id="Total" />
                </Text>
              </View>
            </View>
            <View style={styles.body}>
              {groupedData?.map((data, index) => (
                <View key={index} style={styles.row}>
                  {data[1][0].projectTitle === null ? (
                    <Text style={styles.project}>Default</Text>
                  ) : (
                    <Text style={[styles.project, { fontWeight: "500" }]}>
                      {data[1][0].projectTitle}
                    </Text>
                  )}
                  <View style={styles.dayWeek}>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                      <Text key={dayIndex} style={styles.day}>
                        {getSumDay(startDate, dayIndex, data[1], null)}
                      </Text>
                    ))}
                    <Text style={styles.total}>
                      {getSumDay(startDate, 1, null, null, data[0])}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.footer}>
              <Text style={[styles.project, { fontWeight: "500" }]}>
                <FormattedMessage id="Total" />
              </Text>
              <View style={styles.dayWeek}>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                  <Text key={dayIndex} style={styles.day}>
                    {getSumDay(startDate, dayIndex)}
                  </Text>
                ))}
                <Text style={styles.total}>
                  <FormattedMessage id="Total" />:{" "}
                  {getSumDay(startDate, 0, null, true)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <MaterialCommunityIcons
          name="gesture-swipe-horizontal"
          size={24}
          color="#6c757d"
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  day: {
    // flex: 1,
    width: 85,
  },
  total: {
    flex: 2,
    fontWeight: "600",
  },
  body: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  small: {
    fontSize: 12,
  },
  project: {
    fontSize: 16,
    width: 150,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 5,
  },
});

export default TimeSheet;
