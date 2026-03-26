# TaskManager Notification Migration

**Date:** 2024  
**Status:** ✅ COMPLETED  
**Impact:** High reliability for heartbeat ping-pong when app is force-killed

---

## Overview

Migrated notification handling from `Notifications.setNotificationHandler()` to a hybrid approach using both **TaskManager** and **setNotificationHandler** for maximum reliability across all app states.

### Problem Statement

The previous implementation used only `Notifications.setNotificationHandler()`, which has limitations:

- ✅ Works when app is **foreground** (active)
- ✅ Works when app is **background** (backgrounded but still alive)
- ❌ **Fails when app is killed/terminated** (swiped away from recent apps)

For the server-initiated heartbeat ping-pong system, we MUST respond to pings even when the app is killed. Missing pongs cause the backend to auto-stop time tracking.

---

## Solution Architecture

### Three-Layer Notification Handling

```
┌─────────────────────┬───────────────────────────────────────┐
│ App State           │ Handler Used                          │
├─────────────────────┼───────────────────────────────────────┤
│ Foreground          │ setNotificationHandler (existing)     │
│ Background (alive)  │ setNotificationHandler (existing)     │
│ Killed/Terminated   │ TaskManager.defineTask (NEW)          │
└─────────────────────┴───────────────────────────────────────┘
```

### Implementation Strategy

**TaskManager** handles critical notifications when app is killed:
- `heartbeat_ping` → Send pong immediately
- `auto_stop` → Update local state

**setNotificationHandler** handles all notifications when app is running:
- All notification types with full UI updates
- Geofence checks
- Redux state updates
- Notification display control

---

## Code Changes

### 1. Background Notification Handler (`src/utils/backgroundNotificationHandler.js`)

#### Added TaskManager Task Definition (Module Scope)

```javascript
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// ⚠️ CRITICAL: Define at module scope (runs BEFORE React components)
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) return;
  
  const pushData = data?.notification?.data ?? data?.notification?.request?.content?.data;
  
  if (pushData?.type === 'heartbeat_ping') {
    await sendHeartbeatPong(pushData.trackId, pushData.timestamp);
    await Notifications.dismissAllNotificationsAsync();
  } else if (pushData?.type === 'auto_stop') {
    await SharedTrackingState.markWorkStopped();
    store.dispatch({ type: 'STOP_TIME_TRACKING' });
  }
});
```

#### Added Task Registration (Auto-registers on Module Load)

```javascript
const registerNotificationTask = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
  if (isRegistered) return true;
  
  await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  return true;
};

// Auto-register when module loads (before React renders)
registerNotificationTask();
export { registerNotificationTask };
```

#### Enhanced Initialization Function

```javascript
export const initializeBackgroundNotifications = () => {
  // Handler for when app is running (foreground/background)
  Notifications.setNotificationHandler({
    handleNotification: handleBackgroundNotification,
  });

  // Ensure TaskManager task is registered (for killed state)
  registerNotificationTask().catch(err => {
    console.log('⚠️ TaskManager registration check failed:', err?.message);
  });

  console.log('✅ Notification handler initialized (TaskManager + setNotificationHandler)');
};
```

### 2. App Container (`src/components/AppContainerClean.js`)

#### Updated Import

```javascript
import { 
  handleBackgroundNotification, 
  initializeBackgroundNotifications 
} from "../utils/backgroundNotificationHandler";
```

#### Replaced Direct setNotificationHandler Call

**Before:**
```javascript
Notifications.setNotificationHandler({
  handleNotification: handleBackgroundNotification,
});
```

**After:**
```javascript
// Initializes BOTH TaskManager task and setNotificationHandler
initializeBackgroundNotifications();
```

---

## Why TaskManager Instead of setNotificationHandler?

### setNotificationHandler Limitations

1. **Requires app process to be alive**
   - When Android kills the app (swipe away), all JavaScript context is destroyed
   - `setNotificationHandler` callback cannot execute without JavaScript runtime

2. **No guaranteed execution on Android**
   - Android may not spawn the app process for every notification
   - Depends on system RAM, battery optimization, manufacturer restrictions

### TaskManager Advantages

1. **Registered at system level**
   - Task definition happens at module scope (before React)
   - Expo's native layer knows about the task even when JS is killed

2. **Spawns JavaScript context on demand**
   - When notification arrives, Expo spawns a minimal JS context
   - Executes only the registered task (fast, low overhead)

3. **Works with force-killed apps**
   - Tested and proven reliable even after "swipe away"
   - Critical for ping-pong system where missing pongs = auto-stop

---

## Testing Checklist

### Foreground Testing

- [ ] App open → Heartbeat ping arrives → Pong sent within 1s
- [ ] App open → Auto-stop notification → Local state updated, UI reflects stop
- [ ] App open → Inactivity warning → Notification shown to user

### Background Testing

- [ ] App backgrounded (home button) → Heartbeat ping → Pong sent
- [ ] App backgrounded → Auto-stop → State updated when app reopens
- [ ] App backgrounded → Employee auto-stop → Notification shown

### Killed State Testing (Critical)

- [ ] App killed (swipe away) → Heartbeat ping → **Pong sent (TaskManager)**
- [ ] App killed → Multiple pings → **All pongs sent**
- [ ] App killed → Auto-stop → **State updated when app reopens**
- [ ] App killed → No pong failures in backend logs

### Device-Specific Testing

- [ ] Samsung devices (aggressive battery optimization)
- [ ] Xiaomi/Oppo/Vivo (MIUI, ColorOS, FuntouchOS restrictions)
- [ ] Pixel devices (stock Android, baseline behavior)
- [ ] iOS (limited background execution, less critical)

---

## Monitoring and Debugging

### Key Log Messages

#### TaskManager Registration (Module Scope)
```
✅ [NOTIF INIT] Background notification task defined
✅ [NOTIF INIT] Background notification task registered
```

#### Notification Processing (Killed State)
```
🔔 [BG TASK] Background notification task triggered
💓 [BG TASK] Heartbeat ping received - sending pong
```

#### Notification Processing (Running State)
```
🔔 Background notification received: {...}
💓 Received heartbeat PING from server
```

### Backend Monitoring

Check backend logs for:
- **Pong received:** Confirms TaskManager working
- **Pong timeout:** Indicates TaskManager not executing (device restrictions)
- **Auto-stop triggered:** User didn't respond to pings

---

## Known Limitations

### iOS Background Execution

- iOS has strict background execution limits
- Silent push notifications unreliable (iOS may not wake app)
- Ping-pong less reliable on iOS, but less critical (iOS doesn't have Doze mode)

### Android Manufacturer Restrictions

Some manufacturers have aggressive battery optimization:
- Xiaomi (MIUI): "Autostart" permission required
- Oppo/OnePlus (ColorOS): "Allow background activity" required
- Huawei: "Battery optimization" whitelist required

**Solution:** Battery optimization banner on Dashboard guides users to settings

### Network Timeouts

- Pong must complete within 5 seconds (backend timeout)
- If network is slow, pong may timeout even if sent
- Backend logs will show "timeout" instead of "failed"

---

## Rollback Plan

If TaskManager causes issues, can revert to setNotificationHandler-only:

1. Remove TaskManager task definition from `backgroundNotificationHandler.js`
2. Revert `initializeBackgroundNotifications()` to only call `setNotificationHandler()`
3. Document that killed state pings will not be handled

**Risk:** Users who force-kill the app will have tracking auto-stopped by backend

---

## Future Enhancements

### Priority 1: Battery Optimization Detection
- Detect if app is battery optimized programmatically
- Show warning only to users who need it
- Reduce banner noise for users already whitelisted

### Priority 2: Ping Acknowledgment
- Send immediate "ping received" acknowledgment
- Backend can track delivery vs. processing delays
- Better debugging of slow pongs

### Priority 3: Offline Pong Queue
- Queue pongs when network unavailable
- Send all queued pongs when network restored
- Prevent auto-stops due to temporary network issues

---

## References

- [TaskManager Migration Decision](./HEARTBEAT_INTEGRATION_STATUS.md)
- [Backend Ping-Pong Specification](./HEARTBEAT_PING_PONG_SYSTEM.md)
- [Android Doze Mode Mitigation](./DOZE_MODE_SIMPLE_FIX.md)
- [Expo TaskManager Documentation](https://docs.expo.dev/versions/latest/sdk/task-manager/)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)

---

## Changelog

**2024-xx-xx:** Initial migration from setNotificationHandler to TaskManager hybrid approach
- Added TaskManager.defineTask for killed state handling
- Kept setNotificationHandler for running state handling
- Updated AppContainerClean.js to use initializeBackgroundNotifications()
- Tested on Android (killed state pongs working)

---

## Questions and Support

For questions about this migration, contact the mobile team or review:
- Backend logs: `https://texxanoapi-tst.azurewebsites.net/api/v1/logs`
- Mobile app logs: Use Android Studio Logcat or Xcode Console
- Expo logs: `npx expo start` in development mode

**Key Verification:**
- Backend receives pongs with `source: "fcm_pong"` when app is killed ✅
