import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, Platform } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";

import http from "../../../services/http";

const Statistics = ({ projectId, permissionCode, parentId }) => {
  const intl = useIntl();
  const state = useSelector((state) => state);
  const projectSuccess = state.project.success;

  const [data, setData] = useState([]);
  const [typeStatistics, setTypeStatistics] = useState(!parentId);

  useEffect(() => {
    if (projectSuccess) {
      let path1 = `/projects/statistics`;
      let path2 = `/projects/${projectId}/statistics`;
      http.get(`${typeStatistics ? path1 : path2}`).then((data) => {
        setData(convertStatisticData(data));
      });
    }
  }, [projectId, projectSuccess]);

  function convertStatisticData(data) {
    const projects = [
      {
        name: intl.formatMessage({ id: "projects.form.status.completed" }),
        population: data.projectsCompleted,
        color: "#689bcf",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: intl.formatMessage({ id: "projects.form.status.progress" }),
        population: data.projectsInProgress,
        color: "#eda400",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: intl.formatMessage({ id: "projects.form.status.new" }),
        population: data.projectsNew,
        color: "#babfc2",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
    ];

    return projects;
  }

  return (
    <>
      {permissionCode ? (
        <View style={styles.container}>
          {parentId && permissionCode >= 2 ? (
            <View style={styles.viewSubPrject}>
              <Text style={styles.textSubPrject}>
                <FormattedMessage id="Including.Sub.Projects" />:{" "}
              </Text>
              <Switch
                trackColor={{ false: "#7d7d7d", true: "#429cfc" }}
                thumbColor={typeStatistics ? "#007bff" : "#f4f3f4"}
                ios_backgroundColor="#7d7d7d"
                onValueChange={() => setTypeStatistics(!typeStatistics)}
                value={typeStatistics}
              />
            </View>
          ) : null}

          {data.length ? (
            <PieChart
              data={data}
              width={350}
              height={120}
              paddingLeft={-35}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#ccc",
                backgroundGradientTo: "#FFFFFF",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{ paddingTop: 10 }}
              accessor="population"
              backgroundColor="transparent"
              yAxisLabel="rtet"
              // absolute
            />
          ) : null}
        </View>
      ) : null}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: "#ccc",
    // shadowOpacity: 0.5,
    // shadowRadius: 5,
    padding: 10,
  },
  viewSubPrject: {
    flexDirection: "row",
    alignItems: "center",
  },
  textSubPrject: {
    fontSize: 17,
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
});
export default Statistics;
