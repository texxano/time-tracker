/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { View } from "react-native";

// Redux
import { useSelector } from "react-redux";
// Redux

// Components
import TeamsUserList from "./TeamsUserList";
import AllUsers from "./AllUsers";
import TeamsList from "./TeamsList";
import HeaderTeam from "./components/HeaderTeam";
import UsersTeamsContacts from "./UsersTeamsContacts";
import AppContainerClean from "../../components/AppContainerClean";
// Components

const TeamsContainer = (route) => {
  const { locationActive, teamId } = route.navigation.state.params;
  const state = useSelector((state) => state);
  const projectId = state.userDataRole.rootId;
  return (
    <AppContainerClean location={"UsersTeams"}>
      <View style={{ flex: 1 }}>
        <View>
          <HeaderTeam locationActive={locationActive} />
        </View>
        <View className="bg-white box-radius" style={{ flex: 1 }}>
          {(() => {
            if (locationActive === "0") {
              return <AllUsers projectId={projectId} />;
            } else if (locationActive === "1") {
              return <UsersTeamsContacts teamId={teamId} />;
            } else if (locationActive === "2") {
              return (
                <>
                  {teamId ? <TeamsUserList teamId={teamId} /> : <TeamsList />}
                </>
              );
            } else if (locationActive === "3") {
              return <TeamsUserList teamId={teamId} />;
            }
          })()}
        </View>
      </View>
    </AppContainerClean>
  );
};
export default TeamsContainer;
