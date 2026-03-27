import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { BASE_URL_API } from '../utils/settings';
import { withWakeLock, startKeepAlive, stopKeepAlive, isKeepAliveActive } from '../utils/wakeLockHelper';

// Dedicated background task name for heartbeat (separate from locationModule's task)
const HEARTBEAT_BACKGROUND_TASK = 'texxano-heartbeat-background-task';

// ============================================================
// TIMING CONFIG — fetched from GET /timing-config on track start
// Cached in AsyncStorage so it survives app kill and is available
// in background tasks without a network round-trip.
// ============================================================
const TIMING_CONFIG_KEY = '@texxano_timing_config';
let _autoStopThresholdSeconds = 60;
let _heartbeatIntervalMs = 150000; // default: 150s (overridden by GET /timing-config)

export const getAutoStopThresholdMs = () => _autoStopThresholdSeconds * 1000;

const loadTimingConfig = async () => {
  try {
    const tokens = await getTokenFromStorage(true);
    if (!tokens?.token) return;

    const response = await fetch(`${BASE_URL_API}/users/timing-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    const config = json.data ?? json;
    _autoStopThresholdSeconds = config.autoStopThresholdSeconds ?? 60;
    _heartbeatIntervalMs = (config.heartbeatIntervalSeconds ?? 150) * 1000;

    await AsyncStorage.setItem(TIMING_CONFIG_KEY, JSON.stringify({
      autoStopThresholdSeconds: _autoStopThresholdSeconds,
      maxUnansweredPings: config.maxUnansweredPings,       // informational only on mobile
      heartbeatIntervalSeconds: config.heartbeatIntervalSeconds,
      fetchedAt: new Date().toISOString(),
    }));

    await persistLog(`⚙️ [TIMING CONFIG] autoStopThreshold: ${_autoStopThresholdSeconds}s | heartbeatInterval: ${_heartbeatIntervalMs / 1000}s | maxUnansweredPings: ${config.maxUnansweredPings}`);
  } catch (e) {
    // Network error or app killed — load last cached value
    try {
      const cached = await AsyncStorage.getItem(TIMING_CONFIG_KEY);
      if (cached) {
        const config = JSON.parse(cached);
        _autoStopThresholdSeconds = config.autoStopThresholdSeconds ?? 60;
        _heartbeatIntervalMs = (config.heartbeatIntervalSeconds ?? 150) * 1000;
        await persistLog(`⚙️ [TIMING CONFIG] Loaded from cache (network error): ${_autoStopThresholdSeconds}s threshold, ${_heartbeatIntervalMs / 1000}s interval`);
      }
    } catch { /* use default */ }
  }
};

// ⚠️ CRITICAL: Define background task IMMEDIATELY after imports
let heartbeatTaskDefined = false;

try {
  TaskManager.defineTask(HEARTBEAT_BACKGROUND_TASK, async ({ data, error }) => {
    if (error) {
      return;
    }
    
    if (data) {
      const { locations } = data;
      const location = locations?.[0];
      
      if (location) {
        await sendHeartbeatFromBackground(
          location.coords.latitude,
          location.coords.longitude
        );
      } else {
        await sendHeartbeatFromBackground();
      }
    }
  });
  
  heartbeatTaskDefined = true;
} catch (defineError) {
  if (defineError?.message?.includes('already been defined')) {
    heartbeatTaskDefined = true;
  } else {
    console.error('❌ [INIT] FAILED to define heartbeat task:', defineError?.message || defineError);
    heartbeatTaskDefined = false;
  }
}

// Export to prevent tree-shaking
export const HEARTBEAT_MODULE_LOADED = true;
export const isHeartbeatTaskDefined = () => heartbeatTaskDefined;

export const getTokenFromStorage = async (silent = false) => {
  try {
    const persistedData = await AsyncStorage.getItem('persist:TEXXANO');
    if (!persistedData) {
      return null;
    }
    
    const parsed = JSON.parse(persistedData);
    if (!parsed.userToken) {
      return null;
    }
    
    const userToken = JSON.parse(parsed.userToken);
    if (!userToken.token) {
      return null;
    }
    
    // Also get userId from userDataRole
    let userId = null;
    if (parsed.userDataRole) {
      const userDataRole = JSON.parse(parsed.userDataRole);
      userId = userDataRole.userId;
    }
    
    return {
      token: userToken.token,
      refreshToken: userToken.refreshToken,
      userId: userId,
    };
  } catch (error) {
    return null;
  }
};

export const refreshTokenInBackground = async (refreshToken, userId) => {
  try {
    if (!refreshToken || !userId) {
      return null;
    }
    
    const response = await fetch(`${BASE_URL_API}/authentications/login/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: refreshToken,
        userId: userId,
      }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.token) {
      return null;
    }
    
    // Update AsyncStorage with new tokens (same format as redux-persist)
    const persistedData = await AsyncStorage.getItem('persist:TEXXANO');
    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      
      // Update userToken with new values
      const updatedUserToken = JSON.stringify({
        tokenExpiration: data.tokenExpirationEpoch,
        token: data.token,
        refreshToken: data.refreshToken,
      });
      
      parsed.userToken = updatedUserToken;
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem('persist:TEXXANO', JSON.stringify(parsed));
    }
    
    return {
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    return null;
  }
};

// Track if heartbeat task is running
let isHeartbeatTaskRunning = false;

// Rate-limit gate: backend enforces minimum 30s between heartbeats.
// Two sources (location task + keep-alive JS timer) can fire within seconds of each other.
// Gate at 25s to absorb timer jitter while staying safely inside the 30s backend window.
let _lastHeartbeatSentAt = 0;
const MIN_HEARTBEAT_INTERVAL_MS = 25000; // 25s gate

// ⏱️ TESTING: Heartbeat sequence counter & track-start timestamp
let _heartbeatSeq = 0;
let _trackStartedAt = null;

/** Call when tracking starts to seed the timer reference */
export const seedHeartbeatTimer = () => {
  _heartbeatSeq = 0;
  _trackStartedAt = Date.now();
  const elapsed = 'T+0:00';
  persistLog(`💓 [HEARTBEAT SEEDED] ${elapsed} — heartbeat seeded ✅`);
  loadTimingConfig();
};

/** Returns a T+MM:SS string from the seeded start time */
const getElapsed = () => {
  if (!_trackStartedAt) return 'T+?:??';
  const sec = Math.floor((Date.now() - _trackStartedAt) / 1000);
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `T+${m}:${s}`;
};

// Persistent logging for production debugging
const HEARTBEAT_LOG_KEY = '@texxano_heartbeat_log';
const MAX_LOG_ENTRIES = 50;

/**
 * Log heartbeat activity to AsyncStorage for production debugging
 * Since console.log may not work in background, we persist logs
 */
const persistLog = async (message, data = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data,
    };
    
    // Get existing logs
    const existingLogs = await AsyncStorage.getItem(HEARTBEAT_LOG_KEY);
    let logs = existingLogs ? JSON.parse(existingLogs) : [];
    
    // Add new log and limit to MAX_LOG_ENTRIES
    logs.push(logEntry);
    if (logs.length > MAX_LOG_ENTRIES) {
      logs = logs.slice(-MAX_LOG_ENTRIES);
    }
    
    await AsyncStorage.setItem(HEARTBEAT_LOG_KEY, JSON.stringify(logs));
    console.log(`[${timestamp}] ${message}`, Object.keys(data).length ? data : ''); // Also log to console for dev mode
  } catch (error) {
    console.log('Failed to persist log:', error);
  }
};

const getCurrentLocation = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
    });
    return { latitude: location.coords.latitude, longitude: location.coords.longitude };
  } catch (error) {
    return null;
  }
};

const sendHeartbeatFromBackground = async (latitude, longitude, isRetry = false) => {
  // Wrap the entire heartbeat send in a wake lock to ensure CPU stays active
  return await withWakeLock(async () => {
    try {
      const now = Date.now();
      const msSinceLast = now - _lastHeartbeatSentAt;
      if (!isRetry && msSinceLast < MIN_HEARTBEAT_INTERVAL_MS) {
        await persistLog(`⏭️ [HEARTBEAT] Skipped — rate gate (${Math.round(msSinceLast / 1000)}s < ${MIN_HEARTBEAT_INTERVAL_MS / 1000}s)`);
        return false;
      }
      _lastHeartbeatSentAt = now;

      const timestamp = new Date().toISOString();
      
      // Get token directly from AsyncStorage (not Redux)
      const tokens = await getTokenFromStorage(false); // ← Changed from true to false to see logs
      if (!tokens?.token) {
        await persistLog('⚠️ [BG] NO TOKEN - Cannot send heartbeat', {
          hasTokens: !!tokens,
          hasToken: !!tokens?.token,
          hasRefreshToken: !!tokens?.refreshToken,
          hasUserId: !!tokens?.userId,
        });
        return false;
      }
      
      // Log screen state and network connectivity for debugging Android screen lock issues
      const appState = AppState.currentState;
      const screenLocked = appState === 'background' || appState === 'inactive';
      
      _heartbeatSeq++;
      const elapsed = getElapsed();
      await persistLog(`💓 [HEARTBEAT] ${elapsed} Sending heartbeat (seq: ${_heartbeatSeq})...`, { 
        timestamp,
        seq: _heartbeatSeq,
        elapsed,
        appState,
        screenLocked,
        hasLocation: !!(latitude && longitude),
        api: BASE_URL_API 
      });
    const payload = {
      timestamp: new Date().toISOString(),
      platform: require('react-native').Platform.OS,
      source: 'background_heartbeat_task',
    };

    if (latitude !== undefined && longitude !== undefined) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }
    // Direct fetch with token from AsyncStorage
    const response = await fetch(`${BASE_URL_API}/users/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.token}`,
      },
      body: JSON.stringify(payload),
    });
    
    // Handle 401/403 - token expired, try to refresh
    if ((response.status === 401 || response.status === 403) && !isRetry) {
      if (!tokens.refreshToken || !tokens.userId) {
        return false;
      }
      
      const newTokens = await refreshTokenInBackground(tokens.refreshToken, tokens.userId);
      if (newTokens?.token) {
        return sendHeartbeatFromBackground(latitude, longitude, true);
      } else {
        return false;
      }
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
      const elapsed2 = getElapsed();
      await persistLog(`✅ [HEARTBEAT] ${elapsed2} SENT (seq: ${_heartbeatSeq}) → backend alive signal`, { status: response.status, seq: _heartbeatSeq });
      return true;
    } catch (error) {
      await persistLog('❌ [BG] HEARTBEAT FAILED', { 
        error: error?.message || String(error),
        stack: error?.stack?.substring(0, 200)
      });
      return false;
    }
  }, 'heartbeat_send');
};

const startKeepAliveHeartbeat = () => {
  if (isKeepAliveActive()) {
    return;
  }
  
  // Start JavaScript timer-based heartbeat as backup
  // This survives better during Doze mode than location-based updates
  startKeepAlive(async () => {
    const elapsed = getElapsed();
    await persistLog(`⏰ [KEEP_ALIVE] ${elapsed} Timer-based heartbeat triggered (seq: ${_heartbeatSeq + 1})`);
    
    // Try to get current location (non-blocking)
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 1000,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]);
        
        if (location?.coords) {
          await sendHeartbeatFromBackground(
            location.coords.latitude,
            location.coords.longitude
          );
          return;
        }
      }
    } catch (error) { /* send without location below */ }
    
    // Send without location if location fetch failed
    await sendHeartbeatFromBackground();
  }, _heartbeatIntervalMs);
};

const stopKeepAliveHeartbeat = () => {
  stopKeepAlive();
};

export const startBackgroundLocation = async () => {
  try {
    await persistLog('🚀 [START] Attempting to start heartbeat task');
    
    // Check if defineTask was successful (not isTaskRegisteredAsync - that only returns true AFTER startLocationUpdatesAsync)
    if (!heartbeatTaskDefined) {
      await persistLog('⚠️ [START] Task not defined - critical error', {
        taskName: HEARTBEAT_BACKGROUND_TASK,
        hint: 'TaskManager.defineTask failed at module load'
      });
      console.error('⚠️ Background task not defined! Check appStatusService.js module initialization');
      return false;
    }
    
    await persistLog('✅ [START] Task was defined at module load', { heartbeatTaskDefined });
    
    // Check if already running
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(HEARTBEAT_BACKGROUND_TASK).catch(() => false);
    if (hasStarted) {
      await persistLog('💓 [START] Task already running');
      isHeartbeatTaskRunning = true;
      return true;
    }

    // Request foreground permission first
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    await persistLog('🔐 [START] Foreground permission', { status: fgStatus });
    
    if (fgStatus !== 'granted') {
      return false;
    }

    // Request background permission
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    await persistLog('🔐 [START] Background permission', { status: bgStatus });
    
    if (bgStatus !== 'granted') {
      return false;
    }

    // Start dedicated background task for heartbeat
    // 2.5 minute interval provides safety margin for 5min backend timeout
    await persistLog('🎬 [START] Starting location updates...');

    
    await Location.startLocationUpdatesAsync(HEARTBEAT_BACKGROUND_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: _heartbeatIntervalMs,
      distanceInterval: 0,
      deferredUpdatesInterval: _heartbeatIntervalMs,
      foregroundService: {
        notificationTitle: '⏱️ Texxano Time Tracking',
        notificationBody: 'Keeping your session alive • Tap to open app',
        killServiceOnDestroy: false,
        notificationColor: '#4A90E2',
        // Android 14+ requires notification for foreground service
        notificationContentText: 'Background heartbeat service running',
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: false,
      activityType: Location.ActivityType.Fitness,  // ⚠️ Changed from Other to Fitness
    });

    isHeartbeatTaskRunning = true;
    await persistLog(`✅ [START] Heartbeat task started (interval: ${_heartbeatIntervalMs / 1000}s)`);
    
    startKeepAliveHeartbeat();
    return true;
  } catch (error) {
    await persistLog('❌ [START] Failed to start task', { error: error?.message || String(error) });
    return false;
  }
};

export const stopBackgroundLocation = async () => {
  try {
    // Stop JavaScript keep-alive first
    stopKeepAliveHeartbeat();
    
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(HEARTBEAT_BACKGROUND_TASK).catch(() => false);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(HEARTBEAT_BACKGROUND_TASK);
    }
    isHeartbeatTaskRunning = false;
  } catch (error) { /* ignore */ }
};

export const sendHeartbeat = async (userId, projectId, isRetry = false) => {
  try {
    // Rate-limit gate (same as background task — both share _lastHeartbeatSentAt)
    const now = Date.now();
    const msSinceLast = now - _lastHeartbeatSentAt;
    if (!isRetry && msSinceLast < MIN_HEARTBEAT_INTERVAL_MS) {
      return false;
    }
    _lastHeartbeatSentAt = now;

    // Get token from AsyncStorage (same source as background task) - silent to avoid spam
    const tokens = await getTokenFromStorage(true);
    if (!tokens?.token) {
      // User not logged in or session expired - skip silently
      return false;
    }
    
    _heartbeatSeq++;
    
    // Get location if available (non-blocking, max 2 second timeout)
    const locationPromise = getCurrentLocation();
    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2000));
    const location = await Promise.race([locationPromise, timeoutPromise]);

    const payload = {
      timestamp: new Date().toISOString(),
      platform: require('react-native').Platform.OS,
    };

    // Add GPS coordinates if available
    if (location) {
      payload.latitude = location.latitude;
      payload.longitude = location.longitude;
    }
    
    // Direct fetch with token from AsyncStorage
    const response = await fetch(`${BASE_URL_API}/users/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.token}`,
      },
      body: JSON.stringify(payload),
    });
    
    // Handle 401/403 - token expired, try to refresh
    if ((response.status === 401 || response.status === 403) && !isRetry) {
      if (!tokens.refreshToken || !tokens.userId) {
        return false;
      }
      
      const newTokens = await refreshTokenInBackground(tokens.refreshToken, tokens.userId);
      if (newTokens?.token) {
        return sendHeartbeat(userId, projectId, true);
      } else {
        return false;
      }
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return true;
  } catch (error) {
    return false;
  }
};


