# FCM Ping-Pong Backend Implementation (.NET)

## Overview

Replace client-initiated heartbeat with server-initiated FCM ping-pong.

**Before:** App sends heartbeat every 30s → killed by Android Doze  
**After:** Server sends FCM ping → App wakes up → App responds with heartbeat

---

## 1. Install NuGet Package

```bash
dotnet add package FirebaseAdmin
```

---

## 2. FCM Service

```csharp
// Services/FcmService.cs
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

public class FcmService
{
    private readonly FirebaseMessaging _messaging;

    public FcmService()
    {
        if (FirebaseApp.DefaultInstance == null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile("firebase-service-account.json")
            });
        }
        _messaging = FirebaseMessaging.DefaultInstance;
    }

    /// <summary>
    /// Send heartbeat ping to user's device via FCM
    /// IMPORTANT: This is a DATA-ONLY message (no notification block)
    /// so the app receives it even when backgrounded/killed
    /// </summary>
    public async Task SendHeartbeatPing(string fcmToken, string trackId)
    {
        var message = new Message
        {
            Token = fcmToken,
            // DATA-ONLY - no Notification block!
            Data = new Dictionary<string, string>
            {
                { "type", "heartbeat_ping" },
                { "trackId", trackId },
                { "timestamp", DateTime.UtcNow.ToString("o") }
            },
            // Android: High priority wakes device from Doze
            Android = new AndroidConfig
            {
                Priority = Priority.High
            },
            // iOS: content-available enables background execution
            Apns = new ApnsConfig
            {
                Headers = new Dictionary<string, string>
                {
                    { "apns-priority", "10" }
                },
                Aps = new Aps
                {
                    ContentAvailable = true
                }
            }
        };

        try
        {
            var response = await _messaging.SendAsync(message);
            // response contains the message ID if successful
        }
        catch (FirebaseMessagingException ex)
        {
            // Token invalid or expired - should remove from database
            if (ex.MessagingErrorCode == MessagingErrorCode.Unregistered)
            {
                // TODO: Remove invalid token from database
                // await RemoveUserFcmToken(fcmToken);
            }
            throw;
        }
    }
}
```

---

## 3. Heartbeat Ping Background Service

Sends FCM ping to all users with active time tracking every 1 minute.

```csharp
// BackgroundServices/HeartbeatPingService.cs
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public class HeartbeatPingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HeartbeatPingService> _logger;

    public HeartbeatPingService(
        IServiceProvider serviceProvider,
        ILogger<HeartbeatPingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("HeartbeatPingService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SendPingsToActiveUsers();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending heartbeat pings");
            }

            // Wait 1 minute before next batch
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    private async Task SendPingsToActiveUsers()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var fcmService = scope.ServiceProvider.GetRequiredService<FcmService>();

        // Get all active time tracks (Stop == null means still tracking)
        var activeTracks = await dbContext.TimeTracks
            .Where(t => t.Stop == null)
            .Select(t => new
            {
                TrackId = t.Id,
                t.UserId
            })
            .ToListAsync();

        _logger.LogInformation("Sending heartbeat pings to {Count} active users", activeTracks.Count);

        foreach (var track in activeTracks)
        {
            try
            {
                // Get user's FCM token from database
                var fcmToken = await dbContext.Users
                    .Where(u => u.Id == track.UserId)
                    .Select(u => u.FcmToken)
                    .FirstOrDefaultAsync();

                if (string.IsNullOrEmpty(fcmToken))
                {
                    _logger.LogWarning("User {UserId} has no FCM token", track.UserId);
                    continue;
                }

                await fcmService.SendHeartbeatPing(fcmToken, track.TrackId.ToString());
                _logger.LogDebug("Sent ping to user {UserId}, track {TrackId}", track.UserId, track.TrackId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send ping to user {UserId}", track.UserId);
            }
        }
    }
}
```

---

## 4. Heartbeat Timeout Service

Checks for inactive users and auto-stops their tracking.

```csharp
// BackgroundServices/HeartbeatTimeoutService.cs
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public class HeartbeatTimeoutService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HeartbeatTimeoutService> _logger;
    
    // Timeout duration - stop tracking if no heartbeat for this long
    private readonly TimeSpan _timeout = TimeSpan.FromMinutes(1);

    public HeartbeatTimeoutService(
        IServiceProvider serviceProvider,
        ILogger<HeartbeatTimeoutService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("HeartbeatTimeoutService started with {Timeout} timeout", _timeout);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndStopInactiveUsers();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking heartbeat timeouts");
            }

            // Check every 30 seconds
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    private async Task CheckAndStopInactiveUsers()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoff = DateTime.UtcNow - _timeout;

        // Find active tracks with no recent heartbeat
        var staleTracks = await dbContext.TimeTracks
            .Where(t => t.Stop == null && t.LastHeartbeat < cutoff)
            .ToListAsync();

        if (!staleTracks.Any())
            return;

        _logger.LogWarning("Found {Count} stale tracks to auto-stop", staleTracks.Count);

        foreach (var track in staleTracks)
        {
            _logger.LogWarning(
                "Auto-stopping track {TrackId} for user {UserId} - last heartbeat: {LastHeartbeat}",
                track.Id, track.UserId, track.LastHeartbeat);

            track.Stop = DateTime.UtcNow;
            track.StoppedReason = "heartbeat_timeout";
            track.StoppedBy = "system";
        }

        await dbContext.SaveChangesAsync();
    }
}
```

---

## 5. Heartbeat Endpoint

Update your existing heartbeat endpoint to accept the new fields:

```csharp
// Controllers/UsersController.cs
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<UsersController> _logger;

    public UsersController(AppDbContext dbContext, ILogger<UsersController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat([FromBody] HeartbeatRequest request)
    {
        _logger.LogDebug(
            "Heartbeat received - User: {UserId}, Track: {TrackId}, Source: {Source}",
            request.UserId, request.TrackId, request.Source);

        // Find the active track
        var track = await _dbContext.TimeTracks
            .FirstOrDefaultAsync(t => 
                t.UserId == request.UserId && 
                t.Stop == null);

        if (track == null)
        {
            _logger.LogWarning("Heartbeat for non-existent track - User: {UserId}", request.UserId);
            return NotFound(new { message = "No active track found" });
        }

        // Update last heartbeat timestamp
        track.LastHeartbeat = DateTime.UtcNow;
        
        // Optionally track if this was FCM-triggered
        if (request.Source == "fcm_pong")
        {
            track.LastFcmPong = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true });
    }
}

// Models/HeartbeatRequest.cs
public class HeartbeatRequest
{
    public string UserId { get; set; }
    public string RootId { get; set; }
    public DateTime Timestamp { get; set; }
    public DateTime? PingTimestamp { get; set; }  // When server sent the ping
    public string TrackId { get; set; }
    public string Source { get; set; }  // "fcm_pong" for FCM-triggered heartbeats
}
```

---

## 6. Database Model Update

Add `LastHeartbeat` field to your TimeTrack model:

```csharp
// Models/TimeTrack.cs
public class TimeTrack
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public DateTime Start { get; set; }
    public DateTime? Stop { get; set; }
    
    // Heartbeat tracking
    public DateTime? LastHeartbeat { get; set; }
    public DateTime? LastFcmPong { get; set; }
    public string StoppedReason { get; set; }  // "manual", "heartbeat_timeout", "geofence"
    public string StoppedBy { get; set; }      // "user", "system", "admin"
    
    // ... other fields
}
```

Migration:

```bash
dotnet ef migrations add AddHeartbeatFields
dotnet ef database update
```

---

## 7. Register Services in Program.cs

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// ... other services

// FCM Service
builder.Services.AddSingleton<FcmService>();

// Background Services
builder.Services.AddHostedService<HeartbeatPingService>();
builder.Services.AddHostedService<HeartbeatTimeoutService>();

var app = builder.Build();
// ... rest of app
```

---

## 8. Firebase Service Account

Download from Firebase Console:
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `firebase-service-account.json` in your project root
4. **DO NOT commit to git** - add to `.gitignore`

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EVERY 1 MINUTE                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  HeartbeatPingService                                       │
│  1. Query TimeTracks WHERE Stop == null                     │
│  2. For each active track:                                  │
│     - Get user's FCM token                                  │
│     - Send FCM data message { type: "heartbeat_ping" }      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Mobile App (backgroundNotificationHandler.js)              │
│  1. Receives FCM with type === "heartbeat_ping"             │
│  2. Calls POST /users/heartbeat { source: "fcm_pong" }      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  UsersController.Heartbeat()                                │
│  1. Find active track for user                              │
│  2. Update LastHeartbeat = DateTime.UtcNow                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EVERY 30 SECONDS                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  HeartbeatTimeoutService                                    │
│  1. Query TimeTracks WHERE Stop == null                     │
│     AND LastHeartbeat < (now - 1 minute)                    │
│  2. For each stale track:                                   │
│     - Set Stop = DateTime.UtcNow                            │
│     - Set StoppedReason = "heartbeat_timeout"               │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing

1. Start a time track from mobile app
2. Check server logs for "Sending heartbeat pings to X active users"
3. Check mobile logs for "💓 Received heartbeat PING from server"
4. Check server logs for "Heartbeat received" with `source: fcm_pong`
5. Kill the app and wait 1+ minutes - track should auto-stop
