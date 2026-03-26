import React from "react";
import { NavigationService } from "../../../navigator";
import { View, Text } from "react-native";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";
import { TouchableOpacity } from "react-native";
import { styles } from "../../../asset/style/components/header";

const HeaderVacation = ({ locationActive, canApprove, canSeeAllUsers }) => {
  const state = useSelector((state) => state);
  const vacationIsSupervisor = state.userDataModule?.vacationIsSupervisor;
  const vacationCanApprove = canApprove;
  const vacationCanSeeAllUsers = canSeeAllUsers;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  return (
    <View style={styles.viewHeader}>
      {/* Requests and Calendar-Request visible if user is Supervisor, Root Owner, or Can Approve */}
      {(vacationIsSupervisor ||
        isOwnerForRoot ||
        vacationCanApprove ||
        vacationCanSeeAllUsers) && (
        <>
          <TouchableOpacity
            style={locationActive === "0" ? styles.box : styles.box2}
            onPress={() => {
              NavigationService.navigate("Vacation", { locationActive: "0" });
            }}
          >
            <Text style={locationActive === "0" ? styles.title : styles.title2}>
              <FormattedMessage id="Users.Requests.List" />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={locationActive === "2" ? styles.box : styles.box2}
            onPress={() => {
              NavigationService.navigate("Vacation", { locationActive: "2" });
            }}
          >
            <Text style={locationActive === "2" ? styles.title : styles.title2}>
              <FormattedMessage id="calendar.with.requests" />
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Team-Configuration and Users only visible for Supervisor or Root Owner */}
      {(vacationIsSupervisor || isOwnerForRoot) && (
        <>
          <TouchableOpacity
            style={locationActive === "1" ? styles.box : styles.box2}
            onPress={() => {
              NavigationService.navigate("Vacation", { locationActive: "1" });
            }}
          >
            <Text style={locationActive === "1" ? styles.title : styles.title2}>
              <FormattedMessage id="Users.Configurations.List" />
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* My Requests - Always Visible */}
      <TouchableOpacity
        style={locationActive === "" ? styles.box : styles.box2}
        onPress={() => {
          NavigationService.navigate("Vacation", { locationActive: "" });
        }}
      >
        <Text style={locationActive === "" ? styles.title : styles.title2}>
          <FormattedMessage id="My.Requests.Vacation.List" />
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderVacation;
