# Time Tracking System

## Overview

The Texxano mobile app tracks work time via two methods:
1. **QR Code Scanning** - Manual check-in/check-out
2. **GPS Geofencing** - Automatic start/stop based on location

Both methods share a unified state to prevent duplicate API calls.

---

## Working Hours (Quiet Period)

**Geofence auto-tracking is disabled from 20:30 to 07:30 (overnight).**

| Time | Geofence Behavior |
|------|-------------------|
| 07:30 - 20:30 | ✅ Active - Will auto-start/stop |
| 20:30 - 07:30 | 🔇 Quiet - No auto-start (STOP still works) |

This prevents unwanted tracking if user lives near the office.

---

## Architecture

### Key Files

| File | Purpose |
|------|---------|
| `src/utils/sharedTrackingState.js` | Global state singleton - prevents duplicate START/STOP calls |
| `src/utils/locationModule.tsx` | Real-time GPS geofence monitoring |
| `src/utils/geofenceModule.tsx` | Background geofence task (expo-location) |
| `src/redux/actions/TimeTracks/timeTracks.actions.js` | Redux actions for QR code start/stop |
| `src/services/TimeTracks/timeTracks.services.js` | API calls to backend |
| `src/screens/Dashboard/Dashboard.js` | QR scanner UI and flow |
| `src/services/foregroundHeartbeatService.js` | Heartbeat to keep session alive |

---

## API Endpoints

| Action | Endpoint | Query Params |
|--------|----------|--------------|
| Start | `POST /timetracker/tracks/start` | `startedFromMobileApp=true`, `companyLocationId=<id>` |
| Stop | `POST /timetracker/tracks/stop` | `startedFromMobileApp=false`, `companyLocationId=<id>` |
| Heartbeat | `POST /users/heartbeat` | JSON body with timestamp |

---

## Shared Tracking State

Located in `src/utils/sharedTrackingState.js`

### State Variables

```javascript
_isWorkTimeStarted   // Is tracking currently active
_activeTrackId       // Current track ID from API
_startedAt           // ISO timestamp when started
_companyLocationId   // Geofence location ID
_isStartInProgress   // Mutex lock for START calls
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `isWorkActuallyStarted()` | Check if tracking is active |
| `isStartInProgress()` | Check if START API call is in flight |
| `acquireStartLock()` | Acquire mutex before calling START API |
| `releaseStartLock()` | Release mutex after API completes |
| `markWorkStarted(trackId, time, locationId)` | Update state after successful START |
| `markWorkStopped()` | Clear state after successful STOP |

---

## QR Code Flow

### Location: `Dashboard.js`

```
User scans QR code
    ↓
Check SharedTrackingState.isWorkActuallyStarted()
    ↓
┌─────────────────────────────────────────────────────┐
│ NOT tracking?                                       │
│   → dispatch(startTimeTrack())                      │
│   → Show "Welcome" modal                            │
├─────────────────────────────────────────────────────┤
│ IS tracking (Redux synced)?                         │
│   → dispatch(stopTimeTrack())                       │
│   → Show "Goodbye" modal                            │
├─────────────────────────────────────────────────────┤
│ IS tracking (geofence started, Redux not synced)?   │
│   → Show "Welcome" modal                            │
│   → Refresh time tracks list                        │
└─────────────────────────────────────────────────────┘
```

### Redux Actions

**startTimeTrack()** in `timeTracks.actions.js`:
1. Check `isWorkActuallyStarted()` - skip if already tracking
2. Check `isStartInProgress()` - skip if START in flight
3. `acquireStartLock()` - prevent concurrent calls
4. Call API `POST /tracks/start`
5. On success: `markWorkStarted()`, dispatch Redux state
6. On failure: `releaseStartLock()`

**stopTimeTrack()**:
1. Call API `POST /tracks/stop`
2. `markWorkStopped()`
3. Dispatch Redux state

---

## Geofence Flow

### Location: `locationModule.tsx` and `geofenceModule.tsx`

```
User enters geofence
    ↓
Verify with backend (GET /tracks) - is there already an active track?
    ↓
┌─────────────────────────────────────┐
│ Server has active track?            │
│   → SKIP (already tracking)         │
├─────────────────────────────────────┤
│ No active track?                    │
│   → acquireStartLock()              │
│   → POST /tracks/start              │
│   → markWorkStarted()               │
└─────────────────────────────────────┘

User exits geofence
    ↓
Check SharedTrackingState.isWorkActuallyStarted()
    ↓
┌─────────────────────────────────────┐
│ IS tracking?                        │
│   → POST /tracks/stop               │
│   → markWorkStopped()               │
├─────────────────────────────────────┤
│ NOT tracking?                       │
│   → SKIP                            │
└─────────────────────────────────────┘
```

---

## Preventing Duplicate API Calls

### Scenario 1: Geofence fires first, then QR scan

```
1. Geofence START → acquireStartLock() ✓ → API call → markWorkStarted()
2. User scans QR → isWorkActuallyStarted() = true → SKIPPED ✓
3. User sees "Welcome" modal + refreshed time tracks
```

### Scenario 2: QR fires first, then geofence

```
1. User scans QR → acquireStartLock() ✓ → API call → markWorkStarted()
2. Geofence fires → verifies with backend → already tracking → SKIPPED ✓
```

### Scenario 3: Both fire simultaneously

```
1. QR → acquireStartLock() ✓ (gets lock)
2. Geofence → acquireStartLock() = false → SKIPPED ✓
3. Only one START API call fires
```

---

## Heartbeat System

### Purpose
Backend stops tracking if no heartbeat received for 1 minute.

### Implementation

**Android**: Foreground Service via `react-native-background-actions`
**iOS**: Background location updates via `expo-location`

### Interval
Every 25 seconds → `POST /users/heartbeat`

### Files
- `src/services/foregroundHeartbeatService.js`
- `src/services/appStatusService.js`

---

## State Persistence

### AsyncStorage Keys

| Key | Purpose |
|-----|---------|
| `@texxano:global_tracking_state` | SharedTrackingState data |
| `@texxano_active_track` | Active track data for geofence modules |
| `@texxano_realtime_geofence` | Geofence regions |

### On App Start
`initializeTrackingState()` loads persisted state from AsyncStorage.

### On Background Wake
Geofence modules reload state from AsyncStorage before processing events.

---

## Recovery Mechanism

If user stays inside geofence but track was stopped externally (web, admin, heartbeat timeout):

```
Location update received
    ↓
User still inside geofence?
    ↓
Throttled check (every 2 minutes)
    ↓
Verify with backend
    ↓
If no active track → START
```

---

## Summary

| Source | Trigger | Guard |
|--------|---------|-------|
| QR Code | Manual scan | `isWorkActuallyStarted()` + `acquireStartLock()` |
| Geofence | GPS location | Backend verification + `acquireStartLock()` |

Both methods respect the same locks and state, ensuring only one START fires regardless of timing.
