import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform, AppState } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAutoStopThresholdMs } from '../services/appStatusService';
import { store } from '../redux/store/store';
import { isInsideAnyGeofence } from './locationModule';
import { timeTracksServices } from '../services/TimeTracks/timeTracks.services';
import * as SharedTrackingState from './sharedTrackingState';
import http from '../services/http';

// Exported so index.js can import this module at root level (prevents Metro tree-shaking
// and guarantees TaskManager.defineTask runs before React component tree mounts).
// This is critical for killed-state FCM wakeup: without this, the task callback is never
// defined when Android fires a background notification task with the app terminated.
export const NOTIFICATION_HANDLER_MODULE_LOADED = true;

// Deduplication: track the last ping timestamp we responded to
// Prevents double-pong when both TaskManager and setNotificationHandler fire
let _lastProcessedPingTimestamp = null;

// Set to true ONLY when initializeBackgroundNotifications() is called (app fully mounted).
// In a killed-state FCM wakeup, the JS runtime is fresh and this stays false,
// which is how the BG task knows it must process pings itself rather than deferring
// to setNotificationHandler (which is not registered in the killed-state runtime).
let _notificationHandlerRegistered = false;

// Background notification task name
const BACKGROUND_NOTIFICATION_TASK = 'TEXXANO-BACKGROUND-NOTIFICATION-TASK';

// Persistent log storage for killed-state debugging
const PING_PONG_LOG_KEY = '@texxano_ping_pong_log';
const MAX_LOG_ENTRIES = 50;

const persistPingPongLog = async (message, data = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
      appState: 'killed', // Assume killed if we're writing to persistence
    };
    
    // Get existing logs
    const existingLogs = await AsyncStorage.getItem(PING_PONG_LOG_KEY);
    let logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Add new log and limit to MAX_LOG_ENTRIES
    logs.push(logEntry);
    if (logs.length > MAX_LOG_ENTRIES) {
      logs = logs.slice(-MAX_LOG_ENTRIES);
    }
    
    await AsyncStorage.setItem(PING_PONG_LOG_KEY, JSON.stringify(logs));
    console.log(`[${timestamp}] ${message}`, Object.keys(data).length ? data : ''); // Also log to console for dev mode
  } catch (error) {
    console.log('Failed to persist ping-pong log:', error);
  }
};

const sendHeartbeatPong = async (trackId, pingTimestamp) => {
  try {
    const pingAt = new Date().toISOString();
    await persistPingPongLog('💓 PING RECEIVED', { trackId, pingTimestamp, receivedAt: pingAt });
    
    // Check if token is available (Redux might not be hydrated in killed state)
    const state = store.getState();
    const hasToken = !!state?.userToken?.token;
    const tokenExpiration = state?.userToken?.tokenExpiration;
    const isExpired = tokenExpiration && new Date(tokenExpiration * 1000) < new Date();
    
    if (!hasToken) {
      await persistPingPongLog('❌ PONG BLOCKED - No token available', {
        reduxState: Object.keys(state || {}),
      });
      return;
    }
    
    if (isExpired) {
      await persistPingPongLog('⚠️ PONG WARNING - Token expired', { tokenExpiration });
    }
    
    // ⚡ FAST PATH: Build minimal payload and send HTTP IMMEDIATELY.
    // Pong grace window is only 10 seconds — do NOT wait for GPS or geofence checks first.
    // Location is enriched asynchronously after the pong is already sent.
    const payload = {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      source: 'fcm_pong',
      isInsideGeofence: null, // Will be enriched below (async, best-effort)
    };
    
    // Kick off location lookup in parallel — we don't await it before sending
    const locationPromise = (async () => {
      try {
        const location = await Location.getLastKnownPositionAsync();
        if (location?.coords) {
          return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            isInside: await isInsideAnyGeofence(),
          };
        }
      } catch (e) { /* silent */ }
      return null;
    })();

    // Race: send pong immediately, but if location resolves within 3s include it
    // 3s is safe budget: leaves 7s margin in the 10s grace window
    const locationResult = await Promise.race([
      locationPromise,
      new Promise(resolve => setTimeout(() => resolve(null), 3000)),
    ]);

    if (locationResult) {
      payload.latitude = locationResult.latitude;
      payload.longitude = locationResult.longitude;
      payload.isInsideGeofence = locationResult.isInside;
    }
    
    // Call the heartbeat endpoint
    // http.post returns parsed JSON body, NOT the Response object — no .status property
    const responseData = await http.post('/users/heartbeat', payload);
    
    const userId = store.getState()?.userDataRole?.userId || 'unknown';
    const pongAt = new Date().toISOString();
    const elapsed = Math.round((new Date(pongAt) - new Date(pingAt)) / 1000);
    await persistPingPongLog('✅ PONG SENT', { 
      trackId, 
      userId,
      isInsideGeofence: payload.isInsideGeofence,
      payloadSent: payload,
      responseData,
      hasLocation: !!payload.latitude,
      pongAt,
      elapsedSec: elapsed,
    });
  } catch (error) {
    await persistPingPongLog('❌ PONG FAILED', { 
      trackId,
      error: error?.message || String(error),
    });
    // Don't throw - backend will timeout and make decision based on no response
  }
};

let notificationTaskDefined = false;

try {
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    const appIsAlive = _notificationHandlerRegistered;
    const appCurrentState = AppState.currentState; // kept for logging only
    
    await persistPingPongLog('🔔 [BG TASK] Task triggered', { hasError: !!error, appCurrentState, appIsAlive, notifHandlerRegistered: _notificationHandlerRegistered });
    
    if (error) {
      await persistPingPongLog('❌ [BG TASK] Task error', { error: error?.message || String(error) });
      return;
    }
    
    try {
      await persistPingPongLog('🔍 [BG TASK] Raw data received', { 
        dataKeys: Object.keys(data || {}),
        hasNotification: !!data?.notification,
        hasData: !!data?.data,
        dataType: typeof data?.data,
      });
      
      // Extract notification data - try multiple paths
      let pushData = null;
      let extractionPath = null;
      
      // Path 1a: data.data.body (Expo dev tool sends the whole request as stringified JSON)
      if (data?.data?.body && typeof data.data.body === 'string') {
        try {
          const parsedBody = JSON.parse(data.data.body);
          // Check if payload is nested in .data or is the parsed body directly
          if (parsedBody.data && parsedBody.data.type) {
            pushData = parsedBody.data;
            extractionPath = 'data.data.body.data (parsed string)';
          } else if (parsedBody.type) {
            pushData = parsedBody;
            extractionPath = 'data.data.body (parsed string, direct)';
          }
        } catch (e) { /* ignore */ }
      }
      // Path 1b: data.data.body already an object (FCM sends body as object, not string)
      if (!pushData && data?.data?.body && typeof data.data.body === 'object') {
        // Check if the payload is inside body.data or directly in body
        if (data.data.body.data && data.data.body.data.type) {
          pushData = data.data.body.data;
          extractionPath = 'data.data.body.data (object)';
        } else if (data.data.body.type) {
          pushData = data.data.body;
          extractionPath = 'data.data.body (object)';
        }
      }
      // Path 1c: data.body direct (when data doesn't have nested .data)
      if (!pushData && data?.body && typeof data.body === 'string') {
        try {
          const parsedBody = JSON.parse(data.body);
          pushData = parsedBody.data || parsedBody;
          extractionPath = 'data.body (parsed string)';
        } catch (e) { /* ignore */ }
      }
      // Path 1d: data.body already an object
      if (!pushData && data?.body && typeof data.body === 'object') {
        if (data.body.data && data.body.data.type) {
          pushData = data.body.data;
          extractionPath = 'data.body.data (object)';
        } else if (data.body.type) {
          pushData = data.body;
          extractionPath = 'data.body (object)';
        }
      }
      // Path 2: data.data (direct data object)
      if (!pushData && data?.data && typeof data.data === 'object' && data.data.type) {
        pushData = data.data;
        extractionPath = 'data.data (direct)';
      }
      // Path 3: Direct data object (some FCM implementations)
      if (!pushData && data && typeof data === 'object' && data.type) {
        pushData = data;
        extractionPath = 'data (root, direct)';
      }
      // Path 4: data.notification.data
      if (!pushData && data?.notification?.data) {
        pushData = data.notification.data;
        extractionPath = 'data.notification.data';
      }
      // Path 5: data.notification.request.content.data
      if (!pushData && data?.notification?.request?.content?.data) {
        pushData = data.notification.request.content.data;
        extractionPath = 'data.notification.request.content.data';
      }
      
      if (!pushData) {
        await persistPingPongLog('❌ [BG TASK] NO DATA EXTRACTED', { 
          triedPaths: [
            'data.data.body (string)',
            'data.data.body (object)',
            'data.body (string)',
            'data.body (object)',
            'data.data',
            'data (root)',
            'data.notification.data',
            'data.notification.request.content.data'
          ],
          dataStructure: {
            hasData: !!data?.data,
            dataKeys: data?.data ? Object.keys(data.data) : [],
            rootKeys: data ? Object.keys(data) : [],
            bodyType: typeof data?.data?.body,
            rootBodyType: typeof data?.body,
            hasNotification: !!data?.notification,
            notificationKeys: data?.notification ? Object.keys(data.notification) : [],
          }
        });
      }
      
      await persistPingPongLog('📦 [BG TASK] Notification data', { 
        type: pushData?.type,
        hasData: !!pushData,
        dataKeys: pushData ? Object.keys(pushData) : [],
        extractionPath,
      });
      
      if (pushData?.type === 'heartbeat_ping') {
        // ALWAYS handle ping in the BG task — data-only FCM messages never reach
        // setNotificationHandler when the app is backgrounded (screen off / home pressed).
        // setNotificationHandler only fires in the foreground. The deduplication guard
        // below prevents a double-pong on the rare case both paths fire simultaneously
        // (pure foreground: BG task fires first, then setNotificationHandler skips via dedup).
        const pingKey = pushData.timestamp || pushData.trackId;
        if (pingKey && pingKey === _lastProcessedPingTimestamp) {
          await persistPingPongLog('⏭️ [BG TASK] Skipped duplicate', { trackId: pushData.trackId, pingKey });
        } else {
          _lastProcessedPingTimestamp = pingKey;
          const stateLabel = appIsAlive ? 'background-alive' : 'killed';
          await persistPingPongLog(`💓 [BG TASK] PING received (${stateLabel}) — sending pong`, { trackId: pushData.trackId });
          await sendHeartbeatPong(pushData.trackId, pushData.timestamp);
        }
        // Dismiss notification if it was shown (shouldn't be for data-only push)
        try {
          await Notifications.dismissAllNotificationsAsync();
        } catch (dismissError) {
          // Ignore
        }
      } else if (pushData?.type === 'auto_stop') {
        const userId = store.getState()?.userDataRole?.userId || 'unknown';
        const trackId = pushData.trackId || 'unknown';
        // Unified backend path: effectiveLastActive < AutoStopThresholdSeconds → heartbeat_timeout
        await persistPingPongLog('🛑 AUTO-STOP received (TaskManager)', { userId, trackId, reason: pushData.reason });
        // Hard rule: ignore auto-stop if track is younger than AutoStopThresholdSeconds
        // (guards against backend race where stop fires before first heartbeat is recorded)
        const autoStopMs = getAutoStopThresholdMs();
        const trackState = SharedTrackingState.getTrackingState?.() || {};
        const trackAgeMs = trackState.startedAt ? Date.now() - new Date(trackState.startedAt).getTime() : null;
        if (trackAgeMs !== null && trackAgeMs < autoStopMs) {
          await persistPingPongLog('✅ HARD RULE: Track too young - skipping', { trackId, trackAgeMs, autoStopMs });
        } else {
          // Update local tracking state
          await SharedTrackingState.markWorkStopped();
          store.dispatch({ type: 'STOP_TIME_TRACKING' });
        }
      }
    } catch (taskError) {
      await persistPingPongLog('❌ [BG TASK] Processing error', { error: taskError?.message || String(taskError) });
    }
  });
  
  notificationTaskDefined = true;
} catch (defineError) {
  if (defineError?.message?.includes('already been defined')) {
    notificationTaskDefined = true;
  } else {
    console.error('❌ [NOTIF INIT] Failed to define task:', defineError?.message || defineError);
    notificationTaskDefined = false;
  }
}

// Register the task with Expo Notifications
// This tells Expo to execute our task when notifications arrive
const registerNotificationTask = async () => {
  try {
    if (!notificationTaskDefined) {
      return false;
    }
    
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    if (isRegistered) {
      return true;
    }
    
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    return true;
  } catch (error) {
    return false;
  }
};

// Auto-register on module load (will execute once when file is imported)
registerNotificationTask();

// Export for manual registration if needed
export { registerNotificationTask };

/**
 * Background Notification Handler
 * 
 * Executes when notification arrives while app is in background or killed.
 * 
 * Platform Support:
 * - Android: ✅ Reliable - works even when app is killed
 * - iOS: ⚠️ Limited - only with "content-available: 1" and unreliable
 */

export const handleBackgroundNotification = async (notification) => {
  try {
    await persistPingPongLog('🔔 [NOTIF HANDLER] Notification received', {
      title: notification.request.content?.title,
      body: notification.request.content?.body,
      dataKeys: notification.request.content?.data ? Object.keys(notification.request.content.data) : [],
      dataType: notification.request.content?.data?.type,
      appState: AppState.currentState,
    });
    
    const { data: rawData, title, body, dataString } = notification.request.content;
    
    // Parse data - it might come in multiple formats:
    // 1. As rawData object (direct)
    // 2. As dataString (JSON string at root level)
    // 3. As rawData.body (JSON string nested inside data.body)
    let data = rawData;
    
    // Try parsing dataString first (root level)
    if (!data?.type && dataString) {
      try {
        data = JSON.parse(dataString);
      } catch (parseError) { /* ignore */ }
    }
    
    // Try parsing data.body if it's a string (nested format from Expo)
    if (!data?.type && data?.body && typeof data.body === 'string') {
      try {
        data = JSON.parse(data.body);
      } catch (parseError) { /* ignore */ }
    }
    
    switch (data?.type) {
      case 'heartbeat_ping': {
        // FCM Ping-Pong: Server pings us, we respond with heartbeat
        // FIX: Deduplication guard — skip if TaskManager already responded to this ping
        const pingKey = data?.timestamp || data?.trackId;
        if (pingKey && pingKey === _lastProcessedPingTimestamp) {
          // already handled
        } else {
          _lastProcessedPingTimestamp = pingKey;
          await sendHeartbeatPong(data?.trackId, data?.timestamp);
        }
        // Dismiss notification immediately if it was shown (Android)
        try {
          await Notifications.dismissAllNotificationsAsync();
        } catch (err) {
          // Silent fail - notification wasn't shown or already dismissed
        }
        
        // Don't show notification for ping
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      }
        
      case 'heartbeat_inactive':
      case 'app_inactive':
        try {
          if (SharedTrackingState.isInStopCooldown()) {
            break;
          }
          
          // Check if user is inside any geofence
          const isInside = await isInsideAnyGeofence();
          
          if (isInside) {
            // user inside — no action
          } else {
            try {
              await timeTracksServices.stopTimeTrack();
              await SharedTrackingState.markWorkStopped();
            } catch (stopError) { /* ignore */ }
          }
        } catch (error) { /* ignore */ }
        break;

      case 'auto_stop': {
        // Unified backend path: effectiveLastActive < AutoStopThresholdSeconds → heartbeat_timeout
        // Pong → RecordHeartbeatAsync refreshes effectiveLastActive, so answered pings prevent this.
        // This fires when both heartbeat AND pong went silent for AutoStopThresholdSeconds.
        const autoStopUserId = store.getState()?.userDataRole?.userId || 'unknown';
        const autoStopTrackId = data?.trackId || 'unknown';
        await persistPingPongLog('🛑 AUTO-STOP received (setNotificationHandler)', {
          userId: autoStopUserId,
          trackId: autoStopTrackId,
          reason: data?.reason,
          appState: AppState.currentState,
        });
        try {
          await SharedTrackingState.markWorkStopped();
          const autoStopState = store.getState();
          if (autoStopState.isTimeTracks?.isTracking) {
            store.dispatch({ type: 'STOP_TIME_TRACKING' });
          }
          await persistPingPongLog('✅ AUTO-STOP state cleared', { userId: autoStopUserId, trackId: autoStopTrackId });
        } catch (error) {
          await persistPingPongLog('❌ AUTO-STOP state clear failed', { error: error?.message || String(error) });
        }
        break;
      }

      default:
        await persistPingPongLog('📬 [NOTIF HANDLER] Unhandled notification type', {
          type: data?.type,
          title,
          body,
          dataKeys: data ? Object.keys(data) : [],
          appState: AppState.currentState,
        });
    }

    // Return notification presentation options
    // These control how the notification is displayed
    return {
      shouldShowAlert: true,      // Show notification banner
      shouldPlaySound: true,       // Play sound
      shouldSetBadge: true,        // Update app icon badge
      priority: data?.priority === 'high' 
        ? Notifications.AndroidNotificationPriority.HIGH 
        : Notifications.AndroidNotificationPriority.DEFAULT,
    };
    
  } catch (error) {
    // Always return default behavior on error
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  }
};

export const initializeBackgroundNotifications = () => {
  _notificationHandlerRegistered = true;
  Notifications.setNotificationHandler({
    handleNotification: handleBackgroundNotification,
  });
  registerNotificationTask().catch(() => {});
};


