import React, { useEffect, useRef, useState } from "react";
import { View, SafeAreaView, Platform, AppState, Linking } from "react-native";
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch, connect } from "react-redux";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import { IntlProvider } from "react-intl";


import { languageObject } from "../translations";
import { notificationsCount } from "../redux/actions/Notifications/notifications.actions";
import { UnreadMessageService } from "../services/Chat/unreadMessageService";
import { updateUnreadCount } from "../redux/actions/Chat/Chat.actions";
import { getMe } from "../redux/actions/UsersTeams/user.actions";
import { handleNotificationResponse } from "../utils/notificationHandlers";
import { CHAT_ENABLED } from "../utils/firebase";
import { handleBackgroundNotification, initializeBackgroundNotifications, registerNotificationTask } from "../utils/backgroundNotificationHandler";
import { startLocationUpdates, isTrackingLocation, setRealtimeGeofence, setMultipleGeofences, setGlobalProjectId, checkAndRestartTracking, startGpsStatusMonitoring, stopGpsStatusMonitoring, syncGeofenceStateFromAPI, syncGeofenceStoppedFromAPI } from "../utils/locationModule";
import { startBackgroundLocation, stopBackgroundLocation, seedHeartbeatTimer } from "../services/appStatusService";
import GeofenceModule from "../utils/geofenceModule";
import * as SharedTrackingState from "../utils/sharedTrackingState";

import Header from "./Header/Header";
import HeaderLogin from "./Header/HeaderLogin";
import ChatHeader from "./Header/ChatHeader";
import NotAuthorized from "./NotAuthorized";
import Sidebar from "./Header/Sidebar";
import { styles } from "../asset/style/components/AppContainer.styles";
import ChatIcon from "./ChatIcon";
import UpdateNotification from "./UpdateNotification";
import http from "../services/http";




const AppContainerClean = ({
  children,
  location,
  language,
  pagination,
  notAuthorized,
  onAddChat,
  onAddGroupChat,
  onAddImage,
}) => {
  const dispatch = useDispatch();
  const notificationsCountState = useSelector(
    (state) => state.notificationsCount.count
  );
  const rootId = useSelector((state) => state.userDataRole.rootId);
  const userId = useSelector((state) => state.userData.id);
  const authState = useSelector((state) => state.auth.loggedIn);
  const scrollRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const getMeIntervalRef = useRef(null);
  const geofenceInitializedRef = useRef(false);
  const lastRootIdRef = useRef(null);
  
  // ✅ Scroll reset when pagination changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [pagination]);
  
  // ✅ Android: Request battery optimization exemption for background location tracking
  // Note: Heartbeat now uses FCM ping-pong (no battery exemption needed for that)
  // This is still useful for geofence detection when app is backgrounded
  useEffect(() => {
    if (Platform.OS !== 'android' || !userId) return;
    
    const BATTERY_OPT_KEY = '@texxano:battery_opt_v3'; // v3 - enhanced with verification
    
    const promptBatteryOptimization = async () => {
      try {
        const prompted = await AsyncStorage.getItem(BATTERY_OPT_KEY);
        
        if (!prompted) {
          await AsyncStorage.setItem(BATTERY_OPT_KEY, Date.now().toString());
          
          setTimeout(() => {
            IntentLauncher.startActivityAsync(
              'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
              { data: 'package:texxano.v1.android' }
            ).catch((err) => {
              IntentLauncher.startActivityAsync(
                'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
              ).catch(() => {});
            });
          }, 3000);
        } else {
          const promptTime = parseInt(prompted, 10);
          const daysSincePrompt = (Date.now() - promptTime) / (1000 * 60 * 60 * 24);
          
          if (daysSincePrompt > 7) {
            await AsyncStorage.setItem(BATTERY_OPT_KEY, Date.now().toString());
            IntentLauncher.startActivityAsync(
              'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
            ).catch(() => {});
          }
        }
      } catch (err) {
        console.log('❌ Battery optimization prompt error:', err);
      }
    };
    
    promptBatteryOptimization();
  }, [userId]);

  // ✅ Set global projectId and Auto-start Geofencing when rootId is available
  // Combined: Wait for rootId BEFORE initializing geofencing to prevent "Project.Not.Existing" error
  useEffect(() => {
    if (!rootId) {
      return;
    }

    // Prevent duplicate initialization
    if (geofenceInitializedRef.current && lastRootIdRef.current === rootId) {
      return;
    }
    
    // Mark as initializing IMMEDIATELY to prevent duplicate calls
    geofenceInitializedRef.current = true;
    lastRootIdRef.current = rootId;
    
    // First, set the global projectId
    setGlobalProjectId(rootId);
    // NOTE: GeofenceModule.setGlobalProjectId removed - locationModule handles everything

    // Then initialize geofencing
    const initializeGeofencing = async () => {
      try {
        // Initialize shared tracking state
        await SharedTrackingState.initializeTrackingState();
        
        // CLEANUP: Stop any previously registered OS-level geofencing from geofenceModule
        // This prevents duplicate START API calls from the old geofencing system
        await GeofenceModule.stopGeofencing();
        
        // Start GPS tracking if not already started
        if (isTrackingLocation() !== 1) {
          await startLocationUpdates();
        }

        // Start GPS status monitoring
        startGpsStatusMonitoring();

        // Fetch geofence locations from API
        const regions = await GeofenceModule.fetchAllGeofenceRegions();
        
        if (regions.length > 0) {
          await setMultipleGeofences(regions);
          
          const firstRegion = regions[0];
          // NOTE: GeofenceModule.setGeofenceRegion REMOVED - it was causing duplicate tracks!
          // Both geofenceModule and locationModule had separate background tasks calling START API.
          // locationModule handles all geofencing now via distance-based checking.
          await setRealtimeGeofence(firstRegion);
        } else {
          console.log("⚠️ No geofence locations found from API");
        }
      } catch (error) {
        console.log("❌ Error initializing geofencing:", error?.message || error);
      }
    };

    initializeGeofencing();

    // Cleanup: stop GPS status monitoring when rootId changes or component unmounts
    return () => {
      stopGpsStatusMonitoring();
    };
  }, [rootId]);

  // ✅ Sync tracking state from API on app start
  // Note: Heartbeat is now handled by FCM ping-pong (server sends ping, app responds)
  useEffect(() => {
    if (!userId || !rootId) return;
    
    const getTracks = async () => {
      try {
        // Get today's date range (from start of day to end of day)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        
        // Format dates as ISO strings
        const fromDate = startOfDay.toISOString();
        const toDate = endOfDay.toISOString();
        
        // Fetch time tracks for today only
        const response = await http.get(`/timetracker/tracks/user/${userId}?from=${fromDate}&to=${toDate}`);
        
        // Check if user has an active tracking session (stop === null)
        if (response?.list && response.list.length > 0) {
          const activeTrack = response.list.find(track => track.stop === null);
          
          if (activeTrack) {
            // User has started tracking - sync memory state from API (no AsyncStorage)
            SharedTrackingState.syncFromAPI(
              activeTrack.id,
              activeTrack.start,
              activeTrack.companyLocationId || null
            );
            // Also sync geofence state in locationModule (mark location as "inside")
            syncGeofenceStateFromAPI(
              activeTrack.id,
              activeTrack.start,
              activeTrack.companyLocationId || null
            );
          } else {
            SharedTrackingState.syncStoppedFromAPI();
            syncGeofenceStoppedFromAPI();
          }
        } else {
          SharedTrackingState.syncStoppedFromAPI();
          syncGeofenceStoppedFromAPI();
        }
      } catch (error) {
        console.log('❌ Error fetching time tracks:', error?.message || error);
      }
    };
    getTracks();
  }, [userId, rootId]);

  // ✅ PROACTIVE HEARTBEAT - Send every 30 seconds while tracking is active
  // This tells the backend the app is alive. If no heartbeat for 1+ minute,
  // the backend will send a notification and/or auto-stop the time tracking.
  //
  // STRATEGY: Start background task immediately when tracking begins (while in foreground).
  // Android requires foreground services to start while app is foreground, then they continue
  // running when app goes to background. This gives us continuous heartbeat coverage.
  const backgroundTaskRunningRef = useRef(false);
  
  useEffect(() => {
    if (!userId) return;
    
    // Start background heartbeat task
    // This must be called while app is in foreground, then continues in background
    const startBackgroundHeartbeat = async () => {
      if (backgroundTaskRunningRef.current) {
        console.log('💓 Background heartbeat already running');
        return;
      }
      
      try {
        // ⏱️ Seed timer for T+elapsed logs
        seedHeartbeatTimer();
        const success = await startBackgroundLocation();
        if (success) {
          backgroundTaskRunningRef.current = true;
          console.log('💓 Background heartbeat task started successfully');
        }
      } catch (error) {
        console.log('❌ Failed to start background heartbeat:', error?.message || error);
      }
    };
    
    const stopBackgroundHeartbeat = async () => {
      if (!backgroundTaskRunningRef.current) return;
      
      try {
        await stopBackgroundLocation();
        backgroundTaskRunningRef.current = false;
        console.log('💓 Background heartbeat task stopped');
      } catch (error) {
        console.log('❌ Failed to stop background heartbeat:', error?.message || error);
      }
    };
    
    // Start heartbeat immediately if user is already tracking
    if (SharedTrackingState.isWorkActuallyStarted()) {
      startBackgroundHeartbeat();
    }
    
    // Monitor tracking state changes
    const trackingCheckInterval = setInterval(async () => {
      const isTracking = SharedTrackingState.isWorkActuallyStarted();
      const backgroundRunning = backgroundTaskRunningRef.current;
      
      if (isTracking && !backgroundRunning) {
        // Tracking started - start background task
        await startBackgroundHeartbeat();
      } else if (!isTracking && backgroundRunning) {
        // Tracking stopped - stop background task
        await stopBackgroundHeartbeat();
      }
    }, 3000); // Check every 3 seconds
    
    // Cleanup
    return () => {
      clearInterval(trackingCheckInterval);
      if (backgroundTaskRunningRef.current) {
        // CRITICAL: reset the ref BEFORE stopping so the new effect mount doesn't
        // see stale true and skip restarting the heartbeat (userId change scenario).
        backgroundTaskRunningRef.current = false;
        stopBackgroundLocation().catch(err => 
          console.log('⚠️ Error in background cleanup:', err?.message)
        );
      }
    };
  }, [userId]);

  // ✅ Fetch user data (getMe) regularly - only when user is logged in
  useEffect(() => {
  

    // Initial call
    dispatch(getMe());

    // Set up periodic refresh every 5 minutes
    getMeIntervalRef.current = setInterval(() => {
      dispatch(getMe());
    }, 5 * 60 * 1000); // 5 minutes

    // Also refresh when app comes to foreground
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'active') {
        dispatch(getMe());
        
        // ⭐ Check and restart GPS tracking if it stopped
        // This ensures tracking resumes after app returns from background
        try {
          await checkAndRestartTracking();
        } catch (e) {
          // silent
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (getMeIntervalRef.current) {
        clearInterval(getMeIntervalRef.current);
      }
      subscription?.remove();
    };
  }, [userId, rootId]);

  // ✅ Foreground: increment count only (no sound)
  const notificationListener = useRef();
  const responseListener = useRef();

  // Set up Android notification channel on app start
  useEffect(() => {
    const setupNotificationChannel = async () => {
      if (Platform.OS === 'android') {
        try {
          // Request notification permissions first
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            return;
          }

          // Register background notification task NOW — after permissions confirmed.
          // registerNotificationTask() is also called at module load and on mount,
          // but on a fresh install permissions aren't granted yet at those points,
          // which causes a silent failure leaving the task unregistered.
          // Calling it here guarantees registration completes at least once per granted session.
          const registered = await registerNotificationTask();
          console.log(`[NOTIF SETUP] Background notification task registered: ${registered}`);

          // Create notification channel
          await Notifications.setNotificationChannelAsync('chat-messages', {
            name: 'Chat Messages',
            description: 'Notifications for chat messages',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'notification.mp3', // Use custom notification sound
            enableVibrate: true,
            enableLights: true,
            showBadge: true,
          });
        } catch (error) {
          // Silent error handling
        }
      }
    };

    setupNotificationChannel();
  }, []);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        const { data } = notification.request.content;

        // Skip silent/system notifications (heartbeat ping-pong)
        if (data?.type === 'heartbeat_ping') {
          return; // Already handled by setNotificationHandler
        }

        // Only handle chat notifications - check type explicitly
        const isChatNotification = data?.type === "chat_message";

        if (isChatNotification && CHAT_ENABLED) {
          dispatch(notificationsCount(prev => prev + 1));
          
          // Update unread count for the specific chat when notification is received
          if (rootId && userId && data?.chatId) {
            try {
              const unreadCount = await UnreadMessageService.getUnreadCountForChat(rootId, data.chatId, userId);
              dispatch(updateUnreadCount(data.chatId, unreadCount));
            } catch (error) {
              // Silent error handling
            }
          }
        } else {
          // For non-chat notifications, increment notification count
          // These notifications are handled by the response listener for navigation
          dispatch(notificationsCount(prev => prev + 1));
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        await handleNotificationResponse(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []); // Empty dependency array - listeners should be set up once and stay active

  // ✅ Background notification handler → Executes when app is in background/killed
  // Called once on mount via useEffect (NOT in render body — would re-run on every render).
  // Initializes:
  // 1. _notificationHandlerRegistered = true (signals BG task that React is alive)
  // 2. setNotificationHandler for foreground/background ping-pong
  useEffect(() => {
    initializeBackgroundNotifications();
  }, []);

  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <IntlProvider
      locale={language.locale}
      messages={languageObject[language.locale]}
      defaultLocale="en"
    >
      <View style={styles.parentConteinerApp(insets, location)}>
        {location === "Login" ? (
          <HeaderLogin />
        ) : location === "ChatRoomList" ? (
          <ChatHeader
            location={location}
            toggleDrawer={toggleDrawer}
            onAddChat={onAddChat}
            onAddGroupChat={onAddGroupChat}
            onAddImage={onAddImage}
          />
        ) : (
          <Header location={location} toggleDrawer={toggleDrawer} />
        )}

        {location === "Login" ? (
          <View style={styles.childrenViewLogin}>{children}</View>
        ) : (
          <View style={{ flex: 1 }}>
            <Sidebar isOpen={isOpen} toggleDrawer={toggleDrawer} location={location} />
            {!notAuthorized ? (
              <SafeAreaView style={{ flex: 1, paddingHorizontal: 7 }}>
                {children}
              </SafeAreaView>
            ) : (
              <NotAuthorized />
            )}
            {/* <ChatIcon location={location} /> */}
          </View>
        )}
        
        {/* Update notification banner - shows when OTA update is available */}
        {location !== "Login" && <UpdateNotification />}
      </View>
    </IntlProvider>
  );
};

const mapStateToProps = (state) => ({
  language: state.translation,
});

export default connect(mapStateToProps)(AppContainerClean);
