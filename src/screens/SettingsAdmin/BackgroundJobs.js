import React, { useState, useEffect } from "react";

import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Redux
import { useSelector, useDispatch } from "react-redux";
import http from "../../services/http";
import { auth } from "../../utils/statusUser";
import SendNotification from "./SendNotification";
import FormatDateTime from "../../components/FormatDateTime";
import { startJobs } from "../../redux/actions/SettingsAdmin/jobs.actions";
import AppContainerClean from "../../components/AppContainerClean";

const BackgroundJobs = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const request = state.jobs.jobsRequest;
  const [jobs, setJobs] = useState([]);
  const [requestApi, setRequestApi] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const response = await http.get(`/jobs/recurring`);
      setJobs(response);
      setRequestApi(false);
    };

    getData();
  }, []);
  const handleStartJobs = () => {
    dispatch(startJobs());
  };
  return (
    <>
      <AppContainerClean location={"BackgroundJobs"}>
        <View
          style={{ flexDirection: "row", alignItems: "center", minHeight: 37 }}
        >
          <Text style={{ fontSize: 20, color: "#6c757d", fontWeight: "600" }}>
            {/* <FormattedMessage id="Devices" /> */}
            Settings Admin
          </Text>
        </View>

        <View
          style={{
            borderBottomWidth: 10,
            borderTopWidth: 1,
            paddingVertical: 15,
            borderBottomColor: "#8f8f8f",
          }}
        >
          <Text style={{ marginBottom: 10, fontSize: 17 }}>Update App</Text>
          <SendNotification />
        </View>
        <View style={{ paddingVertical: 15 }}>
          <Text style={{ marginBottom: 10, fontSize: 17 }}>
            Background Jobs
          </Text>

          <TouchableOpacity
            onPress={handleStartJobs}
            style={{
              flexDirection: "row",
              borderRadius: 5,
              paddingHorizontal: 1,
              borderWidth: 2,
              borderColor: "#28a745",
              paddingVertical: 11,
              paddingHorizontal: 7,
            }}
          >
            <>
              <MaterialCommunityIcons
                name="electron-framework"
                size={18}
                color="#111"
              />
              <Text style={{ paddingLeft: 10 }}>Start Jobs </Text>
              {request ? (
                <ActivityIndicator size="small" color="#6c757d" />
              ) : (
                <Text> </Text>
              )}
            </>
          </TouchableOpacity>

          <View
            style={{
              marginTop: 10,
              borderTopWidth: 1,
              paddingVertical: 15,
              marginTop: 10,
            }}
          >
            <Text style={{ marginBottom: 10, fontSize: 17 }}>List Jobs</Text>

            {jobs.map((data, index) => (
              <View
                key={index}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  marginVertical: 5,
                  padding: 5,
                }}
              >
                <View style={{}}>
                  <Text>{data.id}</Text>
                  <Text>{data.lastExecutedStatus}</Text>
                  <Text>{data.cron}</Text>
                  <Text>
                    <FormatDateTime datevalue={data.lastExecuted} type={2} />
                  </Text>
                  <Text>{data.removed}</Text>
                </View>
              </View>
            ))}
            {requestApi ? (
              <ActivityIndicator size="large" color="#6c757d" />
            ) : (
              <></>
            )}
          </View>
        </View>
      </AppContainerClean>
    </>
  );
};

export default BackgroundJobs;
