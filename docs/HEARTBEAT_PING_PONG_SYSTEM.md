# Heartbeat Ping/Pong System - Implementation Guide

## System Architecture

### Dual-Layer Detection System

```
┌─────────────────────────────────────────────────────────────────┐
│              LAYER 1: Proactive Heartbeat (Primary)             │
├─────────────────────────────────────────────────────────────────┤
│  • App sends heartbeat every 25-30 seconds while tracking       │
│  • Backend updates UserAppStatus.LastHeartbeat timestamp        │
│  • Baseline detection: App is alive and working normally        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│         LAYER 2: Ping/Pong Verification (When App Dies)         │
├─────────────────────────────────────────────────────────────────┤
│  1. Backend detects: LastHeartbeat > 60 seconds ago            │
│  2. Backend sends: FCM "heartbeat_ping" notification            │
│  3. App responds: "pong" with geofence status                   │
│  4. Backend decides: Auto-stop or wait based on location        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Technology Stack (.NET)

### Required NuGet Packages
```bash
# Core packages
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer  # or your DB provider

# Push notifications
dotnet add package Expo.Server.Sdk

# Background jobs
dotnet add package Hangfire.AspNetCore
dotnet add package Hangfire.SqlServer  # or your DB provider

# Logging (recommended)
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
```

### Framework Requirements
- **.NET 6.0 or later** (tested with .NET 6/7/8)
- **Entity Framework Core** for database operations
- **Hangfire** for scheduled background jobs
- **SQL Server** (or PostgreSQL/MySQL with appropriate providers)

### Alternative: Without External Dependencies
If you prefer not to use Hangfire, you can implement the monitor job using:
- **Hosted Services** (`IHostedService` with `BackgroundService`)
- **Timer-based execution** (`PeriodicTimer` in .NET 7+)
- **Quartz.NET** (alternative scheduler)

---

## Mobile Implementation (✅ COMPLETED)

### Heartbeat Endpoint
- **URL:** `POST /users/heartbeat`
- **Source Files:**
  - Background task: `src/services/appStatusService.js`
  - Ping/pong handler: `src/utils/backgroundNotificationHandler.js`

### Pong Payload Structure
```json
{
  "timestamp": "2026-03-23T12:00:01.234Z",
  "platform": "android",
  "latitude": 41.9981,
  "longitude": 21.4254,
  "isInsideGeofence": true,
  "source": "fcm_pong"
}
```

### Field Specifications
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 string | ✅ Yes | When pong was sent |
| `platform` | "android" \| "ios" | ✅ Yes | Device OS |
| `latitude` | number | ⚠️ Optional | GPS latitude |
| `longitude` | number | ⚠️ Optional | GPS longitude |
| `isInsideGeofence` | boolean \| null | ✅ Yes | `true` = inside building<br>`false` = outside building<br>`null` = unknown (no location) |
| `source` | "fcm_pong" | ✅ Yes | Identifies ping/pong heartbeat |

---

## Backend Implementation (❌ TODO)

### 1. Primary Heartbeat Handling

#### Endpoint: `POST /users/heartbeat`
```csharp
[HttpPost("heartbeat")]
[Authorize]
public async Task<IActionResult> ReceiveHeartbeat([FromBody] HeartbeatRequest request)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Unauthorized();
    
    try
    {
        var userStatus = await _context.UserAppStatus
            .FirstOrDefaultAsync(u => u.UserId == int.Parse(userId));
        
        if (userStatus == null)
        {
            userStatus = new UserAppStatus { UserId = int.Parse(userId) };
            _context.UserAppStatus.Add(userStatus);
        }
        
        // Update last heartbeat timestamp
        userStatus.LastHeartbeat = request.Timestamp;
        userStatus.Platform = request.Platform;
        userStatus.LastLatitude = request.Latitude;
        userStatus.LastLongitude = request.Longitude;
        
        // If this is a pong response, log geofence status
        if (request.Source == "fcm_pong")
        {
            _logger.LogInformation($"📥 PONG from user {userId}: isInsideGeofence={request.IsInsideGeofence}");
            
            userStatus.LastGeofenceStatus = request.IsInsideGeofence;
            userStatus.LastPongTime = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
        
        return Ok(new { success = true });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Heartbeat error");
        return StatusCode(500, new { error = "Failed to process heartbeat" });
    }
}

// Request DTO
public class HeartbeatRequest
{
    public DateTime Timestamp { get; set; }
    public string Platform { get; set; } // "android" or "ios"
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool? IsInsideGeofence { get; set; }
    public string Source { get; set; } // "fcm_pong" or "background_heartbeat_task"
}
```

#### Database Schema Updates
```sql
-- Add new fields to UserAppStatus table (SQL Server syntax)
ALTER TABLE UserAppStatus ADD LastHeartbeat DATETIME2 NULL;
ALTER TABLE UserAppStatus ADD LastGeofenceStatus BIT NULL;
ALTER TABLE UserAppStatus ADD LastPongTime DATETIME2 NULL;
ALTER TABLE UserAppStatus ADD LastPingTime DATETIME2 NULL;
ALTER TABLE UserAppStatus ADD Platform NVARCHAR(10) NULL;
ALTER TABLE UserAppStatus ADD LastLatitude DECIMAL(10, 8) NULL;
ALTER TABLE UserAppStatus ADD LastLongitude DECIMAL(11, 8) NULL;
```

#### Entity Model
```csharp
public class UserAppStatus
{
    [Key]
    public int Id { get; set; }
    
    public int UserId { get; set; }
    public DateTime? LastHeartbeat { get; set; }
    public bool? LastGeofenceStatus { get; set; }
    public DateTime? LastPongTime { get; set; }
    public DateTime? LastPingTime { get; set; }
    public string Platform { get; set; } // "android" or "ios"
    public decimal? LastLatitude { get; set; }
    public decimal? LastLongitude { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; }
}
```

---

### 2. Heartbeat Monitor Job (New)

**Schedule:** Run every 30 seconds using Hangfire or similar

#### Hangfire Configuration (Program.cs or Startup.cs)
```csharp
// Add Hangfire services
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

// Register services
builder.Services.AddScoped<HeartbeatMonitorService>();
builder.Services.AddScoped<PushNotificationService>();

// After app.Build()
var app = builder.Build();

// Configure Hangfire dashboard (optional - for monitoring)
app.UseHangfireDashboard("/hangfire");

// Schedule recurring job
RecurringJob.AddOrUpdate<HeartbeatMonitorService>(
    "monitor-heartbeats",
    service => service.MonitorHeartbeats(),
    "*/30 * * * * *" // Every 30 seconds
);
```

#### Service Implementation
```csharp
public class HeartbeatMonitorService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HeartbeatMonitorService> _logger;
    private readonly PushNotificationService _pushService;
    
    public HeartbeatMonitorService(
        ApplicationDbContext context,
        ILogger<HeartbeatMonitorService> logger,
        PushNotificationService pushService)
    {
        _context = context;
        _logger = logger;
        _pushService = pushService;
    }
    
    public async Task MonitorHeartbeats()
    {
        _logger.LogInformation("🔍 Checking for missing heartbeats...");
        
        try
        {
            var sixtySecondsAgo = DateTime.UtcNow.AddSeconds(-60);
            
            // Find users with active tracking but missing heartbeats
            var staleUsers = await _context.UserAppStatus
                .Include(u => u.User)
                .Where(u => 
                    u.LastHeartbeat == null || 
                    u.LastHeartbeat < sixtySecondsAgo
                )
                .Join(_context.TimeTracks,
                    status => status.UserId,
                    track => track.UserId,
                    (status, track) => new { Status = status, Track = track })
                .Where(x => x.Track.StoppedAt == null)
                .Join(_context.Devices,
                    x => x.Status.UserId,
                    device => device.UserId,
                    (x, device) => new StaleUserInfo
                    {
                        UserId = x.Status.UserId,
                        Name = x.Status.User.Name,
                        LastHeartbeat = x.Status.LastHeartbeat,
                        LastGeofenceStatus = x.Status.LastGeofenceStatus,
                        LastPongTime = x.Status.LastPongTime,
                        LastPingTime = x.Status.LastPingTime,
                        TrackId = x.Track.Id,
                        StartedAt = x.Track.StartedAt,
                        ExpoPushToken = device.ExpoPushToken
                    })
                .ToListAsync();
            
            foreach (var user in staleUsers)
            {
                await HandleStaleUser(user);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Heartbeat monitor error");
        }
    }
    
    private async Task HandleStaleUser(StaleUserInfo user)
    {
        var now = DateTime.UtcNow;
        
        // CASE 1: No ping sent yet - send first ping
        if (user.LastPingTime == null)
        {
            _logger.LogWarning($"⚠️ User {user.Name} - Missing heartbeat, sending FIRST PING");
            await _pushService.SendHeartbeatPing(user.UserId, user.TrackId, user.ExpoPushToken);
            return;
        }
        
        // CASE 2: Ping sent but no pong received within 30 seconds - app is dead
        var pingAge = (now - user.LastPingTime.Value).TotalSeconds;
        var noPongReceived = user.LastPongTime == null || user.LastPongTime < user.LastPingTime;
        
        if (noPongReceived && pingAge > 30)
        {
            _logger.LogWarning($"🛑 User {user.Name} - No PONG received, app confirmed DEAD, auto-stopping");
            await AutoStopTracking(user.UserId, user.TrackId, "App killed/swiped - no response to ping");
            return;
        }
        
        // CASE 3: Pong received with isInsideGeofence = false - user left building
        if (user.LastPongTime != null && user.LastGeofenceStatus == false)
        {
            _logger.LogWarning($"🛑 User {user.Name} - PONG shows user OUTSIDE geofence, auto-stopping");
            await AutoStopTracking(user.UserId, user.TrackId, "Left building while app was killed");
            return;
        }
        
        // CASE 4: Pong received with isInsideGeofence = true - user still inside, wait longer
        if (user.LastPongTime != null && user.LastGeofenceStatus == true)
        {
            var timeSincePong = (now - user.LastPongTime.Value).TotalSeconds;
            if (timeSincePong < 300) // 5 minutes grace period
            {
                _logger.LogInformation($"⏳ User {user.Name} - PONG shows INSIDE geofence ({Math.Round(timeSincePong)}s ago), waiting...");
                return; // Don't auto-stop yet
            }
            else
            {
                _logger.LogWarning($"🛑 User {user.Name} - Still inside but 5min grace period expired, auto-stopping");
                await AutoStopTracking(user.UserId, user.TrackId, "App dead for 5+ minutes (inside building)");
                return;
            }
        }
        
        // CASE 5: Last ping was > 60 seconds ago - send another ping
        if (pingAge > 60)
        {
            _logger.LogWarning($"⚠️ User {user.Name} - Sending RETRY PING (last ping: {Math.Round(pingAge)}s ago)");
            await _pushService.SendHeartbeatPing(user.UserId, user.TrackId, user.ExpoPushToken);
            return;
        }
    }
    
    private async Task AutoStopTracking(int userId, int trackId, string reason)
    {
        // Implementation in next section...
    }
}

// Helper DTO
public class StaleUserInfo
{
    public int UserId { get; set; }
    public string Name { get; set; }
    public DateTime? LastHeartbeat { get; set; }
    public bool? LastGeofenceStatus { get; set; }
    public DateTime? LastPongTime { get; set; }
    public DateTime? LastPingTime { get; set; }
    public int TrackId { get; set; }
    public DateTime StartedAt { get; set; }
    public string ExpoPushToken { get; set; }
}
```

---

### 3. Send Ping Notification

**NuGet Package:** Install `Expo.Server.Sdk` or use HttpClient

```bash
dotnet add package Expo.Server.Sdk
```

```csharp
// PushNotificationService.cs
using Expo.Server.Sdk;

public class PushNotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PushNotificationService> _logger;
    private readonly PushApiClient _expoClient;
    
    public PushNotificationService(
        ApplicationDbContext context,
        ILogger<PushNotificationService> logger)
    {
        _context = context;
        _logger = logger;
        _expoClient = new PushApiClient();
    }
    
    public async Task SendHeartbeatPing(int userId, int trackId, string expoPushToken)
    {
        if (string.IsNullOrWhiteSpace(expoPushToken) || 
            !PushApiClient.IsExponentPushToken(expoPushToken))
        {
            _logger.LogError($"Invalid push token for user {userId}");
            return;
        }
        
        try
        {
            // Update last ping time
            var userStatus = await _context.UserAppStatus
                .FirstOrDefaultAsync(u => u.UserId == userId);
            
            if (userStatus != null)
            {
                userStatus.LastPingTime = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            
            // Build push notification message
            var pushTicketRequest = new PushTicketRequest
            {
                PushTo = new List<string> { expoPushToken },
                PushTitle = null,
                PushBody = null,
                PushData = new Dictionary<string, object>
                {
                    { "type", "heartbeat_ping" },
                    { "trackId", trackId.ToString() },
                    { "timestamp", DateTime.UtcNow.ToString("o") }
                },
                PushPriority = "high",
                PushSound = null // Silent notification
            };
            
            // Send notification
            var result = await _expoClient.PushSendAsync(pushTicketRequest);
            
            if (result?.PushTicketErrors?.Any() == true)
            {
                foreach (var error in result.PushTicketErrors)
                {
                    _logger.LogError($"Push error for user {userId}: {error.ErrorCode} - {error.ErrorMessage}");
                }
            }
            else
            {
                _logger.LogInformation($"✅ PING sent to user {userId} (trackId: {trackId})");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send ping to user {userId}");
        }
    }
}
```

---

### 4. Auto-Stop Tracking

```csharp
private async Task AutoStopTracking(int userId, int trackId, string reason)
{
    try
    {
        var stoppedAt = DateTime.UtcNow;
        
        // Find and stop the time track
        var track = await _context.TimeTracks
            .FirstOrDefaultAsync(t => t.Id == trackId);
        
        if (track != null)
        {
            track.StoppedAt = stoppedAt;
            track.AutoStoppedReason = reason;
            track.Duration = (int)(stoppedAt - track.StartedAt).TotalSeconds;
        }
        
        // Clear app status
        var userStatus = await _context.UserAppStatus
            .FirstOrDefaultAsync(u => u.UserId == userId);
        
        if (userStatus != null)
        {
            userStatus.LastHeartbeat = null;
            userStatus.LastGeofenceStatus = null;
            userStatus.LastPongTime = null;
            userStatus.LastPingTime = null;
        }
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation($"✅ Auto-stopped tracking for user {userId} - Reason: {reason}");
        
        // Optional: Send notification to user
        await SendNotificationToUser(userId, new NotificationRequest
        {
            Title = "Tracking Stopped",
            Body = $"Your time tracking was automatically stopped: {reason}"
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Failed to auto-stop tracking for user {userId}");
    }
}

private async Task SendNotificationToUser(int userId, NotificationRequest notification)
{
    var device = await _context.Devices
        .FirstOrDefaultAsync(d => d.UserId == userId);
    
    if (device?.ExpoPushToken == null)
        return;
    
    var pushTicketRequest = new PushTicketRequest
    {
        PushTo = new List<string> { device.ExpoPushToken },
        PushTitle = notification.Title,
        PushBody = notification.Body,
        PushSound = "default"
    };
    
    await _expoClient.PushSendAsync(pushTicketRequest);
}

public class NotificationRequest
{
    public string Title { get; set; }
    public string Body { get; set; }
}
```

---

## Testing Scenarios

### 1. Normal Operation
```
✅ Expected: Heartbeats every 30s, no pings sent
Timeline:
  0s: Heartbeat received
 30s: Heartbeat received
 60s: Heartbeat received
Result: No action needed
```

### 2. App Killed - User Inside Building
```
✅ Expected: Ping sent, pong returns "inside", wait 5 minutes
Timeline:
  0s: Last heartbeat received
 60s: No heartbeat → Send PING
 62s: PONG received: isInsideGeofence=true
120s: No heartbeat (still waiting)
360s: 5 minutes passed → Auto-stop with grace period message
```

### 3. App Killed - User Left Building
```
✅ Expected: Ping sent, pong returns "outside", immediate auto-stop
Timeline:
  0s: Last heartbeat received
 60s: No heartbeat → Send PING
 62s: PONG received: isInsideGeofence=false
 63s: Auto-stop immediately
```

### 4. App Killed - No Response
```
✅ Expected: Ping sent, no pong, auto-stop after 30s
Timeline:
  0s: Last heartbeat received
 60s: No heartbeat → Send PING
 90s: No PONG received → Auto-stop
```

### 5. Battery Optimization - Delayed Pong
```
✅ Expected: Multiple pings, eventual pong, decision based on status
Timeline:
  0s: Last heartbeat received
 60s: No heartbeat → Send PING #1
120s: No PONG → Send PING #2
125s: PONG received: isInsideGeofence=true (from PING #2)
Result: Wait 5 minutes from pong time
```

---

## Configuration Recommendations

```csharp
// Constants.cs or appsettings.json
public static class HeartbeatConfig
{
    public const int HEARTBEAT_INTERVAL_SECONDS = 30;        // 30 seconds
    public const int HEARTBEAT_TIMEOUT_SECONDS = 60;         // 60 seconds (trigger ping)
    public const int PONG_TIMEOUT_SECONDS = 30;              // 30 seconds (no response = dead)
    public const int INSIDE_GRACE_PERIOD_SECONDS = 300;      // 5 minutes (if inside building)
    public const int PING_RETRY_INTERVAL_SECONDS = 60;       // 60 seconds (retry ping)
    public const string MONITOR_JOB_CRON = "*/30 * * * * *"; // Every 30 seconds
}
```

```json
// appsettings.json (alternative)
{
  "HeartbeatMonitor": {
    "IntervalSeconds": 30,
    "TimeoutSeconds": 60,
    "PongTimeoutSeconds": 30,
    "InsideGracePeriodSeconds": 300,
    "PingRetryIntervalSeconds": 60
  }
}
```

---

## Advantages of This System

1. **Fast Detection:** App death detected within 60 seconds
2. **Smart Decisions:** Knows if user is inside/outside before stopping
3. **Battery Friendly:** Only sends ping when heartbeat missing
4. **Graceful Handling:** 5-minute grace period for users still inside
5. **Redundant:** Works even if proactive heartbeat fails
6. **Observable:** Clear logs for debugging and monitoring

---

## Deployment Checklist

### Mobile (✅ Completed)
- [x] Pong handler sends geofence status
- [x] Imports `isInsideAnyGeofence()` function
- [x] Handles location unavailable gracefully
- [x] Logs all ping/pong activity

### Backend (.NET) (❌ TODO)
- [ ] Install NuGet packages: `Expo.Server.Sdk`, `Hangfire.AspNetCore`
- [ ] Update heartbeat endpoint to accept `isInsideGeofence` field
- [ ] Add database columns for tracking ping/pong state (SQL migration)
- [ ] Create `HeartbeatMonitorService` class
- [ ] Configure Hangfire recurring job (30s interval)
- [ ] Create `PushNotificationService` class
- [ ] Implement `SendHeartbeatPing()` method
- [ ] Implement `AutoStopTracking()` method
- [ ] Add structured logging (Serilog recommended)
- [ ] Test all 5 scenarios above
- [ ] Deploy to staging and verify
- [ ] Update production database schema
- [ ] Deploy to production

---

## Monitoring & Alerts

### Key Metrics to Track
1. **Average ping-to-pong time:** Should be < 5 seconds
2. **Pong response rate:** Should be > 90%
3. **False positives:** Auto-stops when user is inside
4. **False negatives:** Not auto-stopping when user leaves

### Recommended Logging
```csharp
// Using structured logging (Serilog, NLog, etc.)
_logger.LogInformation("heartbeat_ping_sent {@Data}", new
{
    Event = "heartbeat_ping_sent",
    UserId = userId,
    TrackId = trackId,
    LastHeartbeat = lastHeartbeat,
    TimeSinceLastHeartbeat = (DateTime.UtcNow - lastHeartbeat).TotalSeconds
});

_logger.LogInformation("heartbeat_pong_received {@Data}", new
{
    Event = "heartbeat_pong_received",
    UserId = userId,
    TrackId = trackId,
    IsInsideGeofence = isInsideGeofence,
    Latitude = latitude,
    Longitude = longitude,
    ResponseTime = responseTime
});

_logger.LogWarning("auto_stop_tracking {@Data}", new
{
    Event = "auto_stop_tracking",
    UserId = userId,
    TrackId = trackId,
    Reason = reason,
    LastHeartbeat = lastHeartbeat,
    LastPong = lastPong,
    WasInsideGeofence = wasInsideGeofence
});
```

---

## .NET Implementation Quick Reference

### Key Classes to Create

```
YourBackendProject/
├── Controllers/
│   └── HeartbeatController.cs         # POST /users/heartbeat endpoint
├── Services/
│   ├── HeartbeatMonitorService.cs     # Background monitoring job
│   └── PushNotificationService.cs     # Send FCM pings
├── Models/
│   ├── UserAppStatus.cs               # Entity model
│   ├── HeartbeatRequest.cs            # Request DTO
│   └── NotificationRequest.cs         # Notification DTO
└── Data/
    └── ApplicationDbContext.cs        # EF Core context
```

### Database Migration
```bash
# Create migration
dotnet ef migrations add AddHeartbeatPingPongColumns

# Apply to database
dotnet ef database update
```

### Testing Endpoints

```bash
# Test heartbeat endpoint (PowerShell)
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN" }
$body = @{
    timestamp = (Get-Date -Format "o")
    platform = "android"
    latitude = 41.9981
    longitude = 21.4254
    isInsideGeofence = $true
    source = "fcm_pong"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-api.com/users/heartbeat" `
    -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

### Hangfire Dashboard Access
Once deployed, access the Hangfire dashboard at:
- Local: `https://localhost:5001/hangfire`
- Production: `https://your-api.com/hangfire`

You can monitor:
- ✅ Job execution history
- ⏱️ Average execution time
- ❌ Failed job count
- 📊 Real-time job statistics

### Important .NET Notes

1. **DateTime Handling:** Always use `DateTime.UtcNow` for consistency with mobile timestamps
2. **Nullable Types:** `bool?` allows three states: true, false, null (important for `isInsideGeofence`)
3. **Async/Await:** All database and HTTP operations should be async
4. **Dependency Injection:** Register services in `Program.cs` with appropriate lifetime (Scoped recommended)
5. **Error Handling:** Wrap service methods in try-catch to prevent job failures from crashing the system

### Performance Tips

- Use `.AsNoTracking()` for read-only queries to improve performance
- Index database columns: `LastHeartbeat`, `UserId`, `StoppedAt`
- Consider batching multiple ping notifications if many users are affected
- Use compiled queries for frequently executed database operations

---

## Contact & Support
For questions or issues, contact the mobile team or refer to:
- Main implementation: `src/utils/backgroundNotificationHandler.js`
- Heartbeat service: `src/services/appStatusService.js`
- Geofence logic: `src/utils/locationModule.tsx`
