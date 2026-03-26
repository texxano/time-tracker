# No New Library Solution - Integration Guide

**Using only existing libraries:** expo-notifications + expo-location

---

## What We Already Have ✅

1. **expo-location foreground service** - Keeps process alive (lines 478-486 in appStatusService.js)
2. **expo-notifications** - Already in package.json, can create persistent notifications
3. **TaskManager** - Handles background tasks

## The Solution: Two-Notification Approach

### Notification 1: expo-location foreground service
- **Purpose:** Keeps Android process alive
- **Text:** "⏱️ Texxano Time Tracking - Keeping your session alive"
- **Status:** ✅ Already configured (just improved text)

### Notification 2: expo-notifications tracking notification
- **Purpose:** Shows duration, can be updated dynamically
- **Text:** "⏱️ Time Tracking Active - Duration: 01:23:45"
- **Status:** ✅ Just created (trackingNotificationService.js)

---

## Integration Steps

### Step 1: Initialize in App.js (one-time setup)

```javascript
// At the top of App.js or AppContainerClean.js
import { initializeTrackingChannel } from '../services/trackingNotificationService';

// In useEffect or componentDidMount
useEffect(() => {
  initializeTrackingChannel();
}, []);
```

### Step 2: When User Starts Tracking

```javascript
// In Dashboard.js or wherever startTimeTrack is called
import { 
  showTrackingNotification, 
  startNotificationUpdates 
} from '../services/trackingNotificationService';

// Store the interval ID at component level
let notificationUpdateInterval = null;

const handleStartTracking = async () => {
  try {
    // 1. Start tracking via API
    const response = await timeTracksServices.startTimeTrack(locationId);
    
    if (response?.trackId) {
      const startTime = new Date();
      
      // 2. Show persistent notification
      await showTrackingNotification(response.trackId, startTime);
      
      // 3. Start updating notification every minute
      notificationUpdateInterval = startNotificationUpdates(startTime);
      
      console.log('✅ Tracking started with persistent notification');
    }
  } catch (error) {
    console.error('Failed to start tracking:', error);
  }
};
```

### Step 3: When User Stops Tracking

```javascript
import { dismissTrackingNotification } from '../services/trackingNotificationService';

const handleStopTracking = async () => {
  try {
    // 1. Stop tracking via API
    await timeTracksServices.stopTimeTrack();
    
    // 2. Stop notification updates
    if (notificationUpdateInterval) {
      clearInterval(notificationUpdateInterval);
      notificationUpdateInterval = null;
    }
    
    // 3. Dismiss notification
    await dismissTrackingNotification();
    
    console.log('✅ Tracking stopped, notification dismissed');
  } catch (error) {
    console.error('Failed to stop tracking:', error);
  }
};
```

### Step 4: Handle App Restart (Recovery)

```javascript
// In App.js or Dashboard.js - check on mount
import { getActiveTrack, showTrackingNotification, startNotificationUpdates } from '../services/trackingNotificationService';

useEffect(() => {
  const checkActiveTracking = async () => {
    // Check if there's an active track from before app was killed
    const activeTrack = await getActiveTrack();
    
    if (activeTrack) {
      console.log('📱 App restarted with active track - restoring notification');
      
      // Restore notification
      await showTrackingNotification(activeTrack.trackId, activeTrack.startTime);
      
      // Restart updates
      notificationUpdateInterval = startNotificationUpdates(activeTrack.startTime);
      
      // Optional: Send heartbeat to let backend know we're back
      await sendHeartbeatPong(activeTrack.trackId);
    }
  };
  
  checkActiveTracking();
}, []);
```

### Step 5: Handle Auto-Stop Notifications

```javascript
// In backgroundNotificationHandler.js - existing handler
if (pushData?.type === 'auto_stop' || pushData?.type === 'time_tracking_stopped') {
  console.log('🛑 [BG TASK] Auto-stop notification - updating local state');
  
  // Clear tracking notification
  await dismissTrackingNotification();
  
  // Stop notification updates
  if (notificationUpdateInterval) {
    clearInterval(notificationUpdateInterval);
  }
  
  // Update local state
  await SharedTrackingState.markWorkStopped();
  store.dispatch({ type: 'STOP_TIME_TRACKING' });
}
```

---

## What User Sees

### When Tracking Starts:
**Two notifications appear:**

1. **"⏱️ Texxano Time Tracking"**  
   "Keeping your session alive • Tap to open app"  
   *(expo-location foreground service - keeps process alive)*

2. **"⏱️ Time Tracking Active"**  
   "Duration: 00:00:00 • Tap to open"  
   *(expo-notifications - shows duration, updates every minute)*

### During Tracking:
- Notification #2 updates every minute: "00:01:00", "00:02:00", etc.
- Both notifications persist even when app is swiped away
- Process stays alive due to foreground service

### When Tracking Stops:
- Both notifications disappear
- Foreground service stops

---

## Why This Works Without New Libraries

### Android Process Protection:
```
expo-location foreground service
  ↓
Creates persistent notification (required by Android)
  ↓
Android treats app as "important" (foreground service)
  ↓
Process CANNOT be killed by swipes or memory cleanup
  ↓
JavaScript timers keep running
  ↓
Heartbeats continue every 2.5 minutes ✅
```

### Duration Display:
```
expo-notifications (existing library)
  ↓
Create notification with ID "time-tracking-active"
  ↓
Update same ID every minute → replaces notification
  ↓
User sees live duration counter ✅
```

---

## Android Manifest (Already Have It)

Check `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

If not present, add them. Then rebuild:
```bash
cd android && ./gradlew clean
```

---

## Complete Code Example

**File: src/screens/Dashboard/Dashboard.js** (or wherever tracking happens)

```javascript
import React, { useState, useEffect } from 'react';
import { 
  showTrackingNotification, 
  dismissTrackingNotification,
  startNotificationUpdates,
  getActiveTrack,
  initializeTrackingChannel,
} from '../../services/trackingNotificationService';

let notificationUpdateInterval = null;

const Dashboard = () => {
  const [isTracking, setIsTracking] = useState(false);
  
  // Initialize on mount
  useEffect(() => {
    initializeTrackingChannel();
    checkForActiveTrack();
    
    return () => {
      // Cleanup on unmount
      if (notificationUpdateInterval) {
        clearInterval(notificationUpdateInterval);
      }
    };
  }, []);
  
  // Check if tracking was active before app restart
  const checkForActiveTrack = async () => {
    const activeTrack = await getActiveTrack();
    if (activeTrack) {
      console.log('📱 Restoring active tracking session');
      setIsTracking(true);
      
      // Restore notification
      await showTrackingNotification(activeTrack.trackId, activeTrack.startTime);
      notificationUpdateInterval = startNotificationUpdates(activeTrack.startTime);
    }
  };
  
  const handleStartTracking = async (locationId) => {
    try {
      const response = await timeTracksServices.startTimeTrack(locationId);
      
      if (response?.trackId) {
        const startTime = new Date();
        
        // Show notification
        await showTrackingNotification(response.trackId, startTime);
        
        // Start updates
        notificationUpdateInterval = startNotificationUpdates(startTime);
        
        setIsTracking(true);
        console.log('✅ Tracking started');
      }
    } catch (error) {
      console.error('❌ Failed to start tracking:', error);
    }
  };
  
  const handleStopTracking = async () => {
    try {
      await timeTracksServices.stopTimeTrack();
      
      // Stop updates
      if (notificationUpdateInterval) {
        clearInterval(notificationUpdateInterval);
        notificationUpdateInterval = null;
      }
      
      // Dismiss notification
      await dismissTrackingNotification();
      
      setIsTracking(false);
      console.log('✅ Tracking stopped');
    } catch (error) {
      console.error('❌ Failed to stop tracking:', error);
    }
  };
  
  return (
    // ... your UI
  );
};
```

---

## Testing Checklist

### Test 1: Basic Flow
- [ ] Start tracking → See two notifications
- [ ] Wait 2 minutes → Duration updates to "00:02:00"
- [ ] Stop tracking → Notifications disappear

### Test 2: App Kill
- [ ] Start tracking
- [ ] Force kill app (Settings → Apps → Force Stop)
- [ ] Check notification drawer → Both notifications still there ✅
- [ ] Open app → Notification restored with current duration
- [ ] Backend logs → Heartbeats still arriving ✅

### Test 3: Task Switcher Swipe
- [ ] Start tracking
- [ ] Swipe app away
- [ ] Wait 5 minutes
- [ ] Check notifications → Still there ✅
- [ ] Backend logs → Heartbeats arriving ✅

### Test 4: Long Session
- [ ] Start tracking
- [ ] Leave for 30+ minutes (screen off)
- [ ] Open app
- [ ] Check duration → Should match elapsed time ✅
- [ ] Backend logs → Continuous heartbeats ✅

### Test 5: Auto-Stop
- [ ] Start tracking
- [ ] Kill app + disable wifi
- [ ] Wait 15 minutes (auto-stop)
- [ ] Turn wifi back on
- [ ] Open app
- [ ] Notifications should be gone ✅
- [ ] Track shows correct duration ✅

---

## Troubleshooting

### Notifications Don't Show
```javascript
// Check permissions
const { status } = await Notifications.getPermissionsAsync();
console.log('Notification permission:', status);

// Request if needed
if (status !== 'granted') {
  await Notifications.requestPermissionsAsync();
}
```

### Duration Doesn't Update
```javascript
// Verify interval is running
console.log('Update interval active:', !!notificationUpdateInterval);

// Check if function is being called
// Add this to updateTrackingNotification():
console.log('Updating notification, duration:', formatDuration(getDuration(startTime)));
```

### Process Still Gets Killed
```javascript
// Verify foreground service is running
import * as Location from 'expo-location';

const isRunning = await Location.hasServicesEnabledAsync();
console.log('Location services enabled:', isRunning);

// Check battery optimization
// User needs to disable battery optimization for the app manually:
// Settings → Apps → Texxano → Battery → Unrestricted
```

---

## Summary

### ✅ No New Libraries Needed! Using:
- **expo-location** (foreground service) - ALREADY HAVE
- **expo-notifications** (duration display) - ALREADY HAVE
- **AsyncStorage** (track persistence) - ALREADY HAVE

### 📦 Files Created:
1. `src/services/trackingNotificationService.js` - Notification manager (NEW)
2. Updated: `src/services/appStatusService.js` - Better foreground text

### ⏱️ Implementation Time: 1-2 hours
1. Add trackingNotificationService.js (done)
2. Integrate with start/stop tracking (30 min)
3. Add recovery on app restart (30 min)
4. Test (30 min)

### 🎯 Expected Result:
- ✅ Persistent notifications during tracking
- ✅ Live duration counter (updates every minute)
- ✅ Process survives app kill/swipe
- ✅ Heartbeats continue indefinitely
- ✅ No more 1-minute tracks!
