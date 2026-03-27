/**
 * Location Module - Using expo-location
 * Replaces the custom native texxano-location-module with expo-location
 * Maintains the same API for backward compatibility
 */

import React from "react";
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as SharedTrackingState from './sharedTrackingState';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as IntentLauncher from "expo-intent-launcher";
import http from "../services/http";

// Constants
const LOCATION_TASK_NAME = "texxano-background-location-task";
const STORAGE_KEY_LOCATIONS = "@texxano_stored_locations";
const STORAGE_KEY_LOGS = "@texxano_location_logs";
const STORAGE_KEY_TRACKING = "@texxano_is_tracking";
const STORAGE_KEY_LOGGER_ENABLED = "@texxano_logger_enabled";

// Geofence constants
const STORAGE_KEY_REALTIME_GEOFENCE = "@texxano_realtime_geofence";
const STORAGE_KEY_REALTIME_GEOFENCE_STATUS = "@texxano_realtime_geofence_status";
const STORAGE_KEY_ACTIVE_TRACK = "@texxano_active_track";
const STORAGE_KEY_PROJECT_ID = "@texxano_project_id";

// Active track type for API state management
type ActiveTrackData = {
  id: string;
  start: string;
  isTracking: boolean;
  projectId: string | null;
  regionId: string;
  regionName: string;
} | null;

// In-memory active track state
let _activeTrackData: ActiveTrackData = null;

// Global project ID - set from Redux via setGlobalProjectId()
let _globalProjectId: string | null = null;

// Working hours constants
const STORAGE_KEY_WORKING_HOURS = "@texxano_working_hours";
const STORAGE_KEY_WORKING_HOURS_ENABLED = "@texxano_working_hours_enabled";

// Working hours configuration
type WorkingHoursConfig = {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  enabled: boolean;
};

// Default: 07:30 - 20:30
// TODO: Re-enable for production (set enabled: true)
const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  startHour: 7,
  startMinute: 30,
  endHour: 20,
  endMinute: 30,
  enabled: false, // TESTING: disabled to allow geofence auto-start at any hour
};

let _workingHours: WorkingHoursConfig = { ...DEFAULT_WORKING_HOURS };
let _workingHoursCheckInterval: NodeJS.Timeout | null = null;
let _isPausedDueToWorkingHours: boolean = false;

// Periodic geofence check interval (backup for when location subscription fails)
let _periodicGeofenceCheckInterval: NodeJS.Timeout | null = null;

// Throttle recovery checks to avoid hammering the server
// When user is inside a geofence but no local track, we verify with server once per 2 min
let _lastRecoveryCheckTime: number = 0;
const RECOVERY_CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

// In-memory state
let _isTracking = false;
let _storedLocations: any[] = [];
let _logs: { timestamp: string; tag: string; message: string }[] = [];
let _isLoggerEnabled = false;
let _locationListeners: ((event: object) => void)[] = [];
let _trackingStatusListeners: ((event: { status: boolean }) => void)[] = [];
let _foregroundSubscription: Location.LocationSubscription | null = null;

// Real-time geofence state
type RealtimeGeofenceRegion = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
};

type RealtimeGeofenceCallback = (event: {
  type: "START" | "STOP";
  region: RealtimeGeofenceRegion;
  location: { latitude: number; longitude: number };
  timestamp: string;
}) => void;

// Support for multiple geofence regions
let _realtimeGeofences: RealtimeGeofenceRegion[] = [];
let _insideGeofences: Map<string, boolean> = new Map(); // Track which geofences user is inside
let _geofenceCallbacks: RealtimeGeofenceCallback[] = [];

// Global flag to prevent concurrent initialization
let _isInitializingGeofences: boolean = false;

// Legacy single geofence (for backward compatibility)
let _realtimeGeofence: RealtimeGeofenceRegion | null = null;
let _isInsideGeofence: boolean = false;

// Adaptive tracking state
let _currentTrackingInterval: number = 60000; // Default 60 seconds

let _lastDistanceToGeofence: number | null = null;

// ============================================
// LOCATION PERMISSION ERROR TRACKING
// ============================================
let _hasLocationPermissionError: boolean = false;
let _locationPermissionErrorCallbacks: Array<(hasError: boolean) => void> = [];

/**
 * Check if there's a location permission error
 */
export function hasLocationPermissionError(): boolean {
  return _hasLocationPermissionError;
}

/**
 * Set location permission error state and notify listeners
 */
function setLocationPermissionError(hasError: boolean): void {
  if (_hasLocationPermissionError !== hasError) {
    _hasLocationPermissionError = hasError;
    // Notify all listeners
    _locationPermissionErrorCallbacks.forEach(cb => {
      try {
        cb(hasError);
      } catch (e) {
        console.log('Error in permission error callback:', e);
      }
    });
  }
}

/**
 * Subscribe to location permission error changes
 * Returns unsubscribe function
 */
export function onLocationPermissionError(callback: (hasError: boolean) => void): () => void {
  _locationPermissionErrorCallbacks.push(callback);
  // Immediately call with current state
  callback(_hasLocationPermissionError);
  // Return unsubscribe function
  return () => {
    _locationPermissionErrorCallbacks = _locationPermissionErrorCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Clear error and retry location permissions
 */
export async function retryLocationPermission(): Promise<boolean> {
  try {
    // Check current permission status
    const { status: foreground } = await Location.getForegroundPermissionsAsync();
    const { status: background } = await Location.getBackgroundPermissionsAsync();
    
    if (foreground !== 'granted') {
      // Request foreground permission
      const result = await Location.requestForegroundPermissionsAsync();
      if (result.status !== 'granted') {
        // Still not granted, open settings
        openAppSettings();
        return false;
      }
    }
    
    if (background !== 'granted') {
      // Request background permission
      const result = await Location.requestBackgroundPermissionsAsync();
      if (result.status !== 'granted') {
        // For Android 11+, must go to settings
        openAppSettings();
        return false;
      }
    }
    
    // Permissions granted, clear error and restart tracking
    setLocationPermissionError(false);
    await startLocationUpdates();
    return true;
  } catch (error) {
    console.log('Error retrying location permission:', error);
    return false;
  }
}

// ============================================
// STABILIZATION PERIOD - Prevent false STOP after START
// ============================================
// After a START (from QR, geofence, or API sync), ignore STOP events for this duration
// This prevents GPS inaccuracy from immediately stopping a just-started track
const STOP_COOLDOWN_MS = 180000; // 180 seconds (3 minutes) stabilization period
let _lastStartTime: number = 0; // Timestamp of last START (any source)

// HYSTERESIS - Require multiple consecutive "outside" readings before STOP
// This prevents single GPS fluctuation from triggering false STOP
const CONSECUTIVE_OUTSIDE_REQUIRED = 3;
let _consecutiveOutsideCount: number = 0;

// Adaptive tracking thresholds (optimized for battery saving)
// 🔋 BATTERY OPTIMIZED: Longer intervals when far from geofence
const ADAPTIVE_THRESHOLDS = {
  FAR: { distance: 1000, interval: 1800000 },    // >1000m = check every 30 min (1800 sec)
  MEDIUM: { distance: 500, interval: 900000 },   // 500-1000m = check every 15 min (900 sec)
  CLOSE: { distance: 200, interval: 300000 },    // 200-500m = check every 5 min (300 sec)
  VERY_CLOSE: { distance: 0, interval: 120000 }, // <200m = check every 2 min (120 sec)
};

// ============================================
// ACTIVE TRACK MANAGEMENT - Prevent duplicate API calls
// ============================================
async function loadActiveTrackData(): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_TRACK);
    if (data) {
      _activeTrackData = JSON.parse(data);
      
      // Sync with shared global state if tracking is active
      if (_activeTrackData?.isTracking) {
        await SharedTrackingState.markWorkStarted(
          _activeTrackData.id,
          _activeTrackData.start,
          null // Location ID not stored in old format
        );
      }
    }
  } catch (e) {
    console.log("❌ Error loading active track:", e);
  }
}

async function saveActiveTrackData(track: ActiveTrackData): Promise<void> {
  _activeTrackData = track;
  if (track) {
    await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_TRACK, JSON.stringify(track));
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_TRACK);
  }
}

/**
 * Open app settings so user can enable location permissions
 * Works on both iOS and Android
 */
async function openAppSettings(): Promise<void> {
  try {
    if (Platform.OS === "ios") {
      // iOS - opens app's settings page directly
      await Linking.openURL("app-settings:");
    } else {
      // Android - opens app's specific settings page
      const pkg = "texxano.v1.android"; // Your package name from app.json
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: `package:${pkg}` }
      );
    }
    // fallthrough to general settings
  } catch (error) {
    // Fallback - open general settings
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("App-Prefs:Privacy&path=LOCATION");
      } else {
        await Linking.openSettings();
      }
    } catch (fallbackError) {
      console.log("Fallback settings also failed:", fallbackError);
      Alert.alert(
        "Cannot Open Settings",
        "Please manually go to Settings > Apps > Texxano > Permissions > Location and enable 'Allow all the time'."
      );
    }
  }
}

// Export for external use
export { openAppSettings };

// Initialize active track on module load
loadActiveTrackData();

/**
 * Sync local active track state with server
 * Call this when app comes to foreground to ensure consistency
 */
export async function syncActiveTrackWithServer(): Promise<void> {
  try {
    // Fetch current tracks from server
    const response = await http.get("/timetracker/tracks?page=1&PageSize=5");
    const tracks = response?.data?.list || response?.list || [];
    
    // Find active track (isTracking === true)
    const serverActiveTrack = tracks.find((t: any) => t.isTracking === true);
    
    if (serverActiveTrack) {
      // Server has active track
      if (!_activeTrackData || _activeTrackData.id !== serverActiveTrack.id) {
        // Local is different - update local with server state
        const trackData: ActiveTrackData = {
          id: serverActiveTrack.id,
          start: serverActiveTrack.start,
          isTracking: true,
          projectId: serverActiveTrack.projectId || _globalProjectId,
          regionId: _activeTrackData?.regionId || "synced",
          regionName: _activeTrackData?.regionName || "Synced from server",
        };
        await saveActiveTrackData(trackData);
        dbLog("SYNC", `Updated local track to: ${serverActiveTrack.id}`);
      }
    } else {
      // Server has no active track
      if (_activeTrackData && _activeTrackData.isTracking) {
        // Local thinks there's an active track - clear it
        console.log("🧹 Server has no active track, clearing local stale track");
        await saveActiveTrackData(null);
        dbLog("SYNC", "Cleared stale local track - server has none active");
      }
    }
  } catch (error) {
    console.log("⚠️ Failed to sync track with server:", error);
    // Don't clear on network error - might be temporary
  }
}

/**
 * Set the global project ID from Redux (userDataRole.rootId)
 * This should be called from AppContainerClean when rootId changes
 * Also persists to AsyncStorage for background tasks
 */
export async function setGlobalProjectId(projectId: string | null): Promise<void> {
  _globalProjectId = projectId;
  // Persist to AsyncStorage for background tasks
  if (projectId) {
    await AsyncStorage.setItem(STORAGE_KEY_PROJECT_ID, projectId);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY_PROJECT_ID);
  }
}

export function getGlobalProjectId(): string | null {
  return _globalProjectId;
}

// Load projectId from AsyncStorage on module init
async function loadGlobalProjectId(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_PROJECT_ID);
    if (stored) {
      _globalProjectId = stored;
    }
  } catch (e) {
    console.log("Error loading projectId:", e);
  }
}

// Initialize projectId on module load
loadGlobalProjectId();

async function handleGeofenceApiCall(
  eventType: "START" | "STOP",
  geofence: RealtimeGeofenceRegion
): Promise<void> {
  console.log(`\n🎯 ${eventType} for "${geofence.name}"`);
  
  try {
    if (eventType === "START") {
      // ── Step 0: Check working hours (20:30 - 07:30 = quiet hours)
      if (!isWithinWorkingHours()) {
        console.log("⚠️ SKIPPING START - Outside working hours (20:30 - 07:30 quiet period)");
        dbLog("API", "Skipped START - outside working hours");
        return;
      }
      
      // ── Step 1: If local state claims tracking is active, verify with backend FIRST.
      // acquireStartLock() checks _isWorkTimeStarted which comes from AsyncStorage.
      // The backend may have stopped the track (heartbeat timeout / web stop / app kill)
      // while local state was not updated. We MUST clear stale state before locking,
      // otherwise the lock always fails and START is silently skipped forever.
      if (SharedTrackingState.isWorkActuallyStarted() || (_activeTrackData && _activeTrackData.isTracking)) {
        try {
          const verifyResponse = await http.get("/timetracker/tracks?page=1&PageSize=5");
          const tracks = verifyResponse?.data?.list || verifyResponse?.list || [];
          const serverHasActiveTrack = tracks.some((t: any) => t.isTracking === true);
          if (serverHasActiveTrack) {
            console.log(`⚠️ SKIPPING START - Server confirms already tracking`);
            dbLog("API", "Skipped START - server confirms active track");
            return;
          }
          // Stale local state — backend stopped the track, clear it so the lock can proceed
          console.log("🔄 [LOCATION] Stale local state cleared (backend has no active track)");
          await saveActiveTrackData(null);
          await SharedTrackingState.markWorkStopped();
        } catch (verifyError: any) {
          // Network error — can't verify, skip to avoid duplicate
          console.log("⚠️ Could not verify with backend:", verifyError?.message, "- skipping START");
          dbLog("API", "Skipped START - network error during verification");
          return;
        }
      }

      // ── Step 2: Acquire mutex to prevent concurrent START calls
      if (!SharedTrackingState.acquireStartLock()) {
        console.log("⚠️ SKIPPING START - START already in progress");
        dbLog("API", "Skipped START - lock acquisition failed");
        return;
      }

      // Build query params for START API (backend expects query params, not JSON body)
      const params = new URLSearchParams();
      params.append('startedFromMobileApp', 'true');
      if (geofence?.id) {
        params.append('companyLocationId', geofence.id);
      }
         const payload = {
        projectId: null,
        description: null,

      };

      console.log(`🚀 Calling START API for location: ${geofence.name}`);
      const response = await http.post(`/timetracker/tracks/start?${params.toString()}`, payload);
      
      const trackData: ActiveTrackData = {
        id: response.data?.id || response.id || `local-${Date.now()}`,
        start: response.data?.start || response.start || new Date().toISOString(),
        isTracking: true,
        projectId: _globalProjectId,
        regionId: geofence.id,
        regionName: geofence.name,
      };
      
      await saveActiveTrackData(trackData);
      await SharedTrackingState.markWorkStarted(
        trackData.id,
        trackData.start,
        geofence?.id || null
      );
      
      // Set cooldown timestamp to prevent immediate false STOP from GPS inaccuracy
      _lastStartTime = Date.now();
      
      // Reset consecutive outside counter - user has started tracking
      _consecutiveOutsideCount = 0;
      
      console.log(`✅ TIME TRACKING STARTED - Track: ${trackData.id}`);
      dbLog("API", `START success - ID: ${trackData.id}`);

    } else if (eventType === "STOP") {
      // Guard: skip STOP if no active track in memory OR SharedTrackingState confirms not tracking.
      // The SharedTrackingState check prevents a spurious STOP after QR/manual stop left a
      // stale _activeTrackData (isTracking=true) in memory.
      if (!_activeTrackData || !_activeTrackData.isTracking || !SharedTrackingState.isWorkActuallyStarted()) {
        console.log("⚠️ SKIPPING STOP - No active track");
        return;
      }

      // Guard: skip STOP if within cooldown period after START
      // This prevents GPS inaccuracy from triggering false STOP immediately after START
      // Check both local cooldown (geofence START) and SharedTrackingState cooldown (QR START)
      const localTimeSinceStart = Date.now() - _lastStartTime;
      const isInLocalCooldown = _lastStartTime > 0 && localTimeSinceStart < STOP_COOLDOWN_MS;
      const isInGlobalCooldown = SharedTrackingState.isInStopCooldown();
      
      // Also check track start time directly as a last resort
      const trackStartTime = _activeTrackData?.start ? new Date(_activeTrackData.start).getTime() : 0;
      const timeSinceTrackStart = trackStartTime > 0 ? Date.now() - trackStartTime : Infinity;
      const isTrackTooYoung = timeSinceTrackStart < STOP_COOLDOWN_MS;
      
      console.log(`🔍 STOP COOLDOWN CHECK:`, {
        localLastStart: _lastStartTime,
        localTimeSince: Math.round(localTimeSinceStart / 1000),
        isInLocalCooldown,
        isInGlobalCooldown,
        trackStart: _activeTrackData?.start,
        timeSinceTrackStart: Math.round(timeSinceTrackStart / 1000),
        isTrackTooYoung,
      });
      
      if (isInLocalCooldown || isInGlobalCooldown || isTrackTooYoung) {
        const cooldownSource = isInGlobalCooldown ? 'global' : (isInLocalCooldown ? 'local' : 'track-age');
        const remaining = isInGlobalCooldown 
          ? SharedTrackingState.getStopCooldownRemaining() 
          : (isInLocalCooldown ? (STOP_COOLDOWN_MS - localTimeSinceStart) : (STOP_COOLDOWN_MS - timeSinceTrackStart));
        console.log(`⚠️ SKIPPING STOP - Within cooldown (${cooldownSource}), ${Math.round(remaining / 1000)}s remaining`);
        dbLog("API", `Skipped STOP - cooldown active (${cooldownSource})`);
        return;
      }

      // Build query params for STOP API (backend expects query params, not JSON body)
      const params = new URLSearchParams();
      params.append('startedFromMobileApp', 'false');
      if (geofence?.id) {
        params.append('companyLocationId', geofence.id);
      }
               const payload = {
        projectId: null,
        description: null,

      };
      console.log(`🛑 Calling STOP API for track: ${_activeTrackData.id}`);
      await http.post(`/timetracker/tracks/stop?${params.toString()}`, payload);
      
      await saveActiveTrackData(null);
      await SharedTrackingState.markWorkStopped();
      
      console.log(`✅ TIME TRACKING STOPPED`);
      dbLog("API", "STOP success");
    }
  } catch (error: any) {
    console.log(`❌ ${eventType} API FAILED:`, error?.message || error);
    dbLog("API_ERROR", `${eventType} failed: ${error}`);
    
    if (eventType === "START") {
      SharedTrackingState.releaseStartLock();
    }
    
    // ============================================
    // Handle stale track: If STOP fails with auth error,
    // the local track is out of sync with server - clear it
    // ============================================
    if (eventType === "STOP") {
      const errorMessage = error?.message || error?.toString() || "";
      const isAuthError = errorMessage.includes("Not.Authorized") || 
                          errorMessage.includes("401") ||
                          errorMessage.includes("403") ||
                          errorMessage.includes("User.Not.Authorized");
      
      if (isAuthError) {
        console.log("🧹 Clearing stale track from local storage (server rejected it)");
        dbLog("API", "Cleared stale track - was out of sync with server");
        await saveActiveTrackData(null);
      }
    }
  }
}

// Export functions for external use
export function getActiveTrackData(): ActiveTrackData {
  return _activeTrackData;
}

export function hasActiveTrackData(): boolean {
  return _activeTrackData !== null && _activeTrackData.isTracking === true;
}

/**
 * Sync geofence state from API response (memory only)
 * Call this when getTracks() finds an active track with companyLocationId
 * This ensures _insideGeofences and _activeTrackData match the server state
 * @param trackId - Active track ID from API
 * @param startTime - Track start time from API
 * @param companyLocationId - The geofence ID where user is tracking (or null)
 */
export function syncGeofenceStateFromAPI(
  trackId: string,
  startTime: string,
  companyLocationId: string | null
): void {
  // Update active track data in memory (no AsyncStorage)
  _activeTrackData = {
    id: trackId,
    start: startTime,
    isTracking: true,
    projectId: _globalProjectId,
    regionId: companyLocationId || 'api-synced',
    regionName: 'Synced from API',
  };
  
  // Set cooldown timestamp to prevent immediate false STOP from GPS inaccuracy
  // when we sync state from API (which sets _insideGeofences without verifying GPS)
  _lastStartTime = Date.now();
  
  // If we have a companyLocationId, mark that geofence as "inside"
  if (companyLocationId) {
    // Check if this location exists in our geofence list
    const geofenceExists = _realtimeGeofences.some(g => g.id === companyLocationId) ||
      (_realtimeGeofence && _realtimeGeofence.id === companyLocationId);
    
    if (geofenceExists) {
      _insideGeofences.set(companyLocationId, true);
      
      // Also update legacy single geofence state if it matches
      if (_realtimeGeofence && _realtimeGeofence.id === companyLocationId) {
        _isInsideGeofence = true;
      }
    } else {
      console.log(`⚠️ Company location ${companyLocationId} not in registered geofences`);
    }
  }
  
  dbLog("API_SYNC", `Geofence state synced - Track: ${trackId}, Location: ${companyLocationId || 'none'}`);
}

/**
 * Clear geofence state when API shows no active tracking (memory only)
 */
export function syncGeofenceStoppedFromAPI(): void {
  // Clear active track data in memory
  _activeTrackData = null;
  
  // Mark all geofences as "outside" since API says not tracking
  for (const id of _insideGeofences.keys()) {
    _insideGeofences.set(id, false);
  }
  _isInsideGeofence = false;
  
  dbLog("API_SYNC", "Geofence state cleared - no active tracking from API");
}

// ============================================
// HAVERSINE FORMULA - Calculate distance between two points
// ============================================
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// ============================================
// REAL-TIME GEOFENCE CHECK - Multiple Locations
// ============================================
// Hysteresis buffer to prevent rapid enter/exit on boundary
// Increased to 20m for better indoor GPS handling (typical accuracy ±15-30m)
const HYSTERESIS_BUFFER = 20; // meters - must move 20m past boundary to trigger

function checkGeofence(latitude: number, longitude: number): void {
  // Check if we have any geofences to monitor
  if (_realtimeGeofences.length === 0 && !_realtimeGeofence) return;

  // Combine legacy single geofence with multi-geofence array
  const allGeofences = _realtimeGeofence 
    ? [..._realtimeGeofences.filter(g => g.id !== _realtimeGeofence!.id), _realtimeGeofence]
    : _realtimeGeofences;

  if (allGeofences.length === 0) return;

  // Find closest geofence for adaptive tracking
  let closestDistance = Infinity;

  // Check each geofence
  for (const geofence of allGeofences) {
    const distance = calculateDistance(
      latitude,
      longitude,
      geofence.latitude,
      geofence.longitude
    );

    // Track closest distance for adaptive tracking
    if (distance < closestDistance) {
      closestDistance = distance;
    }

    const wasInside = _insideGeofences.get(geofence.id) || false;
    
    // Apply hysteresis buffer to prevent bouncing
    // To enter: must be inside radius
    // To exit: must be outside radius + buffer
    let isNowInside: boolean;
    if (wasInside) {
      // Currently inside - need to go beyond radius + buffer to exit
      isNowInside = distance <= (geofence.radius + HYSTERESIS_BUFFER);
    } else {
      // Currently outside - need to be inside radius to enter
      isNowInside = distance <= geofence.radius;
    }

    // DEBUG LOG - always show current status
    // (removed - fires every location update for ALL regions)

    // Detect state change for this geofence
    if (isNowInside !== wasInside) {
      const eventType = isNowInside ? "START" : "STOP";
      
      // HYSTERESIS: For STOP, require multiple consecutive outside readings
      if (eventType === "STOP") {
        _consecutiveOutsideCount++;
        console.log(`📍 Outside reading #${_consecutiveOutsideCount}/${CONSECUTIVE_OUTSIDE_REQUIRED} for ${geofence.name} (${distance.toFixed(1)}m)`);
        
        if (_consecutiveOutsideCount < CONSECUTIVE_OUTSIDE_REQUIRED) {
          // Not enough consecutive outside readings yet - don't trigger STOP
          console.log(`⏳ Waiting for more outside readings before STOP (need ${CONSECUTIVE_OUTSIDE_REQUIRED - _consecutiveOutsideCount} more)`);
          continue; // Skip this geofence, don't update state yet
        }
        // Reset counter after triggering STOP
        _consecutiveOutsideCount = 0;
      } else {
        // Reset counter on START (user is inside)
        _consecutiveOutsideCount = 0;
      }
      
      const event = {
        type: eventType as "START" | "STOP",
        region: geofence,
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
      };

      console.log(`🚨 GEOFENCE STATE CHANGE: ${eventType} - ${geofence.name}`);
      console.log(`   Distance: ${distance.toFixed(1)}m (radius: ${geofence.radius}m)`);
      
      dbLog("GEOFENCE", `${eventType} - ${geofence.name} (${distance.toFixed(1)}m from center)`);

      // Call API with smart START/STOP logic
      handleGeofenceApiCall(eventType, geofence);

      // Notify all callbacks
      _geofenceCallbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (e) {
          console.log("Error in geofence callback:", e);
        }
      });

      // Update state for this geofence
      _insideGeofences.set(geofence.id, isNowInside);

      // Update legacy single geofence state for backward compatibility
      if (_realtimeGeofence && geofence.id === _realtimeGeofence.id) {
        _isInsideGeofence = isNowInside;
      }
    } else if (isNowInside && wasInside) {
      // User is STILL inside — reset consecutive outside counter
      _consecutiveOutsideCount = 0;
      
      // User is STILL inside — no state change, so no START fires normally.
      // But the track may have been stopped externally (web, admin, heartbeat timeout).
      // Recovery: delegate to handleGeofenceApiCall which verifies with backend first.
      // Throttled to once every 2 minutes to avoid hammering the server.
      // Note: we do NOT check isWorkActuallyStarted() here because that value may be
      // stale from AsyncStorage — handleGeofenceApiCall performs its own server check.
      if (
        !SharedTrackingState.isStartInProgress() &&
        Date.now() - _lastRecoveryCheckTime > RECOVERY_CHECK_INTERVAL_MS
      ) {
        _lastRecoveryCheckTime = Date.now();
        console.log(`🔄 [RECOVERY] Inside ${geofence.name} — checking if recovery START needed`);
        dbLog("RECOVERY", `Recovery check for ${geofence.name}`);
        handleGeofenceApiCall("START", geofence);
      }
    } else if (!isNowInside && !wasInside) {
      // User is STILL outside — increment consecutive outside counter but don't trigger STOP
      // (STOP only triggers on state change from inside to outside)
      // This handles the case where user was never inside this geofence
    }
  }

  // Store closest distance for adaptive tracking
  _lastDistanceToGeofence = closestDistance;

  // Adjust tracking interval based on closest geofence
  adjustTrackingInterval(closestDistance);

  // Persist status
  const statusData = {
    insideGeofences: Object.fromEntries(_insideGeofences),
    lastCheck: new Date().toISOString(),
    // Legacy compatibility
    isInside: _isInsideGeofence,
  };
  AsyncStorage.setItem(STORAGE_KEY_REALTIME_GEOFENCE_STATUS, JSON.stringify(statusData));
}

// ============================================
// ADAPTIVE TRACKING - Adjust interval based on distance
// ============================================
function getOptimalInterval(distance: number): number {
  if (distance > ADAPTIVE_THRESHOLDS.FAR.distance) {
    return ADAPTIVE_THRESHOLDS.FAR.interval; // 15 min
  } else if (distance > ADAPTIVE_THRESHOLDS.MEDIUM.distance) {
    return ADAPTIVE_THRESHOLDS.MEDIUM.interval; // 10 min
  } else if (distance > ADAPTIVE_THRESHOLDS.CLOSE.distance) {
    return ADAPTIVE_THRESHOLDS.CLOSE.interval; // 5 min
  } else {
    return ADAPTIVE_THRESHOLDS.VERY_CLOSE.interval; // 1 min
  }
}

async function adjustTrackingInterval(distance: number): Promise<void> {
  if (!_realtimeGeofence) return;

  const optimalInterval = getOptimalInterval(distance);

  // Only restart if interval changed significantly
  if (optimalInterval !== _currentTrackingInterval) {
    const oldInterval = _currentTrackingInterval;
    _currentTrackingInterval = optimalInterval;

    dbLog("ADAPTIVE", `Distance: ${distance.toFixed(0)}m, Interval: ${optimalInterval/1000}s`);

    // Restart foreground subscription with new interval
    // 🔋 BATTERY OPTIMIZED: Use Balanced accuracy and larger distance interval
    if (_foregroundSubscription && _isTracking) {
      try {
        _foregroundSubscription.remove();
        _foregroundSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced, // 🔋 Changed from High to Balanced
            timeInterval: optimalInterval,
            distanceInterval: 30, // 🔋 30 meters (was 5 meters)
          },
          (location) => {
            processLocationUpdate(location, "foreground-adaptive");
          }
        );
      } catch (e) {
        console.log("Error adjusting tracking interval:", e);
      }
    }
  }
}

// ============================================
// WORKING HOURS MANAGEMENT
// ============================================

/**
 * Check if current time is within working hours
 */
function isWithinWorkingHours(): boolean {
  if (!_workingHours.enabled) return true; // If disabled, always allow

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = _workingHours.startHour * 60 + _workingHours.startMinute;
  const endMinutes = _workingHours.endHour * 60 + _workingHours.endMinute;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Get time until next working hours start/end
 */
function getTimeUntilWorkingHoursChange(): { minutes: number; willStart: boolean } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = _workingHours.startHour * 60 + _workingHours.startMinute;
  const endMinutes = _workingHours.endHour * 60 + _workingHours.endMinute;

  if (currentMinutes < startMinutes) {
    // Before working hours
    return { minutes: startMinutes - currentMinutes, willStart: true };
  } else if (currentMinutes <= endMinutes) {
    // During working hours
    return { minutes: endMinutes - currentMinutes, willStart: false };
  } else {
    // After working hours, calculate until tomorrow
    return { minutes: (24 * 60 - currentMinutes) + startMinutes, willStart: true };
  }
}

/**
 * Check and manage tracking based on working hours
 */
async function checkWorkingHoursAndManageTracking(): Promise<void> {
  if (!_workingHours.enabled) return;

  const withinHours = isWithinWorkingHours();
  const timeInfo = getTimeUntilWorkingHoursChange();

  if (withinHours && _isPausedDueToWorkingHours) {
    // Working hours started - resume tracking
    console.log("⏰ WORKING HOURS: Стартува tracking (работно време почна)");
    dbLog("WORKING_HOURS", "Работно време почна - tracking продолжува");
    _isPausedDueToWorkingHours = false;
    await startLocationUpdates();
  } else if (!withinHours && _isTracking && !_isPausedDueToWorkingHours) {
    // Outside working hours - pause tracking
    console.log("⏰ WORKING HOURS: Паузира tracking (работно време заврши)");
    dbLog("WORKING_HOURS", "Работно време заврши - tracking паузиран");
    _isPausedDueToWorkingHours = true;
    await stopLocationUpdates();
  }

  // Log next change (only if very close)
  if (timeInfo.minutes <= 60) {
    dbLog("WORKING_HOURS", `${timeInfo.willStart ? "Starting" : "Stopping"} in ${timeInfo.minutes} min`);
  }
}

/**
 * Start the working hours check interval
 */
function startWorkingHoursChecker(): void {
  if (_workingHoursCheckInterval) {
    clearInterval(_workingHoursCheckInterval);
  }

  // Check immediately
  checkWorkingHoursAndManageTracking();

  // 🔋 BATTERY OPTIMIZED: Check every 5 minutes instead of every minute
  _workingHoursCheckInterval = setInterval(() => {
    checkWorkingHoursAndManageTracking();
  }, 300000); // 🔋 Every 5 minutes (was 60 seconds)

  dbLog("WORKING_HOURS", "Checker started: 07:30 - 20:30");
}

/**
 * Stop the working hours checker
 */
function stopWorkingHoursChecker(): void {
  if (_workingHoursCheckInterval) {
    clearInterval(_workingHoursCheckInterval);
    _workingHoursCheckInterval = null;
  }
}

// Initialize state from storage
async function initializeState() {
  try {
    const [tracking, locations, logs, loggerEnabled, geofenceStr, geofenceStatusStr, workingHoursStr, multiGeofencesStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_TRACKING),
      AsyncStorage.getItem(STORAGE_KEY_LOCATIONS),
      AsyncStorage.getItem(STORAGE_KEY_LOGS),
      AsyncStorage.getItem(STORAGE_KEY_LOGGER_ENABLED),
      AsyncStorage.getItem(STORAGE_KEY_REALTIME_GEOFENCE),
      AsyncStorage.getItem(STORAGE_KEY_REALTIME_GEOFENCE_STATUS),
      AsyncStorage.getItem(STORAGE_KEY_WORKING_HOURS),
      AsyncStorage.getItem("@texxano_multi_geofences"),
    ]);

    _isTracking = tracking === "true";
    _storedLocations = locations ? JSON.parse(locations) : [];
    _logs = logs ? JSON.parse(logs) : [];
    _isLoggerEnabled = loggerEnabled === "true";
    
    // Restore legacy single geofence state
    if (geofenceStr) {
      _realtimeGeofence = JSON.parse(geofenceStr);
    }
    if (geofenceStatusStr) {
      const status = JSON.parse(geofenceStatusStr);
      _isInsideGeofence = status.isInside || false;
      
      // Restore multi-geofence inside status
      if (status.insideGeofences) {
        _insideGeofences = new Map(Object.entries(status.insideGeofences));
      }
    }
    
    // Restore multiple geofences
    if (multiGeofencesStr) {
      _realtimeGeofences = JSON.parse(multiGeofencesStr);
    }
    
    // Restore working hours config
    if (workingHoursStr) {
      _workingHours = JSON.parse(workingHoursStr);
    }
    
    // Start working hours checker if enabled
    if (_workingHours.enabled) {
      startWorkingHoursChecker();
    }

    // Verify actual tracking status with expo-location
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    if (_isTracking !== hasStarted) {
      _isTracking = hasStarted;
      await AsyncStorage.setItem(STORAGE_KEY_TRACKING, String(_isTracking));
    }
  } catch (error) {
    console.log("⚠️ Error initializing location module state:", error);
  }
}

// Initialize on module load
initializeState();

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("❌ [BACKGROUND TASK] Error:", error.message);
    dbLog("TASK_ERROR", error.message);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    
    // Load active track data from storage (needed for background)
    try {
      // CRITICAL: Initialize SharedTrackingState FIRST so cooldown checks work
      // Without this, isInStopCooldown() returns false because _isWorkTimeStarted is false
      await SharedTrackingState.initializeTrackingState();
      
      const storedTrack = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_TRACK);
      if (storedTrack) {
        _activeTrackData = JSON.parse(storedTrack);
      }
      // Also load geofence data
      const storedGeofence = await AsyncStorage.getItem(STORAGE_KEY_REALTIME_GEOFENCE);
      if (storedGeofence) {
        _realtimeGeofence = JSON.parse(storedGeofence);
      }
      const storedStatus = await AsyncStorage.getItem(STORAGE_KEY_REALTIME_GEOFENCE_STATUS);
      if (storedStatus) {
        const status = JSON.parse(storedStatus);
        _isInsideGeofence = status.isInside || false;
        if (status.insideGeofences) {
          _insideGeofences = new Map(Object.entries(status.insideGeofences));
        }
      }
      
      // Also load project ID
      const storedProjectId = await AsyncStorage.getItem(STORAGE_KEY_PROJECT_ID);
      if (storedProjectId) {
        _globalProjectId = storedProjectId;
      }
    } catch (e) {
      console.log("Error loading state in background task:", e);
    }
    
    for (const location of locations) {
      const accuracy = location.coords.accuracy || 999;
      
      // Filter out inaccurate locations in background too
      if (accuracy > MIN_ACCURACY_THRESHOLD) {
        dbLog("LOCATION_SKIP", `[BG] Accuracy too low: ${accuracy.toFixed(0)}m`);
        continue;
      }
      
      const locationData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
        moment: new Date(location.timestamp).toISOString(),
        device: Platform.OS,
        source: "background",
      };

      // Store location
      _storedLocations.push(locationData);
      
      // Keep only last 1000 locations in memory
      if (_storedLocations.length > 1000) {
        _storedLocations = _storedLocations.slice(-1000);
      }

      // Notify listeners
      _locationListeners.forEach((listener) => {
        try {
          listener(locationData);
        } catch (e) {
          console.log("Error in location listener:", e);
        }
      });

      dbLog("LOCATION_BG", `lat: ${locationData.latitude.toFixed(6)}, lng: ${locationData.longitude.toFixed(6)}`);
      
      // ⭐ CHECK GEOFENCE IN BACKGROUND - This is critical for STOP detection!
      checkGeofence(locationData.latitude, locationData.longitude);
    }

    // Persist to storage
    await AsyncStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(_storedLocations));
  }
});

// Helper to notify tracking status listeners
function notifyTrackingStatusChange(status: boolean) {
  _trackingStatusListeners.forEach((listener) => {
    try {
      listener({ status });
    } catch (e) {
      console.log("Error in tracking status listener:", e);
    }
  });
}

// Helper to save tracking state
async function saveTrackingState(isTracking: boolean) {
  _isTracking = isTracking;
  await AsyncStorage.setItem(STORAGE_KEY_TRACKING, String(isTracking));
  notifyTrackingStatusChange(isTracking);
}

// ============ PUBLIC API ============

export function isNativeLocationModuleLoaded(): boolean {
  // Always return true since we're using expo-location which is always available
  return true;
}

export async function stopLocationUpdates(): Promise<void> {
  try {
    // Stop foreground subscription
    if (_foregroundSubscription) {
      _foregroundSubscription.remove();
      _foregroundSubscription = null;
      dbLog("TRACKING", "Foreground location subscription stopped");
    }

    // Stop background task
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      dbLog("TRACKING", "Background location updates stopped");
    }
    await saveTrackingState(false);
    dbLog("TRACKING", "Location updates stopped");
  } catch (error) {
    console.log("Error stopping location updates:", error);
    dbLog("ERROR", `Stop location updates failed: ${error}`);
  }
}

/**
 * Check if tracking should be running and restart if needed
 * Called when app returns from background to ensure tracking is active
 */
export async function checkAndRestartTracking(): Promise<void> {
  try {
    // Only restart if we have a geofence set (meaning user should be tracking)
    if (!_realtimeGeofence && _realtimeGeofences.length === 0) {
      return;
    }

    // Check if background task is still running
    const bgRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    
    // Check foreground subscription
    const fgRunning = _foregroundSubscription !== null;
    
    dbLog("TRACKING_CHECK", `Background: ${bgRunning}, Foreground: ${fgRunning}`);
    
    // If background tracking stopped, restart it
    if (!bgRunning) {
      console.log("⚠️ Background tracking stopped, restarting...");
      dbLog("TRACKING_RESTART", "Background tracking was stopped, restarting");
      await startLocationUpdates();
    } else if (!fgRunning) {
      // Background is fine but foreground subscription lost - restart foreground
      console.log("⚠️ Foreground subscription lost, restarting...");
      dbLog("TRACKING_RESTART", "Foreground subscription lost, restarting");
      
      // 🔋 BATTERY OPTIMIZED: Use same settings as initial foreground start
      _foregroundSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // 🔋 Changed from High to Balanced
          timeInterval: 30000, // 🔋 30 seconds (was 5 seconds)
          distanceInterval: 30, // 🔋 30 meters (was 5 meters)
        },
        (location) => {
          processLocationUpdate(location, "foreground-restart");
        }
      );
    }
    
    // Also restart periodic check if it stopped
    if (!_periodicGeofenceCheckInterval && (_realtimeGeofence || _realtimeGeofences.length > 0)) {
      console.log("⚠️ Periodic geofence check stopped, restarting...");
      startPeriodicGeofenceCheck();
    }
    
    // Do an immediate geofence check
    await performPeriodicGeofenceCheck();
    
  } catch (error: any) {
    console.log("Error checking/restarting tracking:", error);
    dbLog("ERROR", `Check/restart tracking failed: ${error}`);
    
    // Check if this is a permission error
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes('Not authorized') || errorMessage.includes('permission')) {
      setLocationPermissionError(true);
    }
  }
}

// ============================================
// GPS PROVIDER STATUS MONITORING
// Detects when GPS is turned on/off and triggers geofence check
// ============================================
let _gpsStatusCheckInterval: NodeJS.Timeout | null = null;
let _lastGpsEnabled: boolean | null = null;

/**
 * Check if GPS/Location services are enabled
 */
async function isGpsEnabled(): Promise<boolean> {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (e) {
    console.log("Error checking GPS status:", e);
    return false;
  }
}

/**
 * Handle GPS status change - called when GPS is turned on/off
 */
async function handleGpsStatusChange(isEnabled: boolean): Promise<void> {
  console.log(`📡 GPS STATUS CHANGED: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
  dbLog("GPS_STATUS", `GPS ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
  
  if (isEnabled) {
    // GPS was just enabled - wait a moment for GPS to stabilize, then check geofence
    dbLog("GPS_STATUS", "Waiting for GPS to stabilize...");
    
    // Wait 2 seconds for GPS to get a fix
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check and restart tracking if needed
    await checkAndRestartTracking();
    
    // Force an immediate geofence check with fresh location
    dbLog("GPS_STATUS", "Performing immediate geofence check after GPS enabled");
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      dbLog("GPS_STATUS", `GPS fix acquired: accuracy ${location.coords.accuracy?.toFixed(0)}m`);
      
      // Check geofence with this location
      checkGeofence(location.coords.latitude, location.coords.longitude);
    } catch (e) {
      dbLog("GPS_STATUS", `Failed to get location: ${e}`);
    }
  } else {
    // GPS was disabled - log it
    dbLog("GPS_STATUS", "GPS disabled - geofencing paused");
  }
}

/**
 * Periodic check for GPS status changes
 */
async function checkGpsStatusPeriodically(): Promise<void> {
  const isEnabled = await isGpsEnabled();
  
  // Only trigger on actual change (not first check)
  if (_lastGpsEnabled !== null && isEnabled !== _lastGpsEnabled) {
    await handleGpsStatusChange(isEnabled);
  }
  
  _lastGpsEnabled = isEnabled;
}

/**
 * Start monitoring GPS provider status
 * Checks every 5 seconds if GPS is enabled/disabled
 */
export function startGpsStatusMonitoring(): void {
  if (_gpsStatusCheckInterval) {
    clearInterval(_gpsStatusCheckInterval);
  }
  
  // Initialize the last known state
  isGpsEnabled().then(enabled => {
    _lastGpsEnabled = enabled;
    dbLog("GPS_STATUS", `Monitoring started - GPS is ${enabled ? 'ENABLED' : 'DISABLED'}`);
  });
  
  // 🔋 BATTERY OPTIMIZED: Check every 5 minutes for GPS status changes (was 60 sec)
  _gpsStatusCheckInterval = setInterval(() => {
    checkGpsStatusPeriodically();
  }, 300000); // 300 seconds (5 minutes) - reduced from 60 sec for battery saving
}

/**
 * Stop monitoring GPS provider status
 */
export function stopGpsStatusMonitoring(): void {
  if (_gpsStatusCheckInterval) {
    clearInterval(_gpsStatusCheckInterval);
    _gpsStatusCheckInterval = null;
    _lastGpsEnabled = null;
    dbLog("GPS_STATUS", "Monitoring stopped");
  }
}

// Minimum accuracy threshold - ignore locations with worse accuracy
const MIN_ACCURACY_THRESHOLD = 50; // meters - ignore locations with accuracy > 50m

// Helper function to process a location update
function processLocationUpdate(location: Location.LocationObject, source: string) {
  const accuracy = location.coords.accuracy || 999;
  
  // Filter out inaccurate locations
  if (accuracy > MIN_ACCURACY_THRESHOLD) {
    dbLog("LOCATION_SKIP", `Accuracy too low: ${accuracy.toFixed(0)}m`);
    return null;
  }

  const locationData = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude: location.coords.altitude,
    accuracy: location.coords.accuracy,
    speed: location.coords.speed,
    heading: location.coords.heading,
    timestamp: location.timestamp,
    moment: new Date(location.timestamp).toISOString(),
    device: Platform.OS,
    source: source,
  };

  // Store location
  _storedLocations.push(locationData);
  
  // Keep only last 1000 locations in memory
  if (_storedLocations.length > 1000) {
    _storedLocations = _storedLocations.slice(-1000);
  }

  // Notify listeners
  _locationListeners.forEach((listener) => {
    try {
      listener(locationData);
    } catch (e) {
      console.log("Error in location listener:", e);
    }
  });

  dbLog("LOCATION", `lat: ${locationData.latitude.toFixed(6)}, lng: ${locationData.longitude.toFixed(6)} (${source})`);

  // CHECK REAL-TIME GEOFENCE
  checkGeofence(locationData.latitude, locationData.longitude);

  // Persist to storage async
  AsyncStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(_storedLocations));

  return locationData;
}

export async function startLocationUpdates(): Promise<void> {
  try {
    // Check permissions first
    let { status: foreground } = await Location.getForegroundPermissionsAsync();
    let { status: background } = await Location.getBackgroundPermissionsAsync();

    dbLog("PERMISSIONS", `foreground: ${foreground}, background: ${background}`);

    // Request foreground permission if not granted
    if (foreground !== "granted") {
      const result = await Location.requestForegroundPermissionsAsync();
      foreground = result.status;
      dbLog("PERMISSIONS", `Foreground permission request result: ${foreground}`);
    }

    if (foreground !== "granted") {
      console.log("❌ Foreground location permission denied");
      dbLog("PERMISSIONS", "Foreground permission denied - cannot start tracking");
      Alert.alert(
        "Permission Required",
        "Location permission is required for GPS tracking. Please enable it in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Open Settings", 
            onPress: () => openAppSettings()
          }
        ]
      );
      return;
    }

    // Request background permission if not granted (critical for background tracking!)
    if (background !== "granted") {
      const result = await Location.requestBackgroundPermissionsAsync();
      background = result.status;
      dbLog("PERMISSIONS", `Background permission request result: ${background}`);
      
      if (background !== "granted") {
        dbLog("PERMISSIONS", "Background permission denied - limited tracking");
        // Don't return - we can still do foreground tracking
        Alert.alert(
          "Limited Tracking",
          "Background location permission was not granted. GPS tracking will only work when the app is open.\n\nFor automatic time tracking, please enable 'Always' or 'Allow all the time' location access in Settings.",
          [
            { text: "Later", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => openAppSettings()
            }
          ]
        );
      }
    }

    // Get immediate location first
    dbLog("TRACKING", "Getting current location...");
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      processLocationUpdate(currentLocation, "initial");
      dbLog("TRACKING", "Got initial location successfully");
    } catch (initialError) {
      dbLog("WARNING", `Could not get initial location: ${initialError}`);
    }

    // Start foreground location watching (works while app is open)
    // 🔋 BATTERY OPTIMIZED: Reduced frequency - was 5 sec, now 30 sec
    dbLog("TRACKING", "Starting foreground watch...");
    _foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced, // 🔋 Changed from High to Balanced
        timeInterval: 30000, // 🔋 30 seconds (was 5 seconds) - major battery saver!
        distanceInterval: 30, // 🔋 30 meters (was 5 meters)
      },
      (location) => {
        processLocationUpdate(location, "foreground");
      }
    );
    dbLog("TRACKING", "Foreground location watching started");

    // Also start background task if we have background permission
    if (background === "granted") {
      try {
        // Check if background task is already running
        const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
        
        if (isRunning) {
          dbLog("TRACKING", "Background location updates already running");
        } else {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Balanced, // Balanced for better battery
            timeInterval: 120000, // 🔋 2 minutes (was 30 seconds) - major battery saver!
            distanceInterval: 50, // 🔋 50 meters (was 20 meters)
            foregroundService: {
              notificationTitle: "Texxano",
              notificationBody: "",
              notificationColor: "#2196F3",
            },
            // Critical settings for background operation
            pausesUpdatesAutomatically: true, // 🔋 Allow OS to pause when stationary
            showsBackgroundLocationIndicator: true,
            activityType: Location.ActivityType.Other,
            // iOS specific - important for background
            deferredUpdatesInterval: 120000, // 🔋 2 minutes (was 30 seconds)
            deferredUpdatesDistance: 50, // 🔋 50 meters (was 20 meters)
          });
          dbLog("TRACKING", "Background location updates started");
        }
      } catch (bgError) {
        console.log("❌ Background task failed:", bgError);
        dbLog("WARNING", `Background task failed (app will only track in foreground): ${bgError}`);
      }
    } else {
      console.log("⚠️ No background permission - only tracking in foreground");
      dbLog("WARNING", "No background permission - only tracking in foreground");
    }

    await saveTrackingState(true);
    dbLog("TRACKING", "Location updates started successfully");
  } catch (error) {
    console.log("Error starting location updates:", error);
    dbLog("ERROR", `Start location updates failed: ${error}`);
    Alert.alert("Error", "Failed to start location tracking: " + error);
  }
}

export function setTrackingConfig(config: object): string {
  // Config is applied when starting location updates
  // Store config for next start if needed
  dbLog("CONFIG", JSON.stringify(config));
  return "ok";
}

export async function toggleLocationUpdates(): Promise<number> {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    
    if (hasStarted) {
      await stopLocationUpdates();
      return 0; // Stopped
    } else {
      await startLocationUpdates();
      return 1; // Started
    }
  } catch (error) {
    console.log("Error toggling location updates:", error);
    dbLog("ERROR", `Toggle location updates failed: ${error}`);
    return _isTracking ? 1 : 0;
  }
}

export function isTrackingLocation(): number {
  return _isTracking ? 1 : 0;
}

export async function isTrackingLocationAsync(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch {
    return false;
  }
}

/**
 * Get comprehensive tracking diagnostics
 * Useful for debugging why background tracking might not work
 */
export async function getTrackingDiagnostics(): Promise<{
  foregroundPermission: string;
  backgroundPermission: string;
  gpsEnabled: boolean;
  backgroundTaskRunning: boolean;
  foregroundSubscriptionActive: boolean;
  geofenceSet: boolean;
  geofenceName: string | null;
  isInsideGeofence: boolean;
  activeTrackId: string | null;
  lastLocationTime: string | null;
  storedLocationsCount: number;
}> {
  try {
    const { status: foreground } = await Location.getForegroundPermissionsAsync();
    const { status: background } = await Location.getBackgroundPermissionsAsync();
    const gpsEnabled = await Location.hasServicesEnabledAsync();
    const bgRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
    
    const lastLocation = _storedLocations.length > 0 ? _storedLocations[_storedLocations.length - 1] : null;
    
    const diagnostics = {
      foregroundPermission: foreground,
      backgroundPermission: background,
      gpsEnabled,
      backgroundTaskRunning: bgRunning,
      foregroundSubscriptionActive: _foregroundSubscription !== null,
      geofenceSet: _realtimeGeofence !== null || _realtimeGeofences.length > 0,
      geofenceName: _realtimeGeofence?.name || null,
      isInsideGeofence: _isInsideGeofence,
      activeTrackId: _activeTrackData?.id || null,
      lastLocationTime: lastLocation?.moment || null,
      storedLocationsCount: _storedLocations.length,
    };
    
    console.log("📊 Tracking diagnostics:", diagnostics);
    dbLog("DIAGNOSTICS", JSON.stringify(diagnostics));
    
    return diagnostics;
  } catch (e) {
    console.log("Error getting diagnostics:", e);
    return {
      foregroundPermission: "error",
      backgroundPermission: "error",
      gpsEnabled: false,
      backgroundTaskRunning: false,
      foregroundSubscriptionActive: false,
      geofenceSet: false,
      geofenceName: null,
      isInsideGeofence: false,
      activeTrackId: null,
      lastLocationTime: null,
      storedLocationsCount: 0,
    };
  }
}

export function deleteLocationUpdates(objectIds: string[]): boolean {
  try {
    _storedLocations = _storedLocations.filter(
      (loc) => !objectIds.includes(loc.id)
    );
    AsyncStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(_storedLocations));
    dbLog("DELETE", `Deleted ${objectIds.length} locations`);
    return true;
  } catch (error) {
    console.log("Error deleting locations:", error);
    return false;
  }
}

export function getAllStoredLocations(): Array<object> {
  return [..._storedLocations];
}

export async function getAllStoredLocationsAsync(): Promise<Array<object>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_LOCATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function enableDBLogger(): void {
  _isLoggerEnabled = true;
  AsyncStorage.setItem(STORAGE_KEY_LOGGER_ENABLED, "true");
}

export function disableDBLogger(): void {
  _isLoggerEnabled = false;
  AsyncStorage.setItem(STORAGE_KEY_LOGGER_ENABLED, "false");
}

export function isDBLoggerEnabled(): boolean {
  return _isLoggerEnabled;
}

export function deleteAllDBLogs(): void {
  _logs = [];
  AsyncStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(_logs));
}

export function dbLog(tag: string, message: string): void {
  // Always log LOCATION, ERROR, TRACKING, PERMISSIONS, WARNING
  const alwaysLogTags = ["ERROR", "TRACKING", "LOCATION", "PERMISSIONS", "WARNING"];
  if (!_isLoggerEnabled && !alwaysLogTags.includes(tag)) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    tag,
    message,
  };

  _logs.push(logEntry);

  // Keep only last 500 logs
  if (_logs.length > 500) {
    _logs = _logs.slice(-500);
  }

  // Persist async
  AsyncStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(_logs));

  // Always console.log in dev
  console.log(`[${tag}] ${message}`);
}

export function getAllDBLogs(): Array<{ timestamp: string; tag: string; message: string }> {
  return [..._logs];
}

export async function copyLatestLogsOnClipboard(): Promise<void> {
  const latestLogs = _logs.slice(-50);
  const logText = latestLogs
    .map((log) => `[${log.timestamp}] [${log.tag}] ${log.message}`)
    .join("\n");

  await Clipboard.setStringAsync(logText);
  Alert.alert("Copied", "Latest 50 logs copied to clipboard");
}

export function addOnLocationUpdatedListener(
  listener: (event: object) => void
): { remove: () => void } {
  _locationListeners.push(listener);
  return {
    remove: () => {
      _locationListeners = _locationListeners.filter((l) => l !== listener);
    },
  };
}

export function addOnLocationTrackingStatusUpdatedListener(
  listener: (event: { status: boolean }) => void
): { remove: () => void } {
  _trackingStatusListeners.push(listener);

  // Immediately notify with current status
  setTimeout(() => listener({ status: _isTracking }), 0);

  return {
    remove: () => {
      _trackingStatusListeners = _trackingStatusListeners.filter((l) => l !== listener);
    },
  };
}

// ============ REAL-TIME GEOFENCE API ============

/**
 * Set a geofence region for real-time monitoring
 * This will check the geofence on every location update - NO DELAY!
 */
export async function setRealtimeGeofence(region: {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}): Promise<void> {
  // Check if this is a NEW geofence (different ID) - only then reset state
  const isNewGeofence = !_realtimeGeofence || _realtimeGeofence.id !== region.id;
  
  _realtimeGeofence = region;
  
  // Only reset inside state for NEW geofences, not re-setting the same one
  // This prevents duplicate START events when the same geofence is set multiple times
  if (isNewGeofence && !_insideGeofences.has(region.id)) {
    _insideGeofences.set(region.id, false);
    _isInsideGeofence = false;
    
    // Sync active track with server when new geofence is set
    await syncActiveTrackWithServer();
  }
  
  await AsyncStorage.setItem(STORAGE_KEY_REALTIME_GEOFENCE, JSON.stringify(region));
  
  // Check current position immediately
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      checkGeofence(location.coords.latitude, location.coords.longitude);
      
      // NOTE: Auto-start is handled by setMultipleGeofences() to avoid duplicate START calls
    }
  } catch (e) {
    console.log("Could not check initial geofence position:", e);
  }
  
  dbLog("GEOFENCE", `Set region: ${region.name} at ${region.latitude}, ${region.longitude}`);
  
  // Start periodic geofence check as backup
  startPeriodicGeofenceCheck();
}

/**
 * Periodic geofence check - runs every 30 seconds as backup
 * This ensures geofence is checked even if location subscription fails
 */
async function performPeriodicGeofenceCheck(): Promise<void> {
  if (!_realtimeGeofence && _realtimeGeofences.length === 0) return;
  
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return;
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    checkGeofence(location.coords.latitude, location.coords.longitude);
  } catch (e) {
    console.log("Periodic geofence check failed:", e);
  }
}

/**
 * Start periodic geofence checking
 * 🔋 BATTERY OPTIMIZED: Changed from 30 seconds to 3 minutes
 */
function startPeriodicGeofenceCheck(): void {
  if (_periodicGeofenceCheckInterval) {
    clearInterval(_periodicGeofenceCheckInterval);
  }
  
  // 🔋 BATTERY OPTIMIZED: Check every 3 minutes instead of 30 seconds
  _periodicGeofenceCheckInterval = setInterval(() => {
    performPeriodicGeofenceCheck();
  }, 180000); // 🔋 3 minutes (was 30 seconds)
  
  dbLog("GEOFENCE", "Periodic check started - 3 min interval");
}

/**
 * Stop periodic geofence checking
 */
function stopPeriodicGeofenceCheck(): void {
  if (_periodicGeofenceCheckInterval) {
    clearInterval(_periodicGeofenceCheckInterval);
    _periodicGeofenceCheckInterval = null;
  }
}

/**
 * Clear the real-time geofence
 */
export async function clearRealtimeGeofence(): Promise<void> {
  _realtimeGeofence = null;
  _isInsideGeofence = false;
  stopPeriodicGeofenceCheck();
  await AsyncStorage.removeItem(STORAGE_KEY_REALTIME_GEOFENCE);
  await AsyncStorage.removeItem(STORAGE_KEY_REALTIME_GEOFENCE_STATUS);
  dbLog("GEOFENCE", "Cleared");
}

/**
 * Get the current real-time geofence region
 */
export function getRealtimeGeofence(): RealtimeGeofenceRegion | null {
  return _realtimeGeofence;
}

/**
 * Check if currently inside the geofence
 */
export function isInsideRealtimeGeofence(): boolean {
  return _isInsideGeofence;
}

/**
 * Add listener for real-time geofence events (START/STOP)
 * Events are triggered on every location update - no iOS delay!
 */
export function addRealtimeGeofenceListener(
  callback: RealtimeGeofenceCallback
): { remove: () => void } {
  _geofenceCallbacks.push(callback);
  
  return {
    remove: () => {
      _geofenceCallbacks = _geofenceCallbacks.filter((c) => c !== callback);
    },
  };
}

/**
 * Get distance from current location to geofence center
 */
export async function getDistanceToGeofence(): Promise<number | null> {
  if (!_realtimeGeofence) return null;
  
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return null;
    
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      _realtimeGeofence.latitude,
      _realtimeGeofence.longitude
    );
  } catch (e) {
    console.log("Error getting distance to geofence:", e);
    return null;
  }
}

/**
 * Get current adaptive tracking info
 */
export function getAdaptiveTrackingInfo(): {
  currentInterval: number;
  lastDistance: number | null;
  thresholds: typeof ADAPTIVE_THRESHOLDS;
} {
  return {
    currentInterval: _currentTrackingInterval,
    lastDistance: _lastDistanceToGeofence,
    thresholds: ADAPTIVE_THRESHOLDS,
  };
}

// ============ MULTI-LOCATION GEOFENCE API ============

const STORAGE_KEY_MULTI_GEOFENCES = "@texxano_multi_geofences";

/**
 * Set multiple geofence regions from API/backend
 * Employee can be registered at multiple client locations
 */
export async function setMultipleGeofences(regions: RealtimeGeofenceRegion[]): Promise<void> {
  // Guard against concurrent/duplicate initialization
  if (_isInitializingGeofences) {
    console.log('⚠️ Geofence initialization already in progress - SKIPPING');
    return;
  }
  
  // Set flag immediately to block concurrent calls
  _isInitializingGeofences = true;
  
  try {
    console.log(`🏢 Setting up ${regions.length} geofence regions`);
  
  // Get current region IDs to check for changes
  const currentIds = new Set(_realtimeGeofences.map(r => r.id));
  const newIds = new Set(regions.map(r => r.id));
  
  // Check if the regions are actually different
  const isSameRegions = currentIds.size === newIds.size && 
    [...currentIds].every(id => newIds.has(id));
  
  if (isSameRegions && _realtimeGeofences.length > 0) {
    // Just update the regions data but keep the inside state
    _realtimeGeofences = regions;
    await AsyncStorage.setItem(STORAGE_KEY_MULTI_GEOFENCES, JSON.stringify(regions));
    
    // Still check for auto-start even with same geofences (user might have cleared cache)
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        
        // Run geofence check to update _insideGeofences map
        checkGeofence(location.coords.latitude, location.coords.longitude);
        
        // AUTO-START: If inside any geofence and not tracking, start automatically
        const isInsideAny = Array.from(_insideGeofences.values()).some(inside => inside);
        
        if (isInsideAny) {
          // Always call handleGeofenceApiCall — it verifies with backend before starting
          const insideGeofence = regions.find(r => _insideGeofences.get(r.id));
          if (insideGeofence) {
            await handleGeofenceApiCall("START", insideGeofence);
          }
        }
      }
    } catch (e) {
      console.log("Could not check auto-start:", e);
    }
    
    return; // Skip re-checking position to avoid duplicate events
  }
  
  _realtimeGeofences = regions;
  
  // Only initialize NEW geofences, keep existing state for known ones
  regions.forEach(region => {
    if (!_insideGeofences.has(region.id)) {
      _insideGeofences.set(region.id, false);
    }
  });
  
  // Remove old geofences that are no longer in the list
  for (const id of _insideGeofences.keys()) {
    if (!newIds.has(id)) {
      _insideGeofences.delete(id);
    }
  }
  
  await AsyncStorage.setItem(STORAGE_KEY_MULTI_GEOFENCES, JSON.stringify(regions));
  
  // Check current position against all geofences immediately
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      checkGeofence(location.coords.latitude, location.coords.longitude);
      
      // AUTO-START: If inside any geofence and not tracking, start automatically
      const isInsideAny = Array.from(_insideGeofences.values()).some(inside => inside);
      
      if (isInsideAny) {
        // Always call handleGeofenceApiCall — it verifies with backend before starting
        const insideGeofence = regions.find(r => _insideGeofences.get(r.id));
        if (insideGeofence) {
          await handleGeofenceApiCall("START", insideGeofence);
        }
      }
    }
  } catch (e) {
    console.log("Could not check initial multi-geofence positions:", e);
  }
  
  dbLog("GEOFENCE", `Set ${regions.length} locations: ${regions.map(r => r.name).join(", ")}`);
  } finally {
    // Always reset flag, even if there was an error
    _isInitializingGeofences = false;
  }
}

/**
 * Add a single geofence to the list
 */
export async function addGeofenceRegion(region: RealtimeGeofenceRegion): Promise<void> {
  // Check if region already exists
  const existingIndex = _realtimeGeofences.findIndex(g => g.id === region.id);
  if (existingIndex >= 0) {
    // Update existing
    _realtimeGeofences[existingIndex] = region;
  } else {
    // Add new
    _realtimeGeofences.push(region);
    _insideGeofences.set(region.id, false);
  }
  
  await AsyncStorage.setItem(STORAGE_KEY_MULTI_GEOFENCES, JSON.stringify(_realtimeGeofences));
  
  dbLog("GEOFENCE", `Added: ${region.name} at ${region.latitude}, ${region.longitude}`);
}

/**
 * Remove a geofence from the list
 */
export async function removeGeofenceRegion(regionId: string): Promise<void> {
  _realtimeGeofences = _realtimeGeofences.filter(g => g.id !== regionId);
  _insideGeofences.delete(regionId);
  
  await AsyncStorage.setItem(STORAGE_KEY_MULTI_GEOFENCES, JSON.stringify(_realtimeGeofences));
  
  dbLog("GEOFENCE", `Removed: ${regionId}`);
}

/**
 * Get all registered geofence regions
 */
export function getAllGeofences(): RealtimeGeofenceRegion[] {
  return [..._realtimeGeofences];
}

/**
 * Clear all geofence regions
 */
export async function clearAllGeofences(): Promise<void> {
  _realtimeGeofences = [];
  _insideGeofences.clear();
  
  // Also clear legacy single geofence
  _realtimeGeofence = null;
  _isInsideGeofence = false;
  
  await AsyncStorage.removeItem(STORAGE_KEY_MULTI_GEOFENCES);
  await AsyncStorage.removeItem(STORAGE_KEY_REALTIME_GEOFENCE);
  await AsyncStorage.removeItem(STORAGE_KEY_REALTIME_GEOFENCE_STATUS);
  
  dbLog("GEOFENCE", "All cleared");
}

/**
 * Reset geofence state (set all to "outside") without removing regions
 * Use this to fix stuck "inside" state
 */
export async function resetGeofenceState(): Promise<void> {
  // Set all geofences to "outside" state
  for (const geofence of _realtimeGeofences) {
    _insideGeofences.set(geofence.id, false);
  }
  if (_realtimeGeofence) {
    _insideGeofences.set(_realtimeGeofence.id, false);
  }
  _isInsideGeofence = false;
  
  // Clear persisted status
  await AsyncStorage.removeItem(STORAGE_KEY_REALTIME_GEOFENCE_STATUS);
  
  // Also clear active track to allow fresh START
  await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_TRACK);
  _activeTrackData = null;
  
  console.log("🔄 Geofence state reset - all set to OUTSIDE");
  dbLog("GEOFENCE", "State reset to OUTSIDE");
}

/**
 * Check if user is inside any geofence
 */
export function isInsideAnyGeofence(): boolean {
  for (const [, isInside] of _insideGeofences) {
    if (isInside) return true;
  }
  return _isInsideGeofence; // Check legacy single geofence too
}

/**
 * Check if user is currently inside any company geofence using a live GPS reading.
 * Use this for QR scan validation — avoids stale in-memory state.
 * Returns true if inside, false if outside or no geofences are configured.
 * Throws if location permission is denied.
 */
export async function isInsideAnyGeofenceLive(): Promise<boolean> {
  // No geofences configured at all — fail open so QR still works on day 1
  if (_realtimeGeofences.length === 0 && !_realtimeGeofence) {
    console.log('⚠️ [QR] No geofences configured — allowing QR scan');
    return true;
  }

  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('⚠️ [QR] Location permission not granted — allowing QR scan');
    return true; // Don't block user if they haven't granted location
  }

  // Use LAST KNOWN position for speed (instant vs 1-3 second GPS wait)
  // For QR scans inside a building, cached location is accurate enough
  let location = await Location.getLastKnownPositionAsync();
  
  // Fallback: if no cached location, get fresh one
  if (!location) {
    console.log('⚠️ [QR] No cached location, fetching fresh GPS fix...');
    location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  }

  const allGeofences = _realtimeGeofences.length > 0
    ? _realtimeGeofences
    : (_realtimeGeofence ? [_realtimeGeofence] : []);

  for (const region of allGeofences) {
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      region.latitude,
      region.longitude
    );
    if (distance <= region.radius) {
      console.log(`✅ [QR] Inside geofence "${region.name}" (${Math.round(distance)}m / ${region.radius}m)`);
      return true;
    }
    console.log(`📍 [QR] Outside geofence "${region.name}" (${Math.round(distance)}m from ${region.radius}m radius)`);
  }

  return false;
}

/**
 * Get list of geofences the user is currently inside
 */
export function getActiveGeofences(): RealtimeGeofenceRegion[] {
  const activeIds: string[] = [];
  for (const [id, isInside] of _insideGeofences) {
    if (isInside) activeIds.push(id);
  }
  
  // Add legacy single geofence if inside
  if (_isInsideGeofence && _realtimeGeofence && !activeIds.includes(_realtimeGeofence.id)) {
    activeIds.push(_realtimeGeofence.id);
  }
  
  return _realtimeGeofences.filter(g => activeIds.includes(g.id));
}

/**
 * Get geofence status for each registered region
 */
export function getGeofencesStatus(): Array<{
  region: RealtimeGeofenceRegion;
  isInside: boolean;
  distance: number | null;
}> {
  // We need current location to calculate distances
  // For now, return cached status without distance
  return _realtimeGeofences.map(region => ({
    region,
    isInside: _insideGeofences.get(region.id) || false,
    distance: null, // Distance is calculated on location update
  }));
}

/**
 * Get distances to all geofences from current location
 */
export async function getDistancesToAllGeofences(): Promise<Array<{
  region: RealtimeGeofenceRegion;
  distance: number;
  isInside: boolean;
}>> {
  if (_realtimeGeofences.length === 0) return [];
  
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return [];
    
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    
    return _realtimeGeofences.map(region => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        region.latitude,
        region.longitude
      );
      return {
        region,
        distance,
        isInside: distance <= region.radius,
      };
    }).sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)
  } catch (e) {
    console.log("Error getting distances to geofences:", e);
    return [];
  }
}

/**
 * Fetch and set geofence locations from backend API
 * Call this when user logs in or app starts
 * @param fetchFunction - Function that fetches locations from API (e.g., gpsWorkplaceServices.getEmployeeWorkplaces)
 */
export async function loadGeofencesFromAPI(
  fetchFunction: () => Promise<{ data?: Array<{
    id: string | number;
    name: string;
    latitude: number;
    longitude: number;
    radius?: number;
  }> }>
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log("📡 Fetching geofence locations from API...");
    dbLog("GEOFENCE_API", "Fetching locations from backend");
    
    const response = await fetchFunction();
    const locations = response?.data || [];
    
    if (!Array.isArray(locations)) {
      console.log("⚠️ API did not return array of locations");
      return { success: false, count: 0, error: "Invalid API response" };
    }
    
    // Transform API data to geofence regions
    const geofenceRegions: RealtimeGeofenceRegion[] = locations.map(loc => ({
      id: String(loc.id),
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      radius: loc.radius || 100, // Default 100m radius if not specified
    }));
    
    // Set the geofences
    await setMultipleGeofences(geofenceRegions);
    
    console.log(`✅ Loaded ${geofenceRegions.length} geofence locations from API`);
    dbLog("GEOFENCE_API", `Loaded ${geofenceRegions.length} locations: ${geofenceRegions.map(r => r.name).join(", ")}`);
    
    return { success: true, count: geofenceRegions.length };
  } catch (error) {
    console.log("❌ Error loading geofences from API:", error);
    dbLog("GEOFENCE_API_ERROR", `Failed to load: ${error}`);
    return { success: false, count: 0, error: String(error) };
  }
}

/**
 * Refresh geofences from API (alias for loadGeofencesFromAPI)
 */
export const refreshGeofencesFromAPI = loadGeofencesFromAPI;

// ============ WORKING HOURS API ============

/**
 * Set working hours configuration
 */
export async function setWorkingHours(config: {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  enabled: boolean;
}): Promise<void> {
  _workingHours = { ...config };
  await AsyncStorage.setItem(STORAGE_KEY_WORKING_HOURS, JSON.stringify(_workingHours));
  
  if (_workingHours.enabled) {
    startWorkingHoursChecker();
  } else {
    stopWorkingHoursChecker();
    _isPausedDueToWorkingHours = false;
  }
  
  console.log(`⏰ Working hours set: ${config.startHour}:${config.startMinute.toString().padStart(2, '0')} - ${config.endHour}:${config.endMinute.toString().padStart(2, '0')} (${config.enabled ? 'enabled' : 'disabled'})`);
  dbLog("WORKING_HOURS", `Set: ${config.startHour}:${config.startMinute.toString().padStart(2, '0')} - ${config.endHour}:${config.endMinute.toString().padStart(2, '0')}`);
}

/**
 * Get current working hours configuration
 */
export function getWorkingHours(): WorkingHoursConfig {
  return { ..._workingHours };
}

/**
 * Check if currently within working hours
 */
export function isCurrentlyWithinWorkingHours(): boolean {
  return isWithinWorkingHours();
}

/**
 * Check if tracking is paused due to working hours
 */
export function isTrackingPausedDueToWorkingHours(): boolean {
  return _isPausedDueToWorkingHours;
}

/**
 * Get working hours status info
 */
export function getWorkingHoursStatus(): {
  config: WorkingHoursConfig;
  isWithinHours: boolean;
  isPaused: boolean;
  timeUntilChange: { minutes: number; willStart: boolean };
  currentTime: string;
} {
  const now = new Date();
  return {
    config: { ..._workingHours },
    isWithinHours: isWithinWorkingHours(),
    isPaused: _isPausedDueToWorkingHours,
    timeUntilChange: getTimeUntilWorkingHoursChange(),
    currentTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
  };
}

/**
 * Enable working hours restriction
 */
export async function enableWorkingHours(): Promise<void> {
  _workingHours.enabled = true;
  await AsyncStorage.setItem(STORAGE_KEY_WORKING_HOURS, JSON.stringify(_workingHours));
  startWorkingHoursChecker();
  console.log("⏰ Working hours ENABLED");
  dbLog("WORKING_HOURS", "Enabled");
}

/**
 * Disable working hours restriction (tracking 24/7)
 */
export async function disableWorkingHours(): Promise<void> {
  _workingHours.enabled = false;
  _isPausedDueToWorkingHours = false;
  await AsyncStorage.setItem(STORAGE_KEY_WORKING_HOURS, JSON.stringify(_workingHours));
  stopWorkingHoursChecker();
  console.log("⏰ Working hours DISABLED (24/7 mode)");
  dbLog("WORKING_HOURS", "Disabled - 24/7 mode");
}

// ============ DEBUG MODAL ============

interface DebugModalProps {
  isVisible: boolean;
  onClose: () => void;
  react?: any;
}

export const LocationModuleDebugModal: React.FC<DebugModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [logs, setLogs] = React.useState(_logs);
  const [tracking, setTracking] = React.useState(_isTracking);
  const [locationCount, setLocationCount] = React.useState(_storedLocations.length);
  const [loggerEnabled, setLoggerEnabled] = React.useState(_isLoggerEnabled);

  React.useEffect(() => {
    if (isVisible) {
      setLogs([..._logs]);
      setTracking(_isTracking);
      setLocationCount(_storedLocations.length);
      setLoggerEnabled(_isLoggerEnabled);
    }
  }, [isVisible]);

  // Auto-refresh logs every 2 seconds when modal is visible
  React.useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setLogs([..._logs]);
        setTracking(_isTracking);
        setLocationCount(_storedLocations.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const handleToggleLogger = () => {
    if (_isLoggerEnabled) {
      disableDBLogger();
      setLoggerEnabled(false);
    } else {
      enableDBLogger();
      setLoggerEnabled(true);
      dbLog("LOGGER", "Logger enabled");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.headerText}>Location Debug</Text>
          </View>

          <View style={styles.statusRow}>
            <Text>Tracking: {tracking ? "✅ Active" : "⏹️ Stopped"}</Text>
            <Text>Locations: {locationCount}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: loggerEnabled ? "#FF9800" : "#9E9E9E" }]}
              onPress={handleToggleLogger}
            >
              <Text style={styles.buttonText}>{loggerEnabled ? "Logger ON" : "Logger OFF"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4CAF50" }]}
              onPress={() => {
                setLogs([..._logs]);
              }}
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#2196F3" }]}
              onPress={() => copyLatestLogsOnClipboard()}
            >
              <Text style={styles.buttonText}>Copy Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#f44336" }]}
              onPress={() => {
                deleteAllDBLogs();
                setLogs([]);
              }}
            >
              <Text style={styles.buttonText}>Clear Logs</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.logContainer}>
            {logs.slice(-30).reverse().map((log, index) => (
              <Text key={index} style={styles.logText}>
                [{log.tag}] {log.message}
              </Text>
            ))}
            {logs.length === 0 && (
              <Text style={styles.emptyText}>
                {loggerEnabled ? "No logs yet. Toggle GPS to see activity." : "Logger is OFF. Tap 'Logger OFF' button to enable."}
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 15,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  logContainer: {
    maxHeight: 300,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  logText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#333",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
});

// Default export for backward compatibility
const LocationModule = {
  toggleLocationUpdates,
  isTrackingLocation,
  isTrackingLocationAsync,
  startLocationUpdates,
  stopLocationUpdates,
  setTrackingConfig,
  deleteLocationUpdates,
  getAllStoredLocations,
  getAllStoredLocationsAsync,
  enableDBLogger,
  disableDBLogger,
  isDBLoggerEnabled,
  deleteAllDBLogs,
  dbLog,
  getAllDBLogs,
  copyLatestLogsOnClipboard,
  addOnLocationUpdatedListener,
  addOnLocationTrackingStatusUpdatedListener,
  // Real-time Geofence API
  setRealtimeGeofence,
  clearRealtimeGeofence,
  getRealtimeGeofence,
  isInsideRealtimeGeofence,
  addRealtimeGeofenceListener,
  getDistanceToGeofence,
  // Adaptive tracking API
  getAdaptiveTrackingInfo,
  // Working hours API
  setWorkingHours,
  getWorkingHours,
  isCurrentlyWithinWorkingHours,
  isTrackingPausedDueToWorkingHours,
  getWorkingHoursStatus,
  enableWorkingHours,
  disableWorkingHours,
  // Active track API (for preventing duplicate calls)
  getActiveTrackData,
  hasActiveTrackData,
  // Global project ID API
  setGlobalProjectId,
  getGlobalProjectId,
  // Geofence state reset
  resetGeofenceState,
  // Tracking restart (for app return from background)
  checkAndRestartTracking,
  // GPS status monitoring (detects when GPS is turned on/off)
  startGpsStatusMonitoring,
  stopGpsStatusMonitoring,
  // Diagnostics
  getTrackingDiagnostics,
  // Settings
  openAppSettings,
  // Location permission error handling
  hasLocationPermissionError,
  onLocationPermissionError,
  retryLocationPermission,
};

export default LocationModule;
