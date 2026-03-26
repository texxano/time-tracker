/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FormattedMessage } from "react-intl";
import { Text, View, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
// Redux
import { NavigationService } from "../../navigator";

// Components
import CalendarEvent from "./CalendarEvent";
import CalendarRoom from "./CalendarRoom";
import CalendarUserConfigList from "./CalendarUserConfigList";
import CreateUpdateEvent from "./components/CreateUpdateEvent";

import { styles } from "../../asset/style/components/header";
import AppContainerClean from "../../components/AppContainerClean";

const CalendarContainer = (route) => {
  const { locationActive, id, update } = route.navigation.state.params;

  const state = useSelector((state) => state);
  const calendarmEnabled = state.userDataModule?.calendarmEnabled;
  const calendarmIsSupervisor = state.userDataModule?.calendarmIsSupervisor;

  return (
    <AppContainerClean location={"Calendar"} checkTokenExp={locationActive}>
      {(() => {
        if (calendarmEnabled) {
          return (
            <>
              <View>
                {calendarmIsSupervisor ? (
                  <View style={styles.viewHeader}>
                    <TouchableOpacity
                      style={locationActive === "" ? styles.box : styles.box2}
                      onPress={() => {
                        NavigationService.navigate("Calendar", {
                          locationActive: "",
                        });
                      }}
                    >
                      <Text
                        style={
                          locationActive === "" ? styles.title : styles.title2
                        }
                      >
                        <FormattedMessage id="calendar.tilte" />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={locationActive === "2" ? styles.box : styles.box2}
                      onPress={() => {
                        NavigationService.navigate("Calendar", {
                          locationActive: "2",
                        });
                      }}
                    >
                      <Text
                        style={
                          locationActive === "2" ? styles.title : styles.title2
                        }
                      >
                        <FormattedMessage id="Calendar.Room.List" />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={locationActive === "1" ? styles.box : styles.box2}
                      onPress={() => {
                        NavigationService.navigate("Calendar", {
                          locationActive: "1",
                        });
                      }}
                    >
                      <Text
                        style={
                          locationActive === "1" ? styles.title : styles.title2
                        }
                      >
                        <FormattedMessage id="Users.Configurations.List" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <View>
                  {(() => {
                    if (locationActive === "0") {
                      return <CalendarEvent />;
                    } else if (locationActive === "1") {
                      return <CalendarUserConfigList />;
                    } else if (locationActive === "2") {
                      return <CalendarRoom />;
                    } else if (locationActive === "3") {
                      return <CreateUpdateEvent idEvent={id} update={update} />;
                    } else {
                      return <CalendarEvent />;
                    }
                  })()}
                </View>
              </View>
            </>
          );
        } else if (calendarmEnabled === false) {
          return <View />;
        }
      })()}
    </AppContainerClean>
  );
};

export default CalendarContainer;
