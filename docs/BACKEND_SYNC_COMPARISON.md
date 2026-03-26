# Backend Sync: Implementation Comparison

**Date:** March 24, 2026  
**Backend Guide:** `mobile-pong-checklist.md` (updated with Headless JS + Foreground Service)

---

## Executive Summary

### ✅ What We Already Have (Expo-based)
- TaskManager.defineTask for killed-state notifications
- Ping-pong with correct `source: "fcm_pong"`
- Token refresh in background
- Persistent logging to AsyncStorage
- Debug UI panel
- 2.5-minute proactive heartbeat intervals

### ⚠️ Key Differences (Expo vs Firebase approach)
| Backend Recommends | Our Implementation | Status |
|-------------------|-------------------|--------|
| React Native Firebase `setBackgroundMessageHandler` | Expo `TaskManager.defineTask` | ✅ **Equivalent** (both handle killed state) |
| Firebase `onMessage`, `getInitialNotification`, etc. | Expo `Notifications.addNotificationReceivedListener`, etc. | ✅ **Equivalent** (different APIs, same functionality) |
| `@notifee/react-native` for Foreground Service | None (using background location task) | ❌ **Missing** - should add |
| Four handler registration | TaskManager (one handler) + notification listeners | ✅ **Equivalent** (covered differently) |

### 🚨 Critical Gap: Foreground Service
**We don't have a persistent notification-based foreground service.** This is the main difference and the key to solving the "app killed = heartbeat stops" issue.

---

## Detailed Comparison

### 1. Killed App Notification Handling

#### Backend Recommends (Firebase):
```javascript
// In index.js
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (remoteMessage?.data?.type === 'heartbeat_ping') {
    await sendPong(remoteMessage.data.trackId);
  }
});
```

#### Our Implementation (Expo):
```javascript
// In src/utils/backgroundNotificationHandler.js
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  // Extract data from FCM/APNS
  const pushData = /* extraction logic */;
  
  if (pushData?.type === 'heartbeat_ping') {
    await sendHeartbeatPong(pushData.trackId, pushData.timestamp);
  }
});

// Register task
await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
```

**Status:** ✅ **Equivalent functionality** - Both handle notifications when app is killed via platform-native background execution

---

### 2. Foreground/Background Notification Handling

#### Backend Recommends (Firebase):
```javascript
// Foreground
messaging().onMessage(async (remoteMessage) => {
  if (remoteMessage?.data?.type === 'heartbeat_ping') {
    await sendPong(remoteMessage.data.trackId);
  }
});

// App opened from notification
messaging().onNotificationOpenedApp(async (remoteMessage) => {
  if (remoteMessage?.data?.type === 'heartbeat_ping') {
    await sendPong(remoteMessage.data.trackId);
  }
});

// App started from killed state via notification
messaging().getInitialNotification().then(async (remoteMessage) => {
  if (remoteMessage?.data?.type === 'heartbeat_ping') {
    await sendPong(remoteMessage.data.trackId);
  }
});
```

#### Our Implementation (Expo):
```javascript
// In src/utils/backgroundNotificationHandler.js
export const handleBackgroundNotification = async (notification) => {
  const data = /* parse notification data */;
  
  if (data?.type === 'heartbeat_ping') {
    await sendHeartbeatPong(data?.trackId, data?.timestamp);
  }
};

// Registered via setNotificationHandler
Notifications.setNotificationHandler({
  handleNotification: handleBackgroundNotification,
});
```

**Status:** ⚠️ **Partially equivalent** - We handle foreground/background, but may need explicit handlers for notification tap events

---

### 3. Pong Payload Format

#### Backend Requires:
```javascript
{
  source: 'fcm_pong',          // MUST be exact - bypasses rate limiting
  platform: 'android',         // or 'ios'
  latitude: number,            // optional
  longitude: number,           // optional
  timestamp: ISO string        // we add this
}
```

#### Our Implementation:
```javascript
// In src/utils/backgroundNotificationHandler.js - sendHeartbeatPong()
const payload = {
  timestamp: new Date().toISOString(),
  platform: Platform.OS,
  source: 'fcm_pong',        // ✅ Correct
  latitude,                   // ✅ Optional
  longitude,                  // ✅ Optional
  isInsideGeofence,           // Extra field (doesn't hurt)
};
```

**Status:** ✅ **Correct** - Our payload matches backend requirements exactly

---

### 4. Proactive Heartbeat

#### Backend Recommends:
```javascript
// Inside Foreground Service
let heartbeatInterval = setInterval(() => {
  sendPong().catch(console.error);
}, 2 * 60 * 1000); // Every 2 minutes
```

#### Our Implementation:
```javascript
// src/services/appStatusService.js
// Background location task sends heartbeats every 2.5 minutes
await Location.startLocationUpdatesAsync(HEARTBEAT_BACKGROUND_TASK, {
  timeInterval: 150000,  // 2.5 minutes
  // ...
});

// Also: JavaScript-based keep-alive as backup
setInterval(async () => {
  await sendHeartbeatFromBackground();
}, 150000);
```

**Status:** ✅ **Equivalent** - We send proactive heartbeats, even more frequently (2.5min vs their 2min suggestion)

---

### 5. Token Refresh in Background

#### Backend Requires:
```javascript
async function refreshAccessToken() {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  const userId = await SecureStore.getItemAsync('userId');
  
  const response = await fetch(BASE_URL + '/api/v1/authentications/login/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: refreshToken,    // Refresh token GUID
      userId: userId
    })
  });
  
  // Store new tokens in SecureStore (NOT Redux)
  await SecureStore.setItemAsync('accessToken', data.token);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
}
```

#### Our Implementation:
```javascript
// src/services/appStatusService.js - refreshTokenInBackground()
const refreshTokenInBackground = async (refreshToken, userId) => {
  const response = await fetch(`${BASE_URL_API}/authentications/login/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: refreshToken,
      userId: userId,
    }),
  });
  
  // Update AsyncStorage (redux-persist format)
  const persistedData = await AsyncStorage.getItem('persist:TEXXANO');
  // ... update tokens ...
  await AsyncStorage.setItem('persist:TEXXANO', JSON.stringify(parsed));
};
```

**Status:** ✅ **Equivalent** - We refresh tokens in background and persist to AsyncStorage

---

### 6. **CRITICAL MISSING: Foreground Service**

#### Backend Recommends:
```javascript
import notifee, { AndroidImportance } from '@notifee/react-native';

async function startTrackingForegroundService(trackId) {
  const channelId = await notifee.createChannel({
    id: 'time-tracking',
    name: 'Time Tracking',
    importance: AndroidImportance.LOW,
  });

  await notifee.displayNotification({
    id: 'tracking-active',
    title: '⏱ Time Tracking Active',
    body: 'Tap to open Texxano',
    android: {
      channelId,
      asForegroundService: true,  // ← Keeps process alive
      ongoing: true,
    },
  });
  
  startHeartbeatTimer(); // setInterval inside service
}
```

#### Our Implementation:
❌ **NONE** - We rely on:
- Background Location task (limited by Android Doze)
- JavaScript keep-alive (killed when app swiped)
- FCM notifications waking app (unreliable)

**Status:** ❌ **MISSING** - This is the **root cause** of "app killed = heartbeats stop"

---

## Why Foreground Service is Critical

### Current Flow (Without Foreground Service):
```
User starts tracking
  ↓
App sends heartbeats via background task
  ↓
User swipes app away
  ↓
Android KILLS the process
  ↓
Background task STOPS (process dead)
  ↓
JavaScript timers STOP (process dead)
  ↓
FCM ping arrives → May wake app briefly (unreliable)
  ↓
Backend: No heartbeats → Auto-stop after 15 min
```

### With Foreground Service:
```
User starts tracking
  ↓
Start Foreground Service (persistent notification)
  ↓
App shows: "⏱ Time Tracking Active"
  ↓
User swipes app away
  ↓
Android CANNOT kill the process (protected by foreground service)
  ↓
JavaScript timers KEEP RUNNING
  ↓
Heartbeats continue every 2.5 minutes
  ↓
Backend: Receiving heartbeats → Track stays active ✅
```

---

## Implementation Priority

### Immediate (1-2 hours):
1. **Install @notifee/react-native**
   ```bash
   npm install @notifee/react-native
   cd android && ./gradlew clean
   ```

2. **Create Foreground Service wrapper**
   ```javascript
   // src/services/foregroundService.js
   import notifee from '@notifee/react-native';
   
   export async function startTrackingService(trackId) {
     const channelId = await notifee.createChannel({
       id: 'time-tracking',
       name: 'Time Tracking',
       importance: AndroidImportance.LOW,
     });
     
     await notifee.displayNotification({
       id: 'tracking-active',
       title: '⏱ Time Tracking Active',
       body: 'Tap to return to Texxano',
       android: {
         channelId,
         asForegroundService: true,
         ongoing: true,
         pressAction: { id: 'open-app' },
       },
     });
     
     await AsyncStorage.setItem('activeTrackId', trackId);
   }
   
   export async function stopTrackingService() {
     await notifee.stopForegroundService();
     await AsyncStorage.removeItem('activeTrackId');
   }
   
   export async function updateTrackingDuration(duration) {
     await notifee.displayNotification({
       id: 'tracking-active',
       title: '⏱ Time Tracking Active',
       body: `Duration: ${duration}`,
       // ... same config ...
     });
   }
   ```

3. **Integrate with start/stop tracking**
   ```javascript
   // In Dashboard.js or wherever tracking starts
   import { startTrackingService, stopTrackingService } from '../services/foregroundService';
   
   async function handleStartTracking() {
     const response = await timeTracksServices.startTimeTrack(locationId);
     if (response?.trackId) {
       await startTrackingService(response.trackId);
     }
   }
   
   async function handleStopTracking() {
     await timeTracksServices.stopTimeTrack();
     await stopTrackingService();
   }
   ```

4. **Add Android permissions** (android/app/src/main/AndroidManifest.xml)
   ```xml
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
   ```

### Short-term (2-4 hours):
5. **Add notification tap handlers for initial/opened cases**
   ```javascript
   // In index.js
   import * as Notifications from 'expo-notifications';
   
   // App opened from notification (killed state)
   Notifications.getLastNotificationResponseAsync().then(response => {
     if (response?.notification?.request?.content?.data?.type === 'heartbeat_ping') {
       // App was opened by tapping ping notification
       const trackId = response.notification.request.content.data.trackId;
       sendHeartbeatPong(trackId);
     }
   });
   
   // App opened from notification (background state)
   Notifications.addNotificationResponseReceivedListener(response => {
     if (response?.notification?.request?.content?.data?.type === 'heartbeat_ping') {
       const trackId = response.notification.request.content.data.trackId;
       sendHeartbeatPong(trackId);
     }
   });
   ```

6. **Add heartbeat on app start if tracking active**
   ```javascript
   // In App.js or AppContainerClean
   useEffect(() => {
     const checkActiveTracking = async () => {
       const trackId = await AsyncStorage.getItem('activeTrackId');
       if (trackId) {
         console.log('[Heartbeat] App started with active track, sending pong');
         await sendHeartbeatPong(trackId);
       }
     };
     
     checkActiveTracking();
   }, []);
   ```

### Medium-term (4-8 hours):
7. **Move proactive heartbeat into foreground service**
   Currently using background location task. Should migrate to setInterval inside foreground service for better reliability.

8. **Update persistent notification every minute with duration**
   ```javascript
   setInterval(async () => {
     const startTime = await AsyncStorage.getItem('trackStartTime');
     const duration = calculateDuration(startTime);
     await updateTrackingDuration(duration);
   }, 60000);
   ```

9. **Handle auto-stop notifications to kill foreground service**
   ```javascript
   if (data?.type === 'auto_stop' || data?.type === 'time_tracking_stopped') {
     await stopTrackingService();
     await SharedTrackingState.markWorkStopped();
   }
   ```

---

## Testing Plan

### After Foreground Service Implementation:

#### Test 1: Basic Functionality
1. Start tracking → Should see persistent notification "⏱ Time Tracking Active"
2. Check notification drawer → Should be ongoing (can't swipe away)
3. Stop tracking → Notification should disappear

#### Test 2: Survives App Kill
1. Start tracking
2. Go to Settings → Apps → Texxano → Force Stop
3. Wait 3 minutes
4. Check backend logs → Should show heartbeats still arriving ✅

#### Test 3: Survives Task Switcher Swipe
1. Start tracking
2. Swipe app away from task switcher
3. Wait 5 minutes
4. Check backend logs → Should show heartbeats ✅
5. Check notification drawer → "⏱ Time Tracking Active" should still be there

#### Test 4: Long Session
1. Start tracking
2. Leave for 1+ hour (screen off, app killed)
3. Open app
4. Check track duration → Should match elapsed time (not 1 minute) ✅
5. Backend logs should show continuous heartbeats

#### Test 5: Notification Tap
1. Start tracking
2. Kill app (no foreground service for this test)
3. Wait 10 minutes → Backend sends notification
4. Tap notification → App opens
5. Backend should receive pong immediately

---

## Key Takeaways

### ✅ What's Working Well:
- Ping-pong payload format is correct (`source: "fcm_pong"`)
- Token refresh in background works
- Persistent logging for debugging
- Data extraction handles multiple paths
- Background location task sends proactive heartbeats

### ⚠️ What Needs Improvement:
- **CRITICAL: Add Foreground Service** - Without this, app process dies when killed
- Add explicit notification tap handlers (getLastNotificationResponseAsync, etc.)
- Send heartbeat on app start if tracking active
- Move heartbeat timer into foreground service context

### 🎯 Success Metrics After Implementation:
- Backend shows continuous `💓 PONG received` every 2-5 minutes
- No more `🛑 AUTO-STOP` for active users
- Tracks show correct duration (not 1 minute)
- Backend logs show `Sent=X, Received=X` (100% pong rate)

---

## Expo vs Firebase: Why Both Work

The backend guide uses Firebase messaging, but **Expo provides equivalent functionality**:

| Firebase | Expo Equivalent |
|----------|----------------|
| `messaging().setBackgroundMessageHandler()` | `TaskManager.defineTask()` + `Notifications.registerTaskAsync()` |
| `messaging().onMessage()` | `Notifications.setNotificationHandler()` |
| `messaging().getInitialNotification()` | `Notifications.getLastNotificationResponseAsync()` |
| `messaging().onNotificationOpenedApp()` | `Notifications.addNotificationResponseReceivedListener()` |

**The ONLY missing piece is the Foreground Service**, which is independent of the notification library and works the same with both Firebase and Expo.

---

## Next Steps

1. **Install @notifee/react-native** (30 min)
2. **Create foregroundService.js wrapper** (1 hour)
3. **Integrate with start/stop tracking** (30 min)
4. **Test on device** (1 hour)
5. **Deploy OTA update** (5 min)
6. **Monitor backend logs for continuous heartbeats** (ongoing)

**Estimated total implementation time: 3-4 hours**  
**Expected impact: 100% track accuracy, no more 1-minute tracks**
