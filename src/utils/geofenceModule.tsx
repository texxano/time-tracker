/**
 * Geofence Module - Using expo-location geofencing
 * Detects when user enters/exits a defined region
 */

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import http from "../services/http";
import * as SharedTrackingState from './sharedTrackingState';

// Constants
const GEOFENCING_TASK_NAME = "texxano-geofencing-task";
const STORAGE_KEY_GEOFENCE = "@texxano_geofence_region";
const STORAGE_KEY_GEOFENCE_EVENTS = "@texxano_geofence_events";
const STORAGE_KEY_GEOFENCE_STATUS = "@texxano_geofence_status";
const STORAGE_KEY_ACTIVE_TRACK = "@texxano_active_track";
const STORAGE_KEY_PROJECT_ID = "@texxano_project_id";

// Active track type - stores the response from START API
type ActiveTrack = {
  id: string;
  start: string;
  isTracking: boolean;
  projectId: string | null;
  regionId: string;
  regionName: string;
  companyLocationId?: string | null;
} | null;

// Types
type GeofenceRegion = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  projectId?: string; // Project ID for time tracking
};

type GeofenceEvent = {
  id: string;
  regionId: string;
  regionName: string;
  eventType: "START" | "STOP";
  timestamp: string;
  latitude?: number;
  longitude?: number;
  synced: boolean;
};

type GeofenceStatus = {
  isMonitoring: boolean;
  currentlyInside: boolean;
  lastEvent?: GeofenceEvent;
};

// ============================================
// API RESPONSE TYPE
// ============================================
type CompanyLocationResponse = {
  id: string;
  companyId: string;
  street: string;
  streetNumber: string;
  address: string;
  city: string;
  country: string;
  type: string | null;
  isPrimary: boolean;
  latitude: number;
  longitude: number;
  parcel: Array<{
    latitude: number;
    longitude: number;
    order: number;
  }>;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
};

// Convert API response to GeofenceRegion format
function mapLocationToGeofenceRegion(location: CompanyLocationResponse): GeofenceRegion {
  return {
    id: location.id,
    name: location.address || `${location.street} ${location.streetNumber}`,
    latitude: location.centerLatitude || location.latitude,
    longitude: location.centerLongitude || location.longitude,
    radius: location.radiusMeters || 50, // Default 50m if not specified
    // projectId will be set from Redux (rootId)
  };
}

// Cached locations from API
let _cachedLocations: GeofenceRegion[] = [];

// За тестирање - стави ја твојата моментална локација
// Ова ќе го симулира "влегување" во регион
const getTestRegionAtCurrentLocation = async (): Promise<GeofenceRegion | null> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const location = await Location.getCurrentPositionAsync({});
    return {
      id: "test-region-001",
      name: "Test Region (Current Location)",
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      radius: 100,
    };
  } catch (error) {
    console.log("Error getting test region:", error);
    return null;
  }
};

// ============================================
// IN-MEMORY STATE
// ============================================
let _currentRegion: GeofenceRegion | null = null;
let _events: GeofenceEvent[] = [];
let _status: GeofenceStatus = {
  isMonitoring: false,
  currentlyInside: false,
};
let _statusListeners: ((status: GeofenceStatus) => void)[] = [];

// Active track state - prevents duplicate START/STOP calls
let _activeTrack: ActiveTrack = null;

// Global project ID - set from Redux via setGlobalProjectId()
let _globalProjectId: string | null = null;

// ============================================
// STABILIZATION PERIOD - Prevent false STOP after START
// ============================================
// After a START, ignore STOP events for this duration to prevent GPS inaccuracy issues
const STOP_COOLDOWN_MS = 180000; // 180 seconds (3 minutes) stabilization period
let _lastStartTime: number = 0; // Timestamp of last START

/**
 * Set the global project ID from Redux (userDataRole.rootId)
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
// ============================================
// INITIALIZE STATE FROM STORAGE
// ============================================
async function initializeState(): Promise<void> {
  try {
    const [regionStr, eventsStr, statusStr, activeTrackStr, projectIdStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_GEOFENCE),
      AsyncStorage.getItem(STORAGE_KEY_GEOFENCE_EVENTS),
      AsyncStorage.getItem(STORAGE_KEY_GEOFENCE_STATUS),
      AsyncStorage.getItem(STORAGE_KEY_ACTIVE_TRACK),
      AsyncStorage.getItem(STORAGE_KEY_PROJECT_ID),
    ]);

    if (regionStr) _currentRegion = JSON.parse(regionStr);
    if (eventsStr) _events = JSON.parse(eventsStr);
    if (statusStr) _status = JSON.parse(statusStr);
    if (activeTrackStr) _activeTrack = JSON.parse(activeTrackStr);
    if (projectIdStr) {
      _globalProjectId = projectIdStr;
    }
    
    // Sync with shared global state if tracking is active
    if (_activeTrack?.isTracking) {
      await SharedTrackingState.markWorkStarted(
        _activeTrack.id,
        _activeTrack.start,
        _activeTrack.companyLocationId || null
      );
    }

    // Verify actual geofencing status
    const isMonitoring = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME).catch(() => false);
    if (_status.isMonitoring !== isMonitoring) {
      _status.isMonitoring = isMonitoring;
      await saveStatus();
    }
  } catch (error) {
    console.log("⚠️ Error initializing geofence state:", error);
  }
}

// Initialize on module load
initializeState();

// ============================================
// BACKGROUND TASK DEFINITION
// ============================================
TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("Geofencing task error:", error);
    return;
  }

  if (data) {
    const { eventType, region } = data as {
      eventType: Location.GeofencingEventType;
      region: Location.LocationRegion;
    };

    // Find the correct region from cached locations using the event identifier
    const triggeredRegion = _cachedLocations.find(loc => loc.id === region.identifier) || _currentRegion;

    const event: GeofenceEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      regionId: region.identifier || "unknown",
      regionName: triggeredRegion?.name || "Unknown Region",
      eventType: eventType === Location.GeofencingEventType.Enter ? "START" : "STOP",
      timestamp: new Date().toISOString(),
      synced: false,
    };

    console.log(`🔔 Geofence Event: ${event.eventType} - ${event.regionName}`);

    // Update status
    _status.currentlyInside = eventType === Location.GeofencingEventType.Enter;
    _status.lastEvent = event;

    // Store event
    _events.push(event);
    if (_events.length > 100) {
      _events = _events.slice(-100);
    }

    // Save to storage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_GEOFENCE_EVENTS, JSON.stringify(_events)),
      saveStatus(),
    ]);

    // Notify listeners
    notifyStatusListeners();

    // Send to backend (TODO: Implement actual API call)
    await sendEventToBackend(event);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================
async function saveStatus(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_GEOFENCE_STATUS, JSON.stringify(_status));
}

function notifyStatusListeners(): void {
  _statusListeners.forEach((listener) => {
    try {
      listener({ ..._status });
    } catch (e) {
      console.log("Error in geofence status listener:", e);
    }
  });
}

// ============================================
// ACTIVE TRACK MANAGEMENT
// ============================================
async function saveActiveTrack(track: ActiveTrack): Promise<void> {
  _activeTrack = track;
  if (track) {
    await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_TRACK, JSON.stringify(track));
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_TRACK);
  }
}

export function getActiveTrack(): ActiveTrack {
  return _activeTrack;
}

export function hasActiveTrack(): boolean {
  return _activeTrack !== null && _activeTrack.isTracking === true;
}

// Working hours configuration (20:30 - 07:30 = quiet hours)
const WORKING_HOURS = {
  startHour: 7,
  startMinute: 30,
  endHour: 20,
  endMinute: 30,
};

/**
 * Check if current time is within working hours (07:30 - 20:30)
 * Returns false during quiet hours (20:30 - 07:30)
 */
function isWithinWorkingHours(): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = WORKING_HOURS.startHour * 60 + WORKING_HOURS.startMinute;
  const endMinutes = WORKING_HOURS.endHour * 60 + WORKING_HOURS.endMinute;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

async function sendEventToBackend(event: GeofenceEvent): Promise<void> {
  const triggeredRegion = _cachedLocations.find(loc => loc.id === event.regionId) || _currentRegion;
  console.log(`\n🎯 ${event.eventType} for "${triggeredRegion?.name || event.regionId}"`);

  try {
    if (event.eventType === "START") {
      // ── Step 0: Check working hours (20:30 - 07:30 = quiet hours)
      if (!isWithinWorkingHours()) {
        console.log("⚠️ SKIPPING START - Outside working hours (20:30 - 07:30 quiet period)");
        return;
      }
      
      // ── Step 1: If local state claims tracking is active, verify with backend FIRST.
      // acquireStartLock() checks _isWorkTimeStarted which is restored from AsyncStorage.
      // If backend stopped the track externally, local state is stale and must be
      // cleared BEFORE the lock — otherwise START is silently skipped forever.
      if (SharedTrackingState.isWorkActuallyStarted() || (_activeTrack && _activeTrack.isTracking)) {
        try {
          const verifyResponse = await http.get("/timetracker/tracks?page=1&PageSize=5");
          const tracks = verifyResponse?.data?.list || verifyResponse?.list || [];
          const serverHasActiveTrack = tracks.some((t: any) => t.isTracking === true);
          if (serverHasActiveTrack) {
            console.log("⚠️ SKIPPING START - Server confirms already tracking");
            return;
          }
          // Stale local state — clear it so the lock can proceed
          console.log("🔄 [GEOFENCE] Stale local state cleared (backend has no active track)");
          await saveActiveTrack(null);
          await SharedTrackingState.markWorkStopped();
        } catch (verifyError: any) {
          // Network error — can't verify, skip to avoid duplicate
          console.log("⚠️ Could not verify with backend:", verifyError?.message, "- skipping START");
          return;
        }
      }

      // ── Step 2: Acquire mutex to prevent concurrent START calls
      if (!SharedTrackingState.acquireStartLock()) {
        console.log("⚠️ SKIPPING START - START already in progress");
        return;
      }

      // Build query params for START API (backend expects query params, not JSON body)
      const params = new URLSearchParams();
      params.append('startedFromMobileApp', 'true');
      if (triggeredRegion?.id) {
        params.append('companyLocationId', triggeredRegion.id);
      }
               const payload = {
        projectId: null,
        description: null,

      };

      console.log(`🚀 Calling START API for location: ${triggeredRegion?.name}`);
      const response = await http.post(`/timetracker/tracks/start?${params.toString()}`, payload);

      const trackData: ActiveTrack = {
        id: response.data?.id || response.id || `local-${Date.now()}`,
        start: response.data?.start || response.start || new Date().toISOString(),
        isTracking: true,
        projectId: null,
        regionId: triggeredRegion?.id || "unknown",
        regionName: triggeredRegion?.name || "Unknown",
        companyLocationId: triggeredRegion?.id || null,
      };
      
      await saveActiveTrack(trackData);
      await SharedTrackingState.markWorkStarted(
        trackData.id,
        trackData.start,
        triggeredRegion?.id || null
      );
      
      // Set cooldown timestamp to prevent immediate false STOP from GPS inaccuracy
      _lastStartTime = Date.now();
      
      console.log(`✅ TIME TRACKING STARTED - Track: ${trackData.id}`);

    } else if (event.eventType === "STOP") {
      // Guard: skip STOP if no active track OR SharedTrackingState confirms not tracking.
      // Prevents spurious STOP after QR/manual stop left stale _activeTrack in memory.
      if (!_activeTrack || !_activeTrack.isTracking || !SharedTrackingState.isWorkActuallyStarted()) {
        console.log("⚠️ SKIPPING STOP - No active track");
        return;
      }

      // Guard: skip STOP if within cooldown period after START
      // This prevents GPS inaccuracy from triggering false STOP immediately after START
      // Check both local cooldown (geofence START) and SharedTrackingState cooldown (QR START)
      const localTimeSinceStart = Date.now() - _lastStartTime;
      const isInLocalCooldown = localTimeSinceStart < STOP_COOLDOWN_MS;
      const isInGlobalCooldown = SharedTrackingState.isInStopCooldown();
      
      if (isInLocalCooldown || isInGlobalCooldown) {
        const cooldownSource = isInGlobalCooldown ? 'global (QR/API)' : 'local (geofence)';
        const remaining = isInGlobalCooldown 
          ? SharedTrackingState.getStopCooldownRemaining() 
          : (STOP_COOLDOWN_MS - localTimeSinceStart);
        console.log(`⚠️ SKIPPING STOP - Within cooldown (${cooldownSource}), ${Math.round(remaining / 1000)}s remaining`);
        return;
      }

      // Build query params for STOP API (backend expects query params, not JSON body)
      const params = new URLSearchParams();
      params.append('startedFromMobileApp', 'false');
      if (_activeTrack.companyLocationId || triggeredRegion?.id) {
        params.append('companyLocationId', _activeTrack.companyLocationId || triggeredRegion?.id || '');
      }
      
      console.log(`🛑 Calling STOP API for track: ${_activeTrack.id}`);
      const payload = {
        projectId: null,
        description: null,
      };
      await http.post(`/timetracker/tracks/stop?${params.toString()}`, payload);
      
      await saveActiveTrack(null);
      await SharedTrackingState.markWorkStopped();
      
      console.log(`✅ TIME TRACKING STOPPED`);
    }

    const eventIndex = _events.findIndex((e) => e.id === event.id);
    if (eventIndex !== -1) {
      _events[eventIndex].synced = true;
      await AsyncStorage.setItem(STORAGE_KEY_GEOFENCE_EVENTS, JSON.stringify(_events));
    }
  } catch (error: any) {
    console.log(`❌ ${event.eventType} API FAILED:`, error);
    
    if (event.eventType === "START") {
      SharedTrackingState.releaseStartLock();
    }

    // If STOP fails with auth error, clear stale local track to stay in sync with server
    if (event.eventType === "STOP") {
      const errorMessage = error?.message || error?.toString() || "";
      const isAuthError = errorMessage.includes("Not.Authorized") ||
                          errorMessage.includes("401") ||
                          errorMessage.includes("403") ||
                          errorMessage.includes("User.Not.Authorized");
      if (isAuthError) {
        console.log("🧹 [GEOFENCE] Clearing stale track - server rejected STOP");
        await saveActiveTrack(null);
        await SharedTrackingState.markWorkStopped();
      }
    }
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Fetch geofence locations from backend API
 */
export async function fetchGeofenceLocations(): Promise<GeofenceRegion[]> {
  try {
    const response = await http.get("/company-locations/");
    const locations: CompanyLocationResponse[] = response.data || response;
    
    if (!locations || locations.length === 0) {
      console.log("⚠️ No company locations found");
      return [];
    }
    
    _cachedLocations = locations.map(mapLocationToGeofenceRegion);
    
    return _cachedLocations;
  } catch (error) {
    console.log("❌ Error fetching company locations:", error);
    return _cachedLocations; // Return cached if available
  }
}

/**
 * Get the first/primary geofence region
 */
export async function fetchGeofenceRegion(): Promise<GeofenceRegion | null> {
  if (_cachedLocations.length === 0) {
    await fetchGeofenceLocations();
  }
  return _cachedLocations[0] || null;
}

/**
 * Get all geofence regions from API
 */
export async function fetchAllGeofenceRegions(): Promise<GeofenceRegion[]> {
  if (_cachedLocations.length === 0) {
    await fetchGeofenceLocations();
  }
  return _cachedLocations;
}

/**
 * Alias for backward compatibility
 */
export function fetchAllDummyRegions(): GeofenceRegion[] {
  // Return cached locations, or empty array if not loaded yet
  return _cachedLocations;
}

/**
 * Get a test region at current location (for easy testing)
 */
export async function fetchTestRegionAtCurrentLocation(): Promise<GeofenceRegion | null> {
  return getTestRegionAtCurrentLocation();
}

/**
 * Set the geofence region to monitor
 */
export async function setGeofenceRegion(region: GeofenceRegion): Promise<void> {
  _currentRegion = region;
  await AsyncStorage.setItem(STORAGE_KEY_GEOFENCE, JSON.stringify(region));
}

/**
 * Get current geofence region
 */
export function getCurrentRegion(): GeofenceRegion | null {
  return _currentRegion;
}

/**
 * Start monitoring the geofence region
 */
export async function startGeofencing(): Promise<boolean> {
  try {
    if (!_currentRegion) {
      console.log("❌ No region set. Call setGeofenceRegion first.");
      return false;
    }

    // Check permissions
    const { status: foreground } = await Location.getForegroundPermissionsAsync();
    const { status: background } = await Location.getBackgroundPermissionsAsync();

    if (foreground !== "granted" || background !== "granted") {
      console.log("❌ Location permissions not granted");
      return false;
    }

    // Define the region to monitor
    const regions: Location.LocationRegion[] = [
      {
        identifier: _currentRegion.id,
        latitude: _currentRegion.latitude,
        longitude: _currentRegion.longitude,
        radius: _currentRegion.radius,
        notifyOnEnter: true,
        notifyOnExit: true,
      },
    ];

    // Start geofencing
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);

    _status.isMonitoring = true;
    await saveStatus();
    notifyStatusListeners();

    return true;
  } catch (error) {
    console.log("❌ Error starting geofencing:", error);
    return false;
  }
}

/**
 * Stop monitoring geofence
 */
export async function stopGeofencing(): Promise<void> {
  try {
    const isMonitoring = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
    if (isMonitoring) {
      await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
    }

    _status.isMonitoring = false;
    _status.currentlyInside = false;
    await saveStatus();
    notifyStatusListeners();
  } catch (error) {
    console.log("Error stopping geofencing:", error);
  }
}

/**
 * Check if geofencing is active
 */
export function isGeofencingActive(): boolean {
  return _status.isMonitoring;
}

/**
 * Get current status
 */
export function getGeofenceStatus(): GeofenceStatus {
  return { ..._status };
}

/**
 * Get all events
 */
export function getGeofenceEvents(): GeofenceEvent[] {
  return [..._events];
}

/**
 * Clear all events
 */
export async function clearGeofenceEvents(): Promise<void> {
  _events = [];
  await AsyncStorage.setItem(STORAGE_KEY_GEOFENCE_EVENTS, JSON.stringify(_events));
  notifyStatusListeners();
}

/**
 * Simulate a geofence event for testing
 * Use this to verify the UI and event storage works correctly
 */
export async function simulateGeofenceEvent(eventType: "START" | "STOP"): Promise<void> {
  if (!_currentRegion) {
    console.log("⚠️ No region set, cannot simulate event");
    return;
  }

  const event: GeofenceEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    regionId: _currentRegion.id,
    regionName: _currentRegion.name,
    eventType: eventType,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  // Update status
  _status.currentlyInside = eventType === "START";
  _status.lastEvent = event;

  // Store event
  _events.push(event);
  if (_events.length > 100) {
    _events = _events.slice(-100);
  }

  // Save to storage
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEY_GEOFENCE_EVENTS, JSON.stringify(_events)),
    saveStatus(),
  ]);

  // Notify listeners
  notifyStatusListeners();
}

/**
 * Refresh events from storage (force reload)
 */
export async function refreshEvents(): Promise<GeofenceEvent[]> {
  try {
    const eventsStr = await AsyncStorage.getItem(STORAGE_KEY_GEOFENCE_EVENTS);
    if (eventsStr) {
      _events = JSON.parse(eventsStr);
    }
    notifyStatusListeners();
    return [..._events];
  } catch (error) {
    console.log("Error refreshing events:", error);
    return [];
  }
}

/**
 * Add status listener
 */
export function addGeofenceStatusListener(
  listener: (status: GeofenceStatus) => void
): { remove: () => void } {
  _statusListeners.push(listener);

  // Immediately notify with current status
  setTimeout(() => listener({ ..._status }), 0);

  return {
    remove: () => {
      _statusListeners = _statusListeners.filter((l) => l !== listener);
    },
  };
}

/**
 * Sync any unsynced events to backend
 */
export async function syncPendingEvents(): Promise<number> {
  const unsyncedEvents = _events.filter((e) => !e.synced);
  let syncedCount = 0;

  for (const event of unsyncedEvents) {
    try {
      await sendEventToBackend(event);
      syncedCount++;
    } catch (error) {
      console.log("Failed to sync event:", event.id);
    }
  }

  return syncedCount;
}

// Default export
const GeofenceModule = {
  fetchGeofenceRegion,
  fetchAllDummyRegions,
  fetchGeofenceLocations,
  fetchAllGeofenceRegions,
  fetchTestRegionAtCurrentLocation,
  setGeofenceRegion,
  getCurrentRegion,
  startGeofencing,
  stopGeofencing,
  isGeofencingActive,
  getGeofenceStatus,
  getGeofenceEvents,
  clearGeofenceEvents,
  addGeofenceStatusListener,
  syncPendingEvents,
  simulateGeofenceEvent,
  refreshEvents,
  // Active track management
  getActiveTrack,
  hasActiveTrack,
  // Global project ID
  setGlobalProjectId,
  getGlobalProjectId,
};

export default GeofenceModule;
