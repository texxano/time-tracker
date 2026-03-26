import React from "react";
import { View } from "react-native";

// Redux
import { useSelector } from "react-redux";
// Components
import HeaderTracksTime from "./components/HeaderTracksTime";
import TimeTracksList from "./TimeTracksList";

import ShiftTemplatesList from "./ShiftTemplates/ShiftTemplatesList";
import TimeUserConfigList from "./TimeUserConfigList";
import ShiftTemplatesView from "./ShiftTemplates/ShiftTemplatesView";
import ShiftUser from "./ShiftUser/ShiftUser";
import TimeUserProjectCharget from "./TimeProjectCharge/TimeUserProjectCharget";
import TimeSheet from "./TimeSheet";
import AppContainerClean from "../../components/AppContainerClean";

const Time = (route) => {
  const { locationActive, id, userData } = route.navigation.state.params;
  const state = useSelector((state) => state);
  const timeTrackerEnabled = state.userDataModule?.timeTrackerEnabled;

  return (
    <AppContainerClean location={"Time"}>
      {(() => {
        if (timeTrackerEnabled) {
          return (
            <View style={{ flex: 1 }}>
              <HeaderTracksTime locationActive={locationActive} userId={id} />
              <View style={{ flex: 1 }}>
                {(() => {
                  if (locationActive === "0") {
                    return (
                      <View style={{ flex: 1 }}>
                        {id ? (
                          <ShiftTemplatesView id={id} />
                        ) : (
                          <ShiftTemplatesList />
                        )}
                      </View>
                    );
                  } else if (locationActive === "1") {
                    return (
                      <View style={{ flex: 1 }}>
                        {id ? (
                          <ShiftUser id={id} userData={userData} />
                        ) : (
                          <TimeUserConfigList />
                        )}
                      </View>
                    );
                  } else if (locationActive === "2") {
                    return <ShiftUser />;
                  } else if (locationActive === "3") {
                    return <TimeTracksList userId={id} userData={userData} />;
                  } else if (locationActive === "4") {
                    return (
                      <TimeUserProjectCharget id={id} userData={userData} />
                    );
                  } else if (locationActive === "5") {
                    return <TimeSheet userId={id} userData={userData} />;
                  } else {
                    return <TimeTracksList />;
                  }
                })()}
              </View>
            </View>
          );
        } else if (timeTrackerEnabled === false) {
          return <View />;
        }
      })()}
    </AppContainerClean>
  );
};

export default Time;
