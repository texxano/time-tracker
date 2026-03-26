import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { NavigationService } from "../../navigator";
import GeofenceModule from "../../utils/geofenceModule";
import LocationModule, { 
  setRealtimeGeofence, 
  clearRealtimeGeofence,
  isInsideRealtimeGeofence,
  addRealtimeGeofenceListener,
  getDistanceToGeofence,
  isTrackingLocation,
  getAdaptiveTrackingInfo,
  getWorkingHoursStatus,
  enableWorkingHours,
  disableWorkingHours,
  getRealtimeGeofence,
  // Multi-location support
  setMultipleGeofences,
  getAllGeofences,
  clearAllGeofences,
  isInsideAnyGeofence,
  getActiveGeofences,
  getDistancesToAllGeofences,
  loadGeofencesFromAPI,
  // Reset function
  resetGeofenceState,
} from "../../utils/locationModule";
import { gpsWorkplaceServices } from "../../services/GPSTracks/gpsWorkplace.services";
import Colors from "../../constants/Colors";

type GeofenceRegion = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
};

type GeofenceStatus = {
  isMonitoring: boolean;
  currentlyInside: boolean;
  lastEvent?: {
    eventType: "START" | "STOP";
    timestamp: string;
  };
};

type GeofenceEvent = {
  id: string;
  regionId: string;
  regionName: string;
  eventType: "START" | "STOP";
  timestamp: string;
  synced: boolean;
};

const GeofenceTest: React.FC = () => {
  const [region, setRegion] = useState<GeofenceRegion | null>(null);
  const [status, setStatus] = useState<GeofenceStatus>(GeofenceModule.getGeofenceStatus());
  const [events, setEvents] = useState<GeofenceEvent[]>(GeofenceModule.getGeofenceEvents());
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.9981,
    longitude: 21.4254,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // Real-time geofence state
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean>(false);
  const [realtimeInside, setRealtimeInside] = useState<boolean>(false);
  const [realtimeDistance, setRealtimeDistance] = useState<number | null>(null);
  const [realtimeEvents, setRealtimeEvents] = useState<Array<{
    type: "START" | "STOP";
    timestamp: string;
    distance?: number;
  }>>([]);
  const [gpsTrackingActive, setGpsTrackingActive] = useState<boolean>(false);
  const [adaptiveInterval, setAdaptiveInterval] = useState<number>(5000);
  
  // Working hours state
  const [workingHoursEnabled, setWorkingHoursEnabled] = useState<boolean>(true);
  const [isWithinWorkingHours, setIsWithinWorkingHours] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [timeUntilChange, setTimeUntilChange] = useState<{ minutes: number; willStart: boolean }>({ minutes: 0, willStart: false });

  // Multi-location state
  const [multipleRegions, setMultipleRegions] = useState<GeofenceRegion[]>([]);
  const [multiModeEnabled, setMultiModeEnabled] = useState<boolean>(false);
  const [activeRegions, setActiveRegions] = useState<GeofenceRegion[]>([]);
  const [regionDistances, setRegionDistances] = useState<Array<{ region: GeofenceRegion; distance: number; isInside: boolean }>>([]);

  // Listen to status changes (iOS native geofencing)
  useEffect(() => {
    const listener = GeofenceModule.addGeofenceStatusListener((newStatus) => {
      setStatus(newStatus);
      setEvents(GeofenceModule.getGeofenceEvents());
    });

    return () => listener.remove();
  }, []);

  // Listen to REAL-TIME geofence events
  useEffect(() => {
    const listener = addRealtimeGeofenceListener((event) => {
      console.log("🔔 REAL-TIME EVENT:", event);
      setRealtimeInside(event.type === "START");
      setRealtimeEvents((prev) => [
        { type: event.type, timestamp: event.timestamp },
        ...prev.slice(0, 19), // Keep last 20
      ]);
    });

    // Check initial state - if realtime geofence is already set
    const currentGeofence = getRealtimeGeofence();
    if (currentGeofence) {
      setRealtimeEnabled(true);
      setRegion(currentGeofence);
    }
    setRealtimeInside(isInsideRealtimeGeofence());
    setGpsTrackingActive(isTrackingLocation() === 1);

    return () => listener.remove();
  }, []);

  // Update distance and adaptive info periodically
  useEffect(() => {
    if (!realtimeEnabled || !region) return;

    const updateInfo = async () => {
      const dist = await getDistanceToGeofence();
      setRealtimeDistance(dist);
      
      // Get adaptive tracking info
      const adaptiveInfo = getAdaptiveTrackingInfo();
      setAdaptiveInterval(adaptiveInfo.currentInterval);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 2000);
    return () => clearInterval(interval);
  }, [realtimeEnabled, region]);

  // Update working hours status
  useEffect(() => {
    const updateWorkingHoursStatus = () => {
      const status = getWorkingHoursStatus();
      setWorkingHoursEnabled(status.config.enabled);
      setIsWithinWorkingHours(status.isWithinHours);
      setCurrentTime(status.currentTime);
      setTimeUntilChange(status.timeUntilChange);
    };

    updateWorkingHoursStatus();
    const interval = setInterval(updateWorkingHoursStatus, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Get current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
        if (permStatus !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.log("Error getting location:", error);
      }
    };
    getLocation();
  }, []);

  // Load existing region
  useEffect(() => {
    const currentRegion = GeofenceModule.getCurrentRegion();
    if (currentRegion) {
      setRegion(currentRegion);
      setMapRegion({
        latitude: currentRegion.latitude,
        longitude: currentRegion.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, []);

  // Auto-load multiple locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      const dummyRegions = GeofenceModule.fetchAllDummyRegions();
      setMultipleRegions(dummyRegions);
      await setMultipleGeofences(dummyRegions);
      setMultiModeEnabled(true);
      
      // Center map on first location
      if (dummyRegions.length > 0) {
        setMapRegion({
          latitude: dummyRegions[0].latitude,
          longitude: dummyRegions[0].longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }
      console.log(`📍 Auto-loaded ${dummyRegions.length} geofence locations`);
    };
    loadLocations();
  }, []);

  const handleLoadDummyRegion = async () => {
    setLoading(true);
    try {
      const dummyRegion = await GeofenceModule.fetchGeofenceRegion();
      await GeofenceModule.setGeofenceRegion(dummyRegion);
      setRegion(dummyRegion);
      setMapRegion({
        latitude: dummyRegion.latitude,
        longitude: dummyRegion.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      Alert.alert("✅ Успешно", `Регион поставен: ${dummyRegion.name}`);
    } catch (error) {
      Alert.alert("Грешка", "Не можев да го вчитам регионот");
    }
    setLoading(false);
  };

  const handleLoadTestRegion = async () => {
    setLoading(true);
    try {
      const testRegion = await GeofenceModule.fetchTestRegionAtCurrentLocation();
      if (testRegion) {
        await GeofenceModule.setGeofenceRegion(testRegion);
        setRegion(testRegion);
        setMapRegion({
          latitude: testRegion.latitude,
          longitude: testRegion.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        Alert.alert("✅ Успешно", `Тест регион на твоја локација (${testRegion.radius}м радиус)`);
      } else {
        Alert.alert("Грешка", "Дозволи пристап до локација");
      }
    } catch (error) {
      Alert.alert("Грешка", "Не можев да ја добијам локацијата");
    }
    setLoading(false);
  };

  const handleStartGeofencing = async () => {
    if (!region) {
      Alert.alert("Грешка", "Прво вчитај регион");
      return;
    }

    setLoading(true);
    const success = await GeofenceModule.startGeofencing();
    setLoading(false);

    if (success) {
      Alert.alert("✅ Активно", "Geofencing е стартуван!");
    } else {
      Alert.alert("Грешка", "Не можев да стартувам geofencing. Провери дозволи за локација.");
    }
  };

  const handleStopGeofencing = async () => {
    await GeofenceModule.stopGeofencing();
    Alert.alert("⏹️ Запрено", "Geofencing е запрен");
  };

  // REAL-TIME GEOFENCING HANDLERS
  const handleStartRealtimeGeofencing = async () => {
    if (!region) {
      Alert.alert("Грешка", "Прво вчитај регион");
      return;
    }

    if (isTrackingLocation() !== 1) {
      Alert.alert(
        "GPS Tracking Потребен",
        "За real-time geofencing, мора да е вклучен GPS tracking од Dashboard.",
        [{ text: "OK" }]
      );
      return;
    }

    await setRealtimeGeofence(region);
    setRealtimeEnabled(true);
    setRealtimeEvents([]);
    Alert.alert("⚡ REAL-TIME", "Real-time geofencing е активен!\nНема задоцнување - настаните се во реално време.");
  };

  const handleStopRealtimeGeofencing = async () => {
    await clearRealtimeGeofence();
    setRealtimeEnabled(false);
    setRealtimeDistance(null);
    Alert.alert("⏹️ Запрено", "Real-time geofencing е запрен");
  };

  const handleClearEvents = async () => {
    await GeofenceModule.clearGeofenceEvents();
    setEvents([]);
  };

  const handleSimulateStart = async () => {
    if (!region) {
      Alert.alert("Грешка", "Прво вчитај регион");
      return;
    }
    await GeofenceModule.simulateGeofenceEvent("START");
    setEvents(GeofenceModule.getGeofenceEvents());
    Alert.alert("🟢 Симулирано", "START настан е креиран");
  };

  const handleSimulateStop = async () => {
    if (!region) {
      Alert.alert("Грешка", "Прво вчитај регион");
      return;
    }
    await GeofenceModule.simulateGeofenceEvent("STOP");
    setEvents(GeofenceModule.getGeofenceEvents());
    Alert.alert("🔴 Симулирано", "STOP настан е креиран");
  };

  const handleRefreshEvents = async () => {
    const refreshedEvents = await GeofenceModule.refreshEvents();
    setEvents(refreshedEvents);
    Alert.alert("🔄 Освежено", `Вчитани ${refreshedEvents.length} настани`);
  };

  const handleToggleWorkingHours = async () => {
    if (workingHoursEnabled) {
      await disableWorkingHours();
      setWorkingHoursEnabled(false);
      Alert.alert("⏰ Работно време", "Исклучено - tracking ќе работи 24/7");
    } else {
      await enableWorkingHours();
      setWorkingHoursEnabled(true);
      Alert.alert("⏰ Работно време", "Вклучено - tracking од 07:30 до 20:30");
    }
  };

  // ============ MULTI-LOCATION HANDLERS ============
  const handleLoadMultipleRegions = async () => {
    setLoading(true);
    try {
      const dummyRegions = GeofenceModule.fetchAllDummyRegions();
      setMultipleRegions(dummyRegions);
      await setMultipleGeofences(dummyRegions);
      setMultiModeEnabled(true);
      console.log(`📍 Loaded ${dummyRegions.length} geofence locations for multi-mode`);
      // Update map to show all regions
      if (dummyRegions.length > 0) {
        setMapRegion({
          latitude: dummyRegions[0].latitude,
          longitude: dummyRegions[0].longitude,
          latitudeDelta: 0.15, // Zoom out to see all
          longitudeDelta: 0.15,
        });
      }
      
      Alert.alert(
        "✅ Повеќе локации",
        `Вчитани ${dummyRegions.length} локации:\n${dummyRegions.map(r => `• ${r.name}`).join('\n')}`
      );
    } catch (error) {
      Alert.alert("Грешка", "Не можев да ги вчитам локациите");
    }
    setLoading(false);
  };

  const handleClearMultipleRegions = async () => {
    await clearAllGeofences();
    setMultipleRegions([]);
    setMultiModeEnabled(false);
    setActiveRegions([]);
    setRegionDistances([]);
    Alert.alert("🗑️ Избришано", "Сите локации се избришани");
  };

  const handleRefreshDistances = async () => {
    const distances = await getDistancesToAllGeofences();
    setRegionDistances(distances);
    setActiveRegions(getActiveGeofences());
  };

  // Reset everything from storage
  const handleResetAll = async () => {
    Alert.alert(
      "⚠️ Ресетирај се",
      "Ова ќе го ресетира целосно geofencing статусот и ќе дозволи нов START повик. Дали си сигурен?",
      [
        { text: "Откажи", style: "cancel" },
        {
          text: "Ресетирај",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await resetGeofenceState();
              setRealtimeInside(false);
              setRealtimeDistance(null);
              setRealtimeEvents([]);
              Alert.alert("✅ Ресетирано", "Geofence статусот е ресетиран. Следниот location check ќе активира START ако си внатре.");
            } catch (error) {
              Alert.alert("Грешка", "Не можев да ресетирам");
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  // Update distances periodically when multi-mode is enabled
  useEffect(() => {
    if (!multiModeEnabled || multipleRegions.length === 0) return;
    
    handleRefreshDistances();
    const interval = setInterval(handleRefreshDistances, 3000);
    return () => clearInterval(interval);
  }, [multiModeEnabled, multipleRegions]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("mk-MK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => NavigationService.navigate("Dashboard")}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geofence Мониторинг</Text>
      </View>

      {/* Status Card - Simplified */}
      <View style={[styles.card, styles.realtimeCard]}>
        <View style={styles.statusRow}>
          <Text>Мониторинг:</Text>
          <Text style={realtimeEnabled ? styles.statusActive : styles.statusInactive}>
            {realtimeEnabled ? "✅ Активен" : "⏹️ Неактивен"}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text>Во регион:</Text>
          {/* Calculate inside/outside based on distance vs radius */}
          {(() => {
            const isInside = realtimeDistance !== null && region && realtimeDistance <= region.radius;
            return (
              <Text style={isInside ? styles.statusInside : styles.statusOutside}>
                {isInside ? "📍 Внатре" : "📍 Надвор"}
              </Text>
            );
          })()}
        </View>
        {realtimeDistance !== null && realtimeEnabled && (
          <View style={styles.statusRow}>
            <Text>Растојание:</Text>
            <Text style={styles.distanceText}>{realtimeDistance.toFixed(0)}м</Text>
          </View>
        )}
        {region && (
          <View style={styles.statusRow}>
            <Text>Радиус:</Text>
            <Text style={styles.distanceText}>{region.radius.toFixed(0)}м</Text>
          </View>
        )}
      </View>

      {/* Region Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Регион</Text>
        {region ? (
          <>
            <Text style={styles.regionName}>{region.name}</Text>
            <Text style={styles.regionCoords}>
              📍 {region.latitude.toFixed(6)}, {region.longitude.toFixed(6)}
            </Text>
            <Text style={styles.regionRadius}>📏 Радиус: {region.radius}м</Text>
          </>
        ) : multipleRegions.length > 0 ? (
          <>
            <Text style={styles.regionName}>{multipleRegions.length} локации</Text>
            {multipleRegions.map((r, idx) => (
              <Text key={r.id} style={styles.regionCoords}>
                • {r.name} ({r.radius}м)
              </Text>
            ))}
          </>
        ) : (
          <Text style={styles.noRegion}>Се вчитува...</Text>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider="google"
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Single region (legacy) */}
          {region && !multiModeEnabled && (
            <>
              <Circle
                center={{ latitude: region.latitude, longitude: region.longitude }}
                radius={region.radius}
                fillColor="rgba(66, 156, 252, 0.2)"
                strokeColor={Colors.blue_100}
                strokeWidth={2}
              />
              <Marker
                coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                title={region.name}
                description={`Радиус: ${region.radius}м`}
                pinColor={Colors.blue_200}
              />
            </>
          )}
          
          {/* Multiple regions */}
          {multiModeEnabled && multipleRegions.map((r, idx) => {
            const distInfo = regionDistances.find(d => d.region.id === r.id);
            const isInside = distInfo?.isInside || false;
            return (
              <React.Fragment key={r.id}>
                <Circle
                  center={{ latitude: r.latitude, longitude: r.longitude }}
                  radius={r.radius}
                  fillColor={isInside ? "rgba(76, 175, 80, 0.3)" : "rgba(66, 156, 252, 0.2)"}
                  strokeColor={isInside ? "#4CAF50" : Colors.blue_100}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                  title={r.name}
                  description={`Радиус: ${r.radius}м${distInfo ? ` | ${distInfo.distance.toFixed(0)}м` : ''}`}
                  pinColor={isInside ? "#4CAF50" : Colors.blue_200}
                />
              </React.Fragment>
            );
          })}
        </MapView>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray_80,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray_500,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray_500,
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray_500,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusActive: {
    color: Colors.success_100,
    fontWeight: "600",
  },
  statusInactive: {
    color: Colors.gray_400,
    fontWeight: "600",
  },
  statusInside: {
    color: Colors.success_100,
    fontWeight: "600",
  },
  statusOutside: {
    color: Colors.warning_100,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: Colors.error_100,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  regionName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray_500,
    marginBottom: 4,
  },
  regionCoords: {
    fontSize: 14,
    color: Colors.gray_400,
    marginBottom: 2,
  },
  regionRadius: {
    fontSize: 14,
    color: Colors.gray_400,
  },
  noRegion: {
    color: Colors.gray_400,
    fontStyle: "italic",
  },
  mapContainer: {
    flex: 1,
    minHeight: 400,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: Colors.success_100,
  },
  buttonSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray_200,
  },
  buttonDanger: {
    backgroundColor: Colors.error_100,
  },
  buttonTextPrimary: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: Colors.gray_500,
    fontSize: 16,
    fontWeight: "500",
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clearButton: {
    color: Colors.error_100,
    fontSize: 14,
  },
  noEvents: {
    color: Colors.gray_400,
    fontStyle: "italic",
    textAlign: "center",
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray_100,
  },
  eventIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray_500,
  },
  eventTime: {
    fontSize: 12,
    color: Colors.gray_400,
  },
  syncedBadge: {
    color: Colors.success_100,
    fontSize: 16,
  },
  pendingBadge: {
    color: Colors.warning_100,
    fontSize: 16,
  },
  simulationContainer: {
    backgroundColor: Colors.warning_100,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.warning_100,
    borderStyle: "dashed",
  },
  simulationTitle: {
    fontSize: 12,
    color: Colors.warning_200,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  simulationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  simButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  simButtonStart: {
    backgroundColor: Colors.success_100,
  },
  simButtonStop: {
    backgroundColor: Colors.error_100,
  },
  simButtonRefresh: {
    backgroundColor: Colors.blue_100,
  },
  simButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  // Real-time geofencing styles
  realtimeCard: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: Colors.success_100,
  },
  realtimeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.success_100,
    marginBottom: 4,
  },
  realtimeSubtitle: {
    fontSize: 12,
    color: Colors.gray_400,
    marginBottom: 12,
  },
  buttonRealtime: {
    backgroundColor: "#4CAF50",
    marginTop: 12,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.blue_100,
  },
  realtimeEventsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.success_100,
  },
  realtimeEventsTitle: {
    fontSize: 12,
    color: Colors.gray_400,
    marginBottom: 8,
  },
  realtimeEventItem: {
    fontSize: 14,
    color: Colors.gray_500,
    marginBottom: 4,
  },
  // Adaptive tracking styles
  adaptiveContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.blue_100,
  },
  adaptiveTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.blue_100,
    marginBottom: 4,
  },
  adaptiveText: {
    fontSize: 14,
    color: Colors.gray_500,
  },
  adaptiveValue: {
    fontWeight: "700",
    color: Colors.blue_100,
    fontSize: 16,
  },
  adaptiveHint: {
    fontSize: 11,
    color: Colors.gray_400,
    marginTop: 4,
    fontStyle: "italic",
  },
  // Working hours styles
  workingHoursCard: {
    backgroundColor: "#FFF3E0",
    borderWidth: 2,
    borderColor: Colors.warning_100,
  },
  workingHoursTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.warning_200,
    marginBottom: 4,
  },
  workingHoursSubtitle: {
    fontSize: 14,
    color: Colors.gray_400,
    marginBottom: 12,
    fontWeight: "600",
  },
  currentTimeText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gray_500,
  },
  statusWarning: {
    color: Colors.warning_200,
    fontWeight: "600",
  },
  workingHoursInfo: {
    backgroundColor: "#FFECB3",
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  workingHoursInfoText: {
    fontSize: 13,
    color: Colors.warning_200,
    textAlign: "center",
  },
  buttonWarning: {
    backgroundColor: Colors.warning_100,
    marginTop: 12,
  },
  // Multi-location styles
  multiLocationCard: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: Colors.blue_100,
  },
  multiLocationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.blue_200,
    marginBottom: 4,
  },
  multiLocationSubtitle: {
    fontSize: 14,
    color: Colors.gray_400,
    marginBottom: 12,
  },
  multiButtonsRow: {
    marginTop: 12,
  },
  buttonMulti: {
    backgroundColor: Colors.blue_100,
  },
  distancesList: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  distancesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray_500,
    marginBottom: 8,
  },
  distanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray_100,
  },
  distanceLocationName: {
    fontSize: 14,
    color: Colors.gray_500,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray_400,
  },
  distanceInside: {
    color: Colors.success_100,
    fontWeight: "700",
  },
  spacer: {
    height: 40,
  },
});

export default GeofenceTest;
