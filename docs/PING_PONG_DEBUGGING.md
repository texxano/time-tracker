# Ping-Pong Killed State Debugging

## Problem

When the app is **killed** (swiped away from recent apps), console logs disappear. You can't see if the `heartbeat_ping` notification was received or if the pong response was sent successfully.

## Solution

**Persistent logging to AsyncStorage** - logs survive app restarts and can be read later.

---

## What's Logged

Every critical ping-pong event is written to AsyncStorage (`@texxano_ping_pong_log`):

### Events Logged:

1. **🔔 [BG TASK] Task triggered** - TaskManager woke up for notification
2. **💓 PING RECEIVED** - Server sent heartbeat_ping notification
3. **✅ PONG SENT** - Successfully sent pong response to backend
4. **❌ PONG FAILED** - Failed to send pong (network error, etc.)

Each log entry includes:
- Timestamp (ISO format)
- Message (event description)
- Data (context like trackId, error details, geofence status)
- App state ("killed" when TaskManager is handling it)

---

## How to Read Logs

### Option 1: Debug Panel UI (Recommended)

Add the debug panel to any screen (e.g., Dashboard or Settings):

```javascript
import PingPongDebugPanel from '../components/PingPongDebugPanel';

// Inside your render:
<PingPongDebugPanel />
```

**Features:**
- ✅ See ping/pong counts and success rate
- ✅ View all logs with timestamps
- ✅ Export logs to share with backend team
- ✅ Clear old logs

### Option 2: Manual Code

Read logs programmatically from anywhere:

```javascript
import { readPingPongLogs, exportPingPongLogs } from '../utils/readPingPongLogs';

// Get all logs
const logs = await readPingPongLogs();
console.log('Ping-Pong Logs:', logs);

// Export formatted text
const formatted = await exportPingPongLogs();
console.log(formatted);
```

### Option 3: Chrome DevTools

1. Open app in development mode
2. Open Chrome DevTools (press `j` in Expo)
3. Go to Console
4. Run:
   ```javascript
   AsyncStorage.getItem('@texxano_ping_pong_log')
     .then(logs => console.log(JSON.parse(logs)));
   ```

---

## Testing Killed State

### Test Procedure

1. **Start tracking** - Make sure time tracking is active
2. **Kill the app** - Swipe away from recent apps (force kill)
3. **Backend sends ping** - Ask backend team to manually trigger a ping, or wait for automatic ping (after 3+ minutes of no heartbeat)
4. **Re-open app** - Launch app again
5. **Check logs** - Open Debug Panel or read logs manually

### Expected Logs When Working

```
[1] 2026-03-23T12:00:00.000Z
    🔔 [BG TASK] Task triggered
    Data: { hasError: false }

[2] 2026-03-23T12:00:00.100Z
    📦 [BG TASK] Notification data
    Data: { type: "heartbeat_ping" }

[3] 2026-03-23T12:00:00.150Z
    💓 [BG TASK] PING detected - processing
    Data: { trackId: 12345 }

[4] 2026-03-23T12:00:00.200Z
    💓 PING RECEIVED
    Data: { trackId: 12345, pingTimestamp: "2026-03-23T12:00:00.000Z" }

[5] 2026-03-23T12:00:01.500Z
    ✅ PONG SENT
    Data: { 
      trackId: 12345, 
      isInsideGeofence: true,
      responseStatus: 200,
      hasLocation: true
    }
```

### What It Means

- **All 5 logs present** = Killed state handling works perfectly ✅
- **Logs 1-4 but no PONG SENT** = TaskManager woke up but network failed ⚠️
- **No logs at all** = TaskManager didn't wake up (notification issue) ❌

---

## Common Issues

### No Logs When App Killed

**Possible causes:**
1. **TaskManager task not registered** 
   - Check: Look for `✅ [NOTIF INIT] Background notification task registered` in console on app start
   
2. **Notification not reaching device**
   - Backend may not be sending ping
   - FCM token expired/invalid
   - Device offline

3. **Android battery optimization**
   - Device killed the app too aggressively
   - Solution: Whitelist app from battery optimization (orange banner on Dashboard)

4. **Wrong notification format**
   - Backend must send `data.type = "heartbeat_ping"` (not in title/body)
   - Must be data-only push (no visible notification)

### PING RECEIVED but No PONG SENT

**Possible causes:**
1. **Network error** - Check error details in logs
2. **Invalid auth token** - Token may have expired
3. **Backend endpoint down** - `/users/heartbeat` not responding
4. **Geofence check timeout** - Location.getLastKnownPositionAsync() hung

Check the error logs for details:
```json
{
  "error": "Network request failed",
  "responseData": { "message": "Unauthorized" }
}
```

---

## Monitoring Success Rate

### Success Rate Formula

```
Success Rate = (Pongs Sent / Pings Received) × 100%
```

### Target: **90%+**

- **100%** = Perfect (all pings answered)
- **90-99%** = Good (occasional network hiccup)
- **70-89%** = Fair (investigate network/battery)
- **<70%** = Poor (critical issue, tracking will auto-stop)

---

## Sharing Logs with Backend

### Export and Send

1. Open Debug Panel
2. Tap **📤 Export**
3. Share via Slack/Email to backend team

### What Backend Needs

Backend team looks for:
- **Ping → Pong latency** (should be <2 seconds)
- **Missing pongs** (backend sees ping sent but no pong received)
- **Error patterns** (network timeouts, auth failures)
- **Geofence status** (users marked outside when actually inside)

---

## Log Retention

- **Max entries:** 50 logs (oldest automatically deleted)
- **Storage location:** AsyncStorage `@texxano_ping_pong_log`
- **Persistence:** Survives app restarts, OS reboots, app updates
- **Clear:** Tap "🗑️ Clear" in Debug Panel or reinstall app

---

## Integration with Backend Logs

### Backend Side

Backend logs all ping/pong events:
```sql
SELECT 
  user_id,
  ping_sent_at,
  pong_received_at,
  DATEDIFF(SECOND, ping_sent_at, pong_received_at) AS latency_seconds,
  pong_source
FROM heartbeat_logs
WHERE pong_source = 'fcm_pong'
ORDER BY ping_sent_at DESC;
```

### Cross-Reference

Compare mobile logs with backend logs to find discrepancies:
- Mobile shows "PONG SENT" but backend shows "no pong received" = Network issue
- Backend shows "ping sent" but mobile has no "PING RECEIVED" = FCM delivery issue
- Mobile shows "PING RECEIVED" but backend shows "no ping sent" = Duplicate token issue

---

## Production Monitoring

### Daily Health Check

1. Open app
2. Check Debug Panel
3. Look for recent pongs (last 10 minutes)
4. Verify success rate >90%

### Weekly Analysis

Export logs and check for patterns:
- Are pongs failing at specific times? (network congestion)
- Are certain users never responding? (device restrictions)
- Are geofence checks slow? (location permission revoked)

---

## Quick Reference

| Action | Code |
|--------|------|
| Read logs | `await readPingPongLogs()` |
| Export formatted | `await exportPingPongLogs()` |
| Clear logs | `await clearPingPongLogs()` |
| Recent logs only | `await getRecentPingPongLogs(10)` |
| Count events | `await countPingPongEvents()` |
| Last ping/pong times | `await getLastPingPongTimes()` |

---

## Files Modified

1. **backgroundNotificationHandler.js** - Added `persistPingPongLog()` calls
2. **readPingPongLogs.js** - Utility functions to read/analyze logs
3. **PingPongDebugPanel.js** - UI component to display logs

---

## Next Steps

1. ✅ **Add Debug Panel to Dashboard** - See logs in production
2. ✅ **Test killed state** - Force kill app and trigger ping from backend
3. ✅ **Monitor success rate** - Keep above 90%
4. ✅ **Share logs with backend** - Cross-reference with server logs

---

## Support

If you see consistent pong failures:
1. Export logs from Debug Panel
2. Check backend logs for same time period
3. Compare timestamps to find where pongs are getting lost
4. Share with mobile/backend teams for investigation
