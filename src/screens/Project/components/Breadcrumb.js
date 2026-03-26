import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { NavigationService } from "../../../navigator";
// Redux
import http from "../../../services/http";
import { globalStyles } from "../../../asset/style/globalStyles";
// Components

const Breadcrumb = ({ projectId, data }) => {
  const state = useSelector((state) => state);
  const isAdministrator = state.userDataRole?.isAdministrator;
  const parentIdState = state.getProjectData.parentId;

  const [dataPath, setDataPath] = useState([]);

  useEffect(() => {
    if (!isAdministrator) {
      http.get(`/projects/${projectId}/path`).then((data) => {
        setDataPath(data);
      });
    }
  }, [projectId]);
  return (
    <View
      style={[globalStyles.rowSpaceBetweenAlignItems, globalStyles.minHeight]}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", width: "80%" }}>
        {dataPath?.map((data, index) => (
          <View key={index}>
            {dataPath[dataPath.length - 1]?.projectId === data.projectId ? (
              <Text style={{ color: "#6c757d", fontSize: 15 }}>
                {data.title.length < 20
                  ? `${data.title}`
                  : `${data.title.substring(0, 20)}...`}{" "}
              </Text>
            ) : (
              <TouchableOpacity
                key={data.projectId}
                onPress={() =>
                  NavigationService.navigate("Project", {
                    projectId: data.projectId,
                    projectName: data.title,
                  })
                }
              >
                <Text style={{ color: "#007bff", fontSize: 15 }}>
                  {data.title.length < 20
                    ? `${data.title}`
                    : `${data.title.substring(0, 20)}...`}{" "}
                  <AntDesign name="right" size={14} color="#6c757d" />
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      <View>
        {(data.navigateFrom === undefined ||
          data.navigateFrom === "HeaderProject") &&
        dataPath.length > 1 ? (
          <TouchableOpacity
            onPress={() => {
              NavigationService.navigate("Project", {
                projectId: parentIdState,
                parentId: data.parentId,
                permissionCode: data.permissionCode,
                projectName: data.titleProject,
              });
            }}
            style={globalStyles.rowSpaceBetweenAlignItems}
          >
            <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
            <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
          </TouchableOpacity>
        ) : (
          <>
            {data.navigateFrom !== "HeaderProject" ? (
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate(data.navigateFrom || "Dashboard", {
                  });
                }}
                style={globalStyles.rowSpaceBetweenAlignItems}
              >
                <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
                <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  NavigationService.navigate("Dashboard", {
                  });
                }}
                style={globalStyles.rowSpaceBetweenAlignItems}
              >
                <Ionicons name="chevron-back-sharp" size={20} color="#6c757d" />
                <Text style={{ fontSize: 20, color: "#6c757d" }}>Back</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default Breadcrumb;
