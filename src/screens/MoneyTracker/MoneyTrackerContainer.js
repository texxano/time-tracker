/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { FormattedMessage } from "react-intl";
import { Text, View, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

// Redux
import { NavigationService } from "../../navigator";

// Components
import InvoicesList from "./InvoicesList";
import MoneyTrackerUserConfigList from "./MoneyTrackerUserConfigList";
import InvoiceView from "./InvoiceView";
import MoneyTrackerActivity from "./MoneyTrackerActivity";

import { styles } from "../../asset/style/components/header";
import AppContainerClean from "../../components/AppContainerClean";

const MoneyTrackerContainer = (route) => {
  const { locationActive, id } = route.navigation.state.params;

  const state = useSelector((state) => state);
  const moneyTrackerEnabled = state.userDataModule?.moneyTrackerEnabled;
  const moneyTrackerIsSupervisor =
    state.userDataModule?.moneyTrackerIsSupervisor;

  return (
    <AppContainerClean location={"MoneyTracker"}>
      {(() => {
        if (moneyTrackerEnabled) {
          return (
            <>
              <View>
                {moneyTrackerIsSupervisor ? (
                  <View style={styles.viewHeader}>
                    <TouchableOpacity
                      style={locationActive === "" ? styles.box : styles.box2}
                      onPress={() => {
                        NavigationService.navigate("MoneyTracker", {
                          locationActive: "",
                        });
                      }}
                    >
                      <Text
                        style={
                          locationActive === "" ? styles.title : styles.title2
                        }
                      >
                        <FormattedMessage id="money-tracker.tab.title" />
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={locationActive === "1" ? styles.box : styles.box2}
                      onPress={() => {
                        NavigationService.navigate("MoneyTracker", {
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
                    <TouchableOpacity
                      style={locationActive === "3" ? styles.box : styles.box2}
                      onPress={() => {
                        NavigationService.navigate("MoneyTracker", {
                          locationActive: "3",
                        });
                      }}
                    >
                      <Text
                        style={
                          locationActive === "3" ? styles.title : styles.title2
                        }
                      >
                        <FormattedMessage id="projects.tabs.activity.title" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <View>
                  {(() => {
                    if (locationActive === "1") {
                      return <MoneyTrackerUserConfigList />;
                    } else if (locationActive === "2") {
                      return <InvoiceView id={id} />;
                    } else if (locationActive === "3") {
                      return <MoneyTrackerActivity />;
                    } else {
                      return <InvoicesList />;
                    }
                  })()}
                </View>
              </View>
            </>
          );
        } else if (moneyTrackerEnabled === false) {
          return <View />;
        }
      })()}
    </AppContainerClean>
  );
};

export default MoneyTrackerContainer;
