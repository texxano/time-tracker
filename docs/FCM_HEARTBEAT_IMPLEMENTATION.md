# FCM Ping-Pong Heartbeat Implementation

## Overview

Replace the current client-initiated heartbeat system with a server-initiated FCM ping-pong mechanism. This eliminates the need for:
- `react-native-background-actions` library
- Battery optimization exemption prompts
- Persistent foreground notification on Android

---

## Current System (Problems)

```
App → sends heartbeat every 25 seconds → Backend
          ↓
If no heartbeat for 3 minutes → Backend stops tracking
```

**Issues:**
1. Android Doze mode kills the foreground service when battery saver is ON
2. Users must disable battery optimization (many don't or can't)
3. Annoying persistent notification ("Texxano running")
4. Doesn't work when app is killed/swiped away

---

## New System (FCM Ping-Pong)

```
Backend → sends FCM "ping" every 2 minutes → App wakes up
                                                    ↓
                                            App calls POST /users/heartbeat
                                                    ↓
                                            Backend receives "pong"
```

**Benefits:**
1. ✅ FCM high-priority messages wake app even in Doze mode
2. ✅ No battery optimization needed
3. ✅ No persistent notification
4. ✅ Works even when app is killed (FCM restarts app briefly)

---

## Backend Changes Required

### 1. New Background Job: Send Ping to Active Users

When a user has active time tracking, send FCM ping every **2 minutes**.

```csharp
// Pseudo-code for backend scheduled job
public async Task SendHeartbeatPings()
{
    // Get all users currently tracking time
    var activeUsers = await GetUsersWithActiveTracking();
    
    foreach (var user in activeUsers)
    {
        // Get user's FCM token from database
        var fcmToken = await GetUserFcmToken(user.Id);
        
        if (fcmToken != null)
        {
            await SendFcmMessage(fcmToken, new {
                type = "heartbeat_ping",
                trackId = user.ActiveTrackId,
                timestamp = DateTime.UtcNow.ToString("o")
            });
        }
    }
}
```

### 2. FCM Message Format

Send as **data-only message** (not notification) so app receives it in background:

```json
{
  "to": "<user_fcm_token>",
  "priority": "high",
  "data": {
    "type": "heartbeat_ping",
    "trackId": "abc123",
    "timestamp": "2026-03-21T10:30:00Z"
  }
}
```

**Important:** 
- Use `"priority": "high"` for Android to wake device
- For iOS, include `"content-available": 1` for background wake

### 3. Modify Heartbeat Timeout Logic

Current: Stop tracking if no heartbeat for **3 minutes**

New: Stop tracking if no heartbeat response for **5 minutes** after ping sent

```
Timeline:
0:00 - User starts tracking
2:00 - Backend sends ping #1
2:01 - App responds with heartbeat ✓
4:00 - Backend sends ping #2
4:01 - App responds with heartbeat ✓
6:00 - Backend sends ping #3
      - No response (app killed, no network, etc.)
8:00 - Backend sends ping #4
      - Still no response
10:00 - Backend sends ping #5 + warning notification
       - "Are you still working?"
11:00 - If no response → Stop tracking automatically
```

### 4. Optional: Existing Heartbeat Endpoint Works

The current `POST /users/heartbeat` endpoint can remain unchanged. The mobile app will call it when receiving a ping.

---

## Mobile App Changes Required

### 1. Handle FCM "ping" Messages

In the FCM notification handler, detect `heartbeat_ping` and respond:

```javascript
// In notificationHandlers.js or similar
export const handleFcmMessage = async (remoteMessage) => {
  const data = remoteMessage.data;
  
  if (data?.type === 'heartbeat_ping') {
    console.log('💓 Received heartbeat ping from server');
    
    // Respond with heartbeat
    await sendHeartbeatResponse(data.trackId, data.timestamp);
    return;
  }
  
  // ... handle other notification types
};

const sendHeartbeatResponse = async (trackId, pingTimestamp) => {
  try {
    const token = await getTokenFromStorage();
    if (!token) return;
    
    await fetch(`${BASE_URL_API}/users/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        pingTimestamp: pingTimestamp,
        trackId: trackId,
        platform: Platform.OS,
        source: 'fcm_pong',
      }),
    });
    
    console.log('✅ Heartbeat pong sent');
  } catch (error) {
    console.log('❌ Failed to send heartbeat pong:', error);
  }
};
```

### 2. Register FCM Handler for Background/Killed State

```javascript
// In index.js (before AppRegistry.registerComponent)
import messaging from '@react-native-firebase/messaging';

// Handle background/killed state messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (remoteMessage.data?.type === 'heartbeat_ping') {
    await sendHeartbeatResponse(
      remoteMessage.data.trackId,
      remoteMessage.data.timestamp
    );
  }
});
```

### 3. Remove/Deprecate Old Heartbeat Service

- Stop calling `startForegroundHeartbeat()` when tracking starts
- Can keep the service for **fallback** during transition period
- Eventually remove `react-native-background-actions` dependency

---

## Migration Plan

### Phase 1: Backend Implementation
1. Create scheduled job to send FCM pings to active tracking users
2. Test FCM delivery with existing app (app will ignore unknown messages)
3. Extend timeout from 3 → 5 minutes

### Phase 2: Mobile App Update
1. Add FCM ping handler
2. Keep old heartbeat service running in parallel (fallback)
3. Release update to stores

### Phase 3: Cleanup (After 2+ weeks)
1. Monitor: Are users receiving pings and responding?
2. Remove battery optimization prompt
3. Remove foreground service notification
4. Eventually remove `react-native-background-actions`

---

## Testing Checklist

### Backend
- [ ] FCM ping sent every 2 minutes to active tracking users
- [ ] Only send to users with valid FCM tokens
- [ ] Stop sending pings when tracking stops
- [ ] Handle token refresh (user re-login)

### Mobile (Android)
- [ ] App receives ping when in foreground → responds
- [ ] App receives ping when in background → responds
- [ ] App receives ping when killed → responds (FCM wakes app)
- [ ] Works with battery optimization ON
- [ ] Works in Doze mode

### Mobile (iOS)
- [ ] App receives ping when in foreground → responds
- [ ] App receives ping when in background → responds
- [ ] App receives ping when killed → responds (limited on iOS)

---

## FCM Token Management

The backend needs the user's FCM token. Ensure:

1. Mobile app sends FCM token on login:
   ```javascript
   const fcmToken = await messaging().getToken();
   await api.post('/users/fcm-token', { token: fcmToken });
   ```

2. Mobile app updates token when it changes:
   ```javascript
   messaging().onTokenRefresh(async (newToken) => {
     await api.post('/users/fcm-token', { token: newToken });
   });
   ```

3. Backend stores token per user (may already exist for push notifications)

---

## Questions for Monday Meeting

1. **Is FCM token already stored per user in the database?**
   - If yes, which table/field?
   - If no, need to add it

2. **What job scheduler does the backend use?**
   - Hangfire? Quartz? Azure Functions Timer?
   - Need to add 2-minute recurring job

3. **Current timeout is 3 minutes. OK to extend to 5 minutes?**
   - Gives more buffer for network delays

4. **Should we send a warning notification before auto-stop?**
   - "Your tracking will stop in 1 minute if no response"

---

## Files to Modify (Mobile)

| File | Change |
|------|--------|
| `src/utils/notificationHandlers.js` | Add `heartbeat_ping` handler |
| `index.js` | Add `setBackgroundMessageHandler` |
| `src/services/foregroundHeartbeatService.js` | Eventually deprecate |
| `src/components/AppContainerClean.js` | Remove battery optimization prompt |
| `package.json` | Eventually remove `react-native-background-actions` |

---

## Estimated Effort

| Task | Time |
|------|------|
| Backend: FCM ping job | 2-4 hours |
| Backend: Extend timeout | 30 min |
| Mobile: FCM handler | 1-2 hours |
| Testing | 2-3 hours |
| **Total** | **~1 day** |
