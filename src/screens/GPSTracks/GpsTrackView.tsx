import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  Keyboard,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline, Callout } from "react-native-maps";
import DatePicker from "react-native-neat-date-picker";
import { FormattedMessage } from "react-intl";
import * as Location from "expo-location";

import http from "../../services/http";
import { dateFormat } from "../../utils/dateFormat";
import FormatDateTime from "../../components/FormatDateTime";
import Colors from "../../constants/Colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Coordinate = {
  latitude: number;
  longitude: number;
};

type GpsDataPoint = Coordinate & {
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
  moment?: string;
  device?: string;
};

type DatePickerResult = {
  date: Date;
};

type Suggestion = {
  id: string;
  firstName: string;
  lastName: string;
};

const isValidCoordinate = (pos: any): pos is Coordinate =>
  pos &&
  typeof pos.latitude === "number" &&
  typeof pos.longitude === "number" &&
  !isNaN(pos.latitude) &&
  !isNaN(pos.longitude);

type GpsTrackViewProps = {
  id?: string;
};

const GpsTrackView: React.FC<GpsTrackViewProps> = ({ id: propId }) => {
  const [requestApi, setRequestApi] = useState<boolean>(true);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<GpsDataPoint[]>([]);
  const [positionStart, setPositionStart] = useState<GpsDataPoint | null>(null);
  const [positionFinish, setPositionFinish] = useState<GpsDataPoint | null>(null);
  const [selestUserId, setSelestUserId] = useState<string>("");
  const [showTrackTime, setShowTrackTime] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<number | null>(null);
  const [centerMap, setCenterMap] = useState<Coordinate>({
    latitude: 41.429728,
    longitude: 20.486272,
  });

  useEffect(() => {
    getDataUserGps(selestUserId);
  }, [date]);

  const getSuggestionValue = (suggestion: Suggestion): string => {
    setSelestUserId(suggestion.id);
    getDataUserGps(suggestion.id);
    return `${suggestion.firstName} ${suggestion.lastName}`;
  };

  const getDataUserGps = async (id: string): Promise<void> => {
    const path1 = `/gps/tracks/user/${id}`;
    const path2 = `/gps/tracks`;
    if (date) {
      try {
        setRequestApi(true);
        const response = await http.get(
          `${id ? path1 : path2}?date=${dateFormat(date)}`
        );
        setRequestApi(false);
        setData(response);
        setPositionStart(response[0] || null);
        setPositionFinish(response[response?.length - 1] || null);
        if (response.length && isValidCoordinate(response[response.length - 1])) {
          setCenterMap({
            latitude: response[response.length - 1]?.latitude,
            longitude: response[response.length - 1]?.longitude,
          });
        }
        setInfoOpen(null);
      } catch (err) {
        console.log("err", err);
        setRequestApi(false);
      }
    }
  };

  useEffect(() => {
    const checkLocationPermission = async (): Promise<void> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCenterMap({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log(error);
      }
    };
    checkLocationPermission();
  }, []);

  const handleToggle = (index: number): void => {
    setInfoOpen(index);
  };

  const handleOpenPicker = (): void => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  const onConfirm = (result: DatePickerResult | null): void => {
    setShowDatePicker(false);
    if (result) {
      setDate(result.date);
    }
  };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={showDatePicker}>
        <DatePicker
          colorOptions={{ headerColor: Colors.blue_300 }}
          isVisible={showDatePicker}
          mode={"single"}
          onCancel={() => setShowDatePicker(false)}
          onConfirm={onConfirm}
          maxDate={new Date()}
        />
      </Modal>

      <View>
        <TouchableOpacity onPress={handleOpenPicker} style={styles.dateButton}>
          <Text>
            {date ? (
              <FormatDateTime datevalue={date} type={1} />
            ) : (
              <FormattedMessage id="Date" />
            )}
          </Text>
        </TouchableOpacity>

        <View style={styles.markerToggle}>
          <Text>Show Marker </Text>
          <Switch
            trackColor={{ false: Colors.switchTrackFalse, true: Colors.switchTrackTrue }}
            thumbColor={showTrackTime ? Colors.switchThumbActive : Colors.switchThumbInactive}
            ios_backgroundColor={Colors.switchTrackFalse}
            value={showTrackTime}
            onValueChange={setShowTrackTime}
          />
        </View>
      </View>

      {requestApi && <ActivityIndicator size="large" color={Colors.gray_400} />}

      <MapView
        provider={"google"}
        style={styles.map}
        region={{
          latitude: centerMap.latitude,
          longitude: centerMap.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {data?.length > 0 && (
          <>
            <Polyline
              coordinates={data.filter(isValidCoordinate).map((item) => ({
                latitude: item.latitude,
                longitude: item.longitude,
              }))}
              strokeWidth={5}
              strokeColor={Colors.blue_400}
            />

            {positionStart && isValidCoordinate(positionStart) && (
              <Marker
                coordinate={{
                  latitude: positionStart.latitude,
                  longitude: positionStart.longitude,
                }}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>Start</Text>
                    <Text>
                      <FormatDateTime datevalue={positionStart.moment} type={2} />
                    </Text>
                    <Text>{positionStart.device}</Text>
                  </View>
                </Callout>
              </Marker>
            )}

            {positionFinish && isValidCoordinate(positionFinish) && (
              <Marker
                coordinate={{
                  latitude: positionFinish.latitude,
                  longitude: positionFinish.longitude,
                }}
              >
                <Callout>
                  <View>
                    <Text>Stop</Text>
                    <Text>
                      <FormatDateTime datevalue={positionFinish.moment} type={2} />
                    </Text>
                    <Text>{positionFinish.device}</Text>
                  </View>
                </Callout>
              </Marker>
            )}

            {showTrackTime &&
              data.map((item, index) =>
                isValidCoordinate(item) ? (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: item.latitude,
                      longitude: item.longitude,
                    }}
                    onPress={() => handleToggle(index)}
                  >
                    {infoOpen === index && (
                      <Callout>
                        <View>
                          <Text>{item.moment ? String(dateFormat(item.moment)) : ''}</Text>
                          <Text>{item.device}</Text>
                        </View>
                      </Callout>
                    )}
                  </Marker>
                ) : null
              )}
          </>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateButton: {
    width: "100%",
    borderColor: Colors.gray_200,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  markerToggle: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: Colors.gray_200,
    borderRadius: 4,
    paddingLeft: 10,
    paddingVertical: 5,
    borderWidth: 1,
    marginBottom: 10,
  },
  map: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  callout: {
    padding: 10,
  },
  calloutTitle: {
    fontWeight: "500",
  },
});

export default GpsTrackView;
