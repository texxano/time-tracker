import React from "react";
import { View, Text } from "react-native";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";
import { TouchableOpacity } from "react-native";

import { NavigationService } from "../../../navigator";
import { styles } from "../../../asset/style/components/header";

const HeaderTeam = ({ locationActive }) => {
  const state = useSelector((state) => state);
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const isEditorForRoot = state.userDataRole?.isEditorForRoot;
  const teamId = state.userDataRole.teamId;
  return (
    <View style={styles.viewHeader}>
      {isEditorForRoot || isOwnerForRoot ? (
        <>
          <TouchableOpacity
            style={locationActive === "0" ? styles.box : styles.box2}
            onPress={() => {
              NavigationService.navigate("Users", { locationActive: "0" });
            }}
          >
            <Text style={locationActive === "0" ? styles.title : styles.title2}>
              <FormattedMessage id="projects.tabs.users.title" />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={locationActive === "1" ? styles.box : styles.box2}
            onPress={() => {
              NavigationService.navigate("Users", {
                locationActive: "1",
                teamId: "",
              });
            }}
          >
            <Text style={locationActive === "1" ? styles.title : styles.title2}>
              <FormattedMessage id="users.contacts" />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={locationActive === "2" ? styles.box : styles.box2}
            onPress={() => {
              NavigationService.navigate("Users", {
                locationActive: "2",
                teamId: "",
              });
            }}
          >
            <Text style={locationActive === "2" ? styles.title : styles.title2}>
              <FormattedMessage id="teams.tilte" />
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <></>
      )}
      {teamId ? (
        <TouchableOpacity
          style={locationActive === "3" ? styles.box : styles.box2}
          onPress={() => {
            NavigationService.navigate("Users", {
              locationActive: "3",
              teamId: teamId,
            });
          }}
        >
          <Text style={locationActive === "3" ? styles.title : styles.title2}>
            <FormattedMessage id="my.team" />
          </Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </View>
  );
};

export default HeaderTeam;
