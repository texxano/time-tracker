import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

// Redux
import { useSelector } from "react-redux";
// Components

import HeaderVacation from "./components/HeaderVacation";
import VacationPersonalRequestsList from "./VacationPersonalRequestsList";
import VacationUsersRequestsList from "./VacationUsersRequestsList";
import VacationUserConfigList from "./VacationUserConfigList";
import VacationCalendar from "./VacationCalendar";
import http from "../../services/http";

import AppContainerClean from "../../components/AppContainerClean";

const Vacation = (route) => {
  const { locationActive } = route.navigation.state.params;
  const state = useSelector((state) => state);
  const vacationEnabled = state.userDataModule.vacationEnabled;
  const [myVacationConfiguration, setMyVacationConfiguration] = useState(null);
  const [canApprove, setCanApprove] = useState(false);
  const [canSeeAllUsers, setCanSeeAllUsers] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getData = () => {
      http
        .get(`/vacations/users/me`)
        .then((data) => {

          setMyVacationConfiguration(data);
          setCanApprove(data.canApprove);
          setCanSeeAllUsers(data.canSeeAllUsers);
          setIsSupervisor(data.isSupervisor);
        })
        .finally(() => setLoading(false));
    };
    getData();
  }, []);
  
  return (
    <AppContainerClean location={"Vacation"} checkTokenExp={locationActive}>
           {loading ? (
                <ActivityIndicator size="large" color="#6c757d" />
              ) : (
                <></>
              )}
      {vacationEnabled && myVacationConfiguration ? (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {isSupervisor && (
              <HeaderVacation
                canApprove={canApprove}
                canSeeAllUsers={canSeeAllUsers}
                locationActive={locationActive}
              />
            )}
            <View style={{ flex: 1 }}>
              {(() => {
                if (
                  locationActive === "0" &&
                  (canApprove || isSupervisor || canSeeAllUsers)
                ) {
                  return <VacationUsersRequestsList canApprove={canApprove} />;
                } else if (locationActive === "1" && isSupervisor) {
                  return <VacationUserConfigList />;
                } else if (
                  locationActive === "2" &&
                  (canApprove || isSupervisor || canSeeAllUsers)
                ) {
                  return <VacationCalendar />;
                } else {
                  return (
                    <VacationPersonalRequestsList
                      myVacationConfiguration={myVacationConfiguration}
                    />
                  );
                }
              })()}
            </View>
          </View>
        </View>
      ) : (
        <View></View>
      )}
    </AppContainerClean>
  );
};

export default Vacation;
