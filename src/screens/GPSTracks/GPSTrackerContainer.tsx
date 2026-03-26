import React from "react";
import { FormattedMessage } from "react-intl";
import { Text, View, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

// Redux
import { NavigationService } from "../../navigator";

// Components
import GPSUserConfigList from "./GPSUserConfigList";
import GpsTrackView from "./GpsTrackView";

import { styles } from "../../asset/style/components/header";
import AppContainerClean from "../../components/AppContainerClean";

// Type workaround for AppContainerClean (connected component)
const Container = AppContainerClean as any;

type RootState = {
  userDataModule?: {
    gpsEnabled?: boolean;
    gpsIsSupervisor?: boolean;
  };
};

type RouteParams = {
  locationActive: string;
  id?: string;
};

type NavigationState = {
  params: RouteParams;
};

type Navigation = {
  state: NavigationState;
};

type GPSTrackerContainerProps = {
  navigation: Navigation;
};

const GPSTrackerContainer: React.FC<GPSTrackerContainerProps> = ({ navigation }) => {
  const { locationActive, id } = navigation.state.params;

  const gpsEnabled = useSelector((state: RootState) => state.userDataModule?.gpsEnabled);
  const gpsIsSupervisor = useSelector((state: RootState) => state.userDataModule?.gpsIsSupervisor);

  const renderContent = (): React.ReactNode => {
    if (locationActive === "1") {
      return <GPSUserConfigList />;
    } else if (locationActive === "2") {
      return <GpsTrackView id={id} />;
    } else {
      return <GpsTrackView />;
    }
  };

  if (gpsEnabled === false) {
    return (
      <Container location={"Gps"}>
        <View />
      </Container>
    );
  }

  if (!gpsEnabled) {
    return (
      <Container location={"Gps"}>
        <View />
      </Container>
    );
  }

  return (
    <Container location={"Gps"}>
      <View style={{ zIndex: 9999, flex: 1 }}>
        {gpsIsSupervisor && (
          <View style={styles.viewHeader}>
            <TouchableOpacity
              style={locationActive === "" ? styles.box : styles.box2}
              onPress={() => {
                NavigationService.navigate("Gps", {
                  locationActive: "",
                });
              }}
            >
              <Text style={locationActive === "" ? styles.title : styles.title2}>
                <FormattedMessage id="gps.track.title" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={locationActive === "1" ? styles.box : styles.box2}
              onPress={() => {
                NavigationService.navigate("Gps", {
                  locationActive: "1",
                });
              }}
            >
              <Text style={locationActive === "1" ? styles.title : styles.title2}>
                <FormattedMessage id="Users.Configurations.List" />
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ flex: 1 }}>{renderContent()}</View>
      </View>
    </Container>
  );
};

export default GPSTrackerContainer;
