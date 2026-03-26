import React, { useState, useEffect } from "react";
import { Text, View, Switch, Platform, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import ModalPermission from "./components/ModalPermission";
import LocationModule from "../../utils/locationModule";
import * as Location from "expo-location";
import ModalErrorPermission from "./components/ModalErrorPermission";
import Colors from "../../constants/Colors";

type TrackingStatusEvent = {
  status: boolean;
};

type LocationListener = {
  remove: () => void;
};

const GPS: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalErrorVisible, setModalErrorVisible] = useState<boolean>(false);
  const [locationTracking, setLocationTracking] = useState<boolean>(
    LocationModule.isTrackingLocation() === 1
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const listener: LocationListener | undefined = 
      LocationModule.addOnLocationTrackingStatusUpdatedListener?.((event: TrackingStatusEvent) => {
        console.log(
          "received event onLocationTrackingStatusUpdated locationTracking: " +
            event.status
        );
        setLocationTracking(event.status);
      });

    // Cleanup listener on unmount
    return () => {
      if (listener && listener.remove) {
        listener.remove();
      }
    };
  }, []);

  const handleEnableLocation = async (): Promise<void> => {
    try {
      const { granted: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      const { granted: foregroundStatus } = await Location.getForegroundPermissionsAsync();

      if (locationTracking) {
        // Stop tracking
        const result = await LocationModule.toggleLocationUpdates();
        setLocationTracking(result === 1);
      } else {
        // Start tracking
        if (foregroundStatus && backgroundStatus) {
          const result = await LocationModule.toggleLocationUpdates();
          setLocationTracking(result === 1);
        } else {
          setModalVisible(true);
        }
      }
    } catch (error) {
      // Reset state on error
      setLocationTracking(LocationModule.isTrackingLocation() === 1);
    }
  };

  const handleConfirm = async (): Promise<void> => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        setErrorMsg("Foreground location permission denied");
        return;
      }

      // Request background location permission
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        setErrorMsg("Background location permission denied");
        return;
      }

      // Start location tracking after permissions granted
      const result = await LocationModule.toggleLocationUpdates();
      setLocationTracking(result === 1);
    } catch (error) {
      setModalErrorVisible(true);
      setErrorMsg(error instanceof Error ? error.message : "Unknown error");
    }

    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Entypo name="location" size={20} color={Colors.gray_400} />
        <Text style={styles.title}>Location Tracking</Text>
        <Switch
          trackColor={{ false: Colors.switchTrackFalse, true: Colors.switchTrackTrue }}
          thumbColor={locationTracking ? Colors.switchThumbActive : Colors.switchThumbInactive}
          ios_backgroundColor={Colors.switchTrackFalse}
          onValueChange={() =>
            Platform.OS === "ios" ? handleConfirm() : handleEnableLocation()
          }
          value={locationTracking}
          style={{
            transform: [
              { scaleX: Platform.OS === "ios" ? 1 : 1.2 },
              { scaleY: Platform.OS === "ios" ? 1 : 1.2 },
            ],
          }}
        />
      </View>
      <ModalErrorPermission
        modalVisible={modalErrorVisible}
        setModalVisible={setModalErrorVisible}
        message={errorMsg}
      />
      <ModalPermission
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        handleConfirm={handleConfirm}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.gray_70,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    color: Colors.gray_400,
    fontWeight: "600",
    marginHorizontal: 10,
  },
});

export default GPS;
