/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FormattedMessage } from "react-intl";
import { TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";

import { NavigationService } from "../../navigator";

// Components
import TaskList from "./TaskList";
import TaskUserConfigList from "./TaskUserConfigList";
import TaskView from "./TaskView";
import { styles } from "../../asset/style/components/header";
import AppContainerClean from "../../components/AppContainerClean";

const TaskContainer = (route) => {
  const { locationActive, id } = route.navigation.state.params;

  const state = useSelector((state) => state);
  const shotgunEnabled = state.userDataModule?.shotgunEnabled;
  const shotgunIsSupervisor = state.userDataModule?.shotgunIsSupervisor;

  return (
    <AppContainerClean location={"Task"}>
      {(() => {
        if (shotgunEnabled) {
          return (
            <View style={{ flex: 1 }}>
              {shotgunIsSupervisor ? (
                <View style={styles.viewHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      NavigationService.navigate("Task", {
                        locationActive: "",
                      });
                    }}
                    style={locationActive === "" ? styles.box : styles.box2}
                  >
                    <Text
                      style={
                        locationActive === "" ? styles.title : styles.title2
                      }
                    >
                      <FormattedMessage id="shotgun.task.list" />
                    </Text>
                  </TouchableOpacity>
                  {shotgunIsSupervisor ? (
                    <TouchableOpacity
                      onPress={() => {
                        NavigationService.navigate("Task", {
                          locationActive: "0",
                        });
                      }}
                      style={locationActive === "0" ? styles.box : styles.box2}
                    >
                      <Text
                        style={
                          locationActive === "0" ? styles.title : styles.title2
                        }
                      >
                        {" "}
                        <FormattedMessage id="Users.Configurations.List" />
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text></Text>
                  )}
                </View>
              ) : null}
              <View style={{ flex: 1 }} >
                {(() => {
                  if (locationActive === "0") {
                    return <TaskUserConfigList />;
                  } else if (locationActive === "1") {
                    return <TaskView id={id} />;
                  } else {
                    return <TaskList />;
                  }
                })()}
              </View>
            </View>
          );
        } else if (shotgunEnabled === false) {
          return <View></View>;
        }
      })()}
    </AppContainerClean>
  );
};

export default TaskContainer;
