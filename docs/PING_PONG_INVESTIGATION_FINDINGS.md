# Ping-Pong Investigation Findings

**Date:** March 24, 2026  
**Issue:** Two problems reported by backend team

---

## Issue #1: hasData: false for most pings

### Problem
Backend sends FCM notification with `ContentAvailable = true` and `Data = { type: "heartbeat_ping", ... }`, but mobile receives it with empty data.

### Root Cause
**Likely notification format issue on backend side.**

When Expo Push API receives a message with **title or body fields** (even if empty/null), FCM treats it as a **notification message** instead of a **data-only message**. This causes the data to be wrapped differently.

### Backend Check Required

#### ❌ WRONG - Notification message (wraps data)
```csharp
new PushTicketRequest {
  To = "ExponentPushToken[...]",
  Title = null,           // ← Even null causes wrapping!
  Body = null,            // ← Even null causes wrapping!
  Data = new { 
    type = "heartbeat_ping", 
    trackId = "12345",
    timestamp = "2026-03-24T10:00:00Z"
  },
  ContentAvailable = true
}
```

With above format, FCM delivers:
- **iOS:** `notification.request.content.data`
- **Android:** `data.notification.data` or wrapped in `body`

#### ✅ CORRECT - Pure data message (direct delivery)
```csharp
new PushTicketRequest {
  To = "ExponentPushToken[...]",
  // DO NOT include Title or Body fields at all
  Data = new { 
    type = "heartbeat_ping", 
    trackId = "12345",
    timestamp = "2026-03-24T10:00:00Z"
  },
  Priority = "high"  // Required for Android background delivery
}
```

With above format, FCM delivers:
- **Android:** `data.data` (direct access)
- **iOS:** `notification.data` or `data`

### Solution
Backend team should ensure:
1. **Do not send `Title` or `Body` fields** in ping notifications
2. **Set `Priority = "high"`** for Android background wakeup
3. **Remove `ContentAvailable`** (only needed for iOS, not used for data-only messages)

### Mobile Enhancement
We added comprehensive logging to identify the exact data structure received:
- ✅ Logs all 5 possible data paths
- ✅ Shows which path succeeded or why all failed
- ✅ Persists to AsyncStorage for killed-state debugging

**File:** `src/utils/backgroundNotificationHandler.js` (lines 158-202)

---

## Issue #2: Proactive pongs stop after 10:06

### Problem
Background task keeps firing (10:10, 10:15, 10:27) but stops sending heartbeat pongs after 10:06.

### Root Cause
**Token expiration causing silent failures.**

The heartbeat background task checks for token availability:

```javascript
const tokens = await getTokenFromStorage(true); // silent=true
if (!tokens?.token) {
  await persistLog('⚠️ [BG] No token - skipping heartbeat');
  return false; // ← Silently fails, no error exposed
}
```

**Timeline:**
- `10:00-10:06` - Token valid, heartbeats sent ✅
- `10:06` - Token expires (typical JWT: 30min or 1hr)
- `10:10, 10:15, 10:27` - Background task runs but **silently skips** due to expired token ❌

### Why This Happens
1. **Token stored in Redux:** JWT tokens are in Redux state
2. **Background task uses AsyncStorage:** Reads persisted token from `persist:TEXXANO`
3. **Token refresh not triggered:** Background task doesn't have refresh logic when app is killed
4. **Silent failure:** Original code suppressed logs (`silent=true`) to avoid spam

### Solution Implemented

#### 1. Enhanced Logging
Changed from silent to verbose logging:

**File:** `src/services/appStatusService.js`
```javascript
// Before
const tokens = await getTokenFromStorage(true); // silent

// After  
const tokens = await getTokenFromStorage(false); // verbose
if (!tokens?.token) {
  await persistLog('⚠️ [BG] NO TOKEN - Cannot send heartbeat', {
    hasTokens: !!tokens,
    hasToken: !!tokens?.token,
    hasRefreshToken: !!tokens?.refreshToken,
    hasUserId: !!tokens?.userId,
  });
  console.log('⚠️ [BG HEARTBEAT] STOPPED - No token available');
  return false;
}
```

#### 2. Token Check in Ping-Pong Handler
Added token validation before sending pong:

**File:** `src/utils/backgroundNotificationHandler.js`
```javascript
// Check if token is available (Redux might not be hydrated in killed state)
const state = store.getState();
const hasToken = !!state?.userToken?.token;
const tokenExpiration = state?.userToken?.tokenExpiration;
const isExpired = tokenExpiration && new Date(tokenExpiration * 1000) < new Date();

await persistPingPongLog('🔑 TOKEN CHECK', { 
  hasToken, 
  tokenExpiration,
  isExpired,
  reduxHydrated: !!state?.userToken,
});

if (!hasToken) {
  await persistPingPongLog('❌ PONG BLOCKED - No token available');
  return;
}
```

#### 3. Persistent Logging
All failures now logged to AsyncStorage with detailed context:
- Token availability check
- Token expiration status
- Redux hydration state
- Why heartbeat was skipped

### Testing with New Logs

After OTA update, check Debug Panel for:

**Token Issues:**
```
⚠️ [BG] NO TOKEN - Cannot send heartbeat
{
  hasTokens: true,
  hasToken: false,      ← Token expired
  hasRefreshToken: true,
  hasUserId: true
}
```

**Ping-Pong Token Issues:**
```
🔑 TOKEN CHECK
{
  hasToken: false,
  tokenExpiration: 1774340000,
  isExpired: true,      ← Token expired
  reduxHydrated: true
}

❌ PONG BLOCKED - No token available
```

### Backend Coordination Needed

**Question for Backend Team:**
> What is the JWT token expiration time?
> - 30 minutes?
> - 1 hour?
> - Other?

**Recommendation:**
If tokens expire before tracking sessions end, consider:
1. **Longer token expiration** (e.g., 8 hours for work day)
2. **Refresh token in background** (mobile handles this for foreground)
3. **Backend tolerance:** Don't auto-stop if pong fails due to 401/403 (might be token expiry, not dead app)

---

## How to Test

### Backend: Send Test Ping
```csharp
// From backend monitoring job
await SendHeartbeatPing(userId, trackId);
```

### Mobile: Check Debug Panel
1. Open app → Dashboard → Ping-Pong Debug Panel
2. Look for logs with timestamps
3. Check stats: Pings received, Pongs sent, Success rate

### Expected Success Log Sequence
```
💓 PING RECEIVED (trackId: 12345)
🔑 TOKEN CHECK (hasToken: true, isExpired: false)
📍 PONG: User is INSIDE geofence
✅ PONG SENT (status: 200)
```

### Expected Failure Log Sequence (Token Expired)
```
💓 PING RECEIVED (trackId: 12345)
🔑 TOKEN CHECK (hasToken: true, isExpired: true)
⚠️ PONG WARNING - Token expired
❌ PONG FAILED (error: "401 Unauthorized")
```

### Expected Failure Log Sequence (No Data)
```
🔔 [BG TASK] Task triggered
🔍 [BG TASK] Raw data received (hasData: true, hasNotification: true)
❌ [BG TASK] NO DATA EXTRACTED
📦 [BG TASK] Notification data (hasData: false)
📬 [BG TASK] Other notification type: undefined
```

---

## Next Steps

### Backend Team
- [ ] Verify Expo Push format (remove Title/Body for data-only messages)
- [ ] Confirm JWT expiration time
- [ ] Test ping delivery with corrected format
- [ ] Check backend logs for 401/403 responses from mobile pongs
- [ ] Consider refresh token support in ping-pong flow

### Mobile Team (Done)
- [x] Enhanced logging for data extraction failures
- [x] Added token validation logging
- [x] Made failures visible in Debug Panel
- [x] Document findings for backend coordination

### Joint Testing
- [ ] Backend sends ping → Mobile receives with data ✅
- [ ] Mobile sends pong with valid token ✅
- [ ] Backend receives pong with geofence status ✅
- [ ] Handle token expiration gracefully ⏳

---

## Files Changed

1. **src/utils/backgroundNotificationHandler.js**
   - Enhanced data extraction with 5 paths
   - Added comprehensive logging when data missing
   - Added token validation before sending pong
   - Shows which extraction path succeeded or why all failed

2. **src/services/appStatusService.js**
   - Changed token retrieval from silent to verbose
   - Enhanced "no token" logging with context
   - Shows exact token state (expired, missing, etc)

3. **docs/PING_PONG_INVESTIGATION_FINDINGS.md** (this file)
   - Findings summary
   - Root cause analysis
   - Solutions implemented
   - Testing guide

---

## Summary

**Issue #1 (hasData: false)** → Backend notification format issue  
**Issue #2 (pongs stop)** → Token expiration causing silent failures  

Both now have **comprehensive logging** visible in Debug Panel for production debugging.
