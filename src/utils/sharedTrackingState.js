/**
 * Shared Tracking State
 * 
 * Global state to prevent duplicate START/STOP API calls
 * Used by locationModule, geofenceModule, and QR scanner
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// GLOBAL STATE
// ============================================
let _isWorkTimeStarted = false;
let _activeTrackId = null;
let _startedAt = null;
let _companyLocationId = null;
let _isStartInProgress = false; // Mutex to prevent concurrent START calls
let _lastStartLockAcquiredAt = 0; // Timestamp of last lock acquisition (debounce)
const START_DEBOUNCE_MS = 5000; // Cannot acquire lock twice within 5s

// ============================================
// STOP COOLDOWN - Prevents false STOP from GPS inaccuracy
// ============================================
const STOP_COOLDOWN_MS = 180000; // 180 seconds (3 minutes) stabilization after START
let _lastStartTimestamp = 0; // Timestamp of last START (any source)

const STORAGE_KEY = '@texxano:global_tracking_state';
// Shared with locationModule & geofenceModule — cleared on STOP to prevent spurious STOP calls
const STORAGE_KEY_ACTIVE_TRACK = '@texxano_active_track';

// ============================================
// INITIALIZATION
// ============================================

/**
 * Load tracking state from storage on app start
 */
export async function initializeTrackingState() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const state = JSON.parse(data);
      _isWorkTimeStarted = state.isWorkTimeStarted || false;
      _activeTrackId = state.activeTrackId || null;
      _startedAt = state.startedAt || null;
      _companyLocationId = state.companyLocationId || null;
      _lastStartTimestamp = state.lastStartTimestamp || 0;
      
      // If tracking is active but no timestamp saved, calculate from startedAt
      if (_isWorkTimeStarted && _lastStartTimestamp === 0 && _startedAt) {
        _lastStartTimestamp = new Date(_startedAt).getTime();
      }
    }
  } catch (error) {
    console.log('❌ Error loading tracking state:', error);
  }
}

// ============================================
// GETTERS
// ============================================

/**
 * Check if work time is currently started OR if START is in progress
 * @returns {boolean} True if tracking is active or being started
 */
export function isWorkTimeStarted() {
  return _isWorkTimeStarted || _isStartInProgress;
}

/**
 * Check if work time is ACTUALLY started (not just in progress)
 * @returns {boolean} True if tracking is confirmed active
 */
export function isWorkActuallyStarted() {
  return _isWorkTimeStarted;
}

/**
 * Check if START operation is currently in progress
 * @returns {boolean} True if START API call is in progress
 */
export function isStartInProgress() {
  return _isStartInProgress;
}

/**
 * Acquire lock for START operation
 * @returns {boolean} True if lock acquired, false if already locked
 */
export function acquireStartLock() {
  if (_isStartInProgress || _isWorkTimeStarted) {
    return false;
  }
  // Debounce: prevent acquiring lock again too soon after last acquisition
  // Guards against race conditions where syncStoppedFromAPI or markWorkStopped
  // clears the lock while a START API call is still in flight
  const now = Date.now();
  if (now - _lastStartLockAcquiredAt < START_DEBOUNCE_MS) {
    console.log(`⚠️ [START DEBOUNCE] Lock acquired ${now - _lastStartLockAcquiredAt}ms ago — too soon, skipping duplicate START`);
    return false;
  }
  _isStartInProgress = true;
  _lastStartLockAcquiredAt = now;
  return true;
}

/**
 * Release lock for START operation
 */
export function releaseStartLock() {
  _isStartInProgress = false;
}

/**
 * Get current track ID
 * @returns {string|null} Active track ID or null
 */
export function getActiveTrackId() {
  return _activeTrackId;
}

/**
 * Get tracking start time
 * @returns {string|null} ISO timestamp or null
 */
export function getStartedAt() {
  return _startedAt;
}

/**
 * Get company location ID
 * @returns {string|null} Location ID or null
 */
export function getCompanyLocationId() {
  return _companyLocationId;
}

/**
 * Check if STOP should be blocked due to cooldown period after START
 * This prevents GPS inaccuracy from triggering false STOP immediately after START
 * @returns {boolean} True if STOP should be blocked, false if allowed
 */
export function isInStopCooldown() {
  // If not tracking, no cooldown applies
  if (!_isWorkTimeStarted) {
    return false;
  }
  
  // Primary: use the persisted timestamp
  if (_lastStartTimestamp > 0) {
    const timeSinceStart = Date.now() - _lastStartTimestamp;
    if (timeSinceStart < STOP_COOLDOWN_MS) {
      console.log(`🛡️ COOLDOWN ACTIVE: ${Math.round((STOP_COOLDOWN_MS - timeSinceStart) / 1000)}s remaining`);
      return true;
    }
  }
  
  // Fallback: calculate from startedAt if timestamp was lost
  if (_startedAt) {
    const startTime = new Date(_startedAt).getTime();
    if (!isNaN(startTime)) {
      const timeSinceStart = Date.now() - startTime;
      if (timeSinceStart < STOP_COOLDOWN_MS) {
        console.log(`🛡️ COOLDOWN ACTIVE (from startedAt): ${Math.round((STOP_COOLDOWN_MS - timeSinceStart) / 1000)}s remaining`);
        // Also fix the timestamp for future checks
        _lastStartTimestamp = startTime;
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get time remaining in cooldown (for logging)
 * @returns {number} Milliseconds remaining, or 0 if cooldown expired
 */
export function getStopCooldownRemaining() {
  // Primary: use persisted timestamp
  if (_lastStartTimestamp > 0) {
    const remaining = STOP_COOLDOWN_MS - (Date.now() - _lastStartTimestamp);
    if (remaining > 0) return remaining;
  }
  
  // Fallback: calculate from startedAt
  if (_startedAt) {
    const startTime = new Date(_startedAt).getTime();
    if (!isNaN(startTime)) {
      const remaining = STOP_COOLDOWN_MS - (Date.now() - startTime);
      if (remaining > 0) return remaining;
    }
  }
  
  return 0;
}

/**
 * Get full tracking state
 * @returns {object} Complete tracking state
 */
export function getTrackingState() {
  return {
    isWorkTimeStarted: _isWorkTimeStarted,
    activeTrackId: _activeTrackId,
    startedAt: _startedAt,
    companyLocationId: _companyLocationId,
  };
}

// ============================================
// SETTERS
// ============================================

/**
 * Mark work time as started
 * @param {string} trackId - Track ID from API response
 * @param {string} startTime - ISO timestamp
 * @param {string} locationId - Company location ID
 */
export async function markWorkStarted(trackId, startTime, locationId = null) {
  _isWorkTimeStarted = true;
  _activeTrackId = trackId;
  _startedAt = startTime;
  _companyLocationId = locationId;
  _isStartInProgress = false;
  
  // Set cooldown timestamp to prevent immediate false STOP from GPS inaccuracy
  _lastStartTimestamp = Date.now();
  
  await saveToStorage();
}

/**
 * Mark work time as stopped
 */
export async function markWorkStopped() {
  _isWorkTimeStarted = false;
  _activeTrackId = null;
  _startedAt = null;
  _companyLocationId = null;
  _isStartInProgress = false;
  
  // Also clear the active track data key shared by locationModule & geofenceModule.
  // Without this, the background task reloads a stale track and locationModule's
  // in-memory guard can fire a spurious STOP API call after a QR/manual stop.
  await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_TRACK);
  await saveToStorage();
}

// ============================================
// API SYNC (Memory Only - No AsyncStorage)
// ============================================

/**
 * Sync tracking state from API response (memory only, no persistence)
 * Call this when fetching current tracking state from backend
 * The API/database is the source of truth - no need to save to AsyncStorage
 * @param {string} trackId - Track ID from API
 * @param {string} startTime - ISO timestamp from API
 * @param {string} locationId - Company location ID from API
 */
export function syncFromAPI(trackId, startTime, locationId = null) {
  _isWorkTimeStarted = true;
  _activeTrackId = trackId;
  _startedAt = startTime;
  _companyLocationId = locationId;
  _isStartInProgress = false; // Safe here: server confirmed a real active track, no START is needed
  
  // Set cooldown timestamp based on ACTUAL start time from API, not current time
  // This ensures cooldown only blocks STOP within 60s of actual track start
  const actualStartTime = new Date(startTime).getTime();
  if (!isNaN(actualStartTime)) {
    _lastStartTimestamp = actualStartTime;
  } else {
    // Fallback: if startTime is invalid, set to 0 (no cooldown)
    _lastStartTimestamp = 0;
  }
}

/**
 * Sync stopped state from API (memory only, no persistence)
 * Call this when API shows no active tracking
 */
export function syncStoppedFromAPI() {
  _isWorkTimeStarted = false;
  _activeTrackId = null;
  _startedAt = null;
  _companyLocationId = null;
  // NOTE: Do NOT reset _isStartInProgress here.
  // This function is called by TodayTimeTracks on every API poll.
  // If called while a START request is in flight (before its response returns),
  // resetting _isStartInProgress releases the lock and allows a second START to proceed.
  // The lock is managed exclusively by acquireStartLock / releaseStartLock / markWorkStarted.
}

/**
 * Clear all tracking state (for testing/debugging)
 */
export async function clearTrackingState() {
  _isWorkTimeStarted = false;
  _activeTrackId = null;
  _startedAt = null;
  _companyLocationId = null;
  _isStartInProgress = false;
  
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// ============================================
// PERSISTENCE
// ============================================

/**
 * Save current state to AsyncStorage
 */
async function saveToStorage() {
  try {
    const state = {
      isWorkTimeStarted: _isWorkTimeStarted,
      activeTrackId: _activeTrackId,
      startedAt: _startedAt,
      companyLocationId: _companyLocationId,
      lastStartTimestamp: _lastStartTimestamp,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.log('❌ Error saving tracking state:', error);
  }
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
  initializeTrackingState,
  isWorkTimeStarted,
  isWorkActuallyStarted,
  isStartInProgress,
  acquireStartLock,
  releaseStartLock,
  getActiveTrackId,
  getStartedAt,
  getCompanyLocationId,
  getTrackingState,
  markWorkStarted,
  markWorkStopped,
  clearTrackingState,
  syncFromAPI,
  syncStoppedFromAPI,
};
