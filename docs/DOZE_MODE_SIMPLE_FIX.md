# Android Doze Mode Fix (No Extra Libraries)

## 🔴 Problem
After 6 minutes with screen locked, Android Doze mode stops the heartbeat.

## ✅ Solution (3 Simple Changes)

### 1. Battery Optimization Permission
**File:** `app.json`
```json
"android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"
```
- Just a manifest entry, no new library
- Allows app to request battery exemption from user

### 2. Optimized Location Configuration  
**File:** `src/services/appStatusService.js`

Changed:
```javascript
activityType: Location.ActivityType.Fitness  // Was: Other
deferredUpdatesInterval: 30000               // NEW: batches updates during Doze
notificationBody: 'Time tracking active'     // Was: '' (empty)
```

**Why This Works:**
- `Fitness` activity type: Android knows this is health/fitness tracking → more lenient Doze
- `deferredUpdatesInterval`: Batches location updates during Doze maintenance windows
- Visible notification: Shows user the app is actively tracking

### 3. User Prompt (React Native Alert Only)
**File:** `src/components/AppContainerClean.js`

```javascript
Alert.alert(
  '⚡ Enable Reliable Tracking',
  'Disable battery optimization...',
  [
    { text: 'Later' },
    { 
      text: 'Open Settings',
      onPress: () => Linking.openSettings()  // Built-in React Native API
    }
  ]
);
```

**What It Does:**
- Prompts once when tracking starts (first time only)
- Opens device settings with `Linking.openSettings()`
- User manually changes battery setting to "Unrestricted"

---

## 📱 User Instructions

When the alert appears, tap "Open Settings" then:

**All Android Devices:**
1. Find "Battery" or "App battery usage"
2. Select "Unrestricted" or "Not optimized"
3. Go back to the app

**Specific Brands:**
- **Samsung:** Battery → Unrestricted
- **Xiaomi:** Battery saver → No restrictions
- **Huawei:** Battery → App launch → Manual → Enable all switches

---

## 🚀 Deployment

```bash
# Requires new build (not OTA) because of manifest permission
eas build --platform android --profile production
```

---

## 🧪 Testing

**Test 1: Short Lock (Works Immediately)**
```
1. Start tracking
2. Lock screen 5 minutes
3. Check backend logs
Expected: Heartbeats every 30 seconds
```

**Test 2: Doze Mode (Requires Battery Exemption)**
```
1. Start tracking
2. Disable battery optimization when prompted
3. Lock screen 15+ minutes
4. Check backend logs
Expected: Heartbeats continue (small gaps during deep Doze are normal)
```

**Test 3: Force Doze (Developer Testing)**
```bash
adb shell dumpsys deviceidle force-idle
# Wait 2 minutes
# Check if heartbeats still arrive in backend
adb shell dumpsys deviceidle unforce
```

---

## 📊 Expected Results

### Without Battery Exemption ❌
```
0min  ✅ Heartbeat working
5min  ✅ Still working
6min  ❌ STOPPED (Doze kills it)
```

### With Battery Exemption ✅
```
0min  ✅ Heartbeat working
5min  ✅ Still working  
6min  ✅ Still working
30min ✅⏸️✅ Occasional gaps in Deep Doze (expected)
```

**Note:** Some gaps after 30+ minutes are normal in Deep Doze. This is expected Android behavior. The ping/pong system (see `HEARTBEAT_PING_PONG_SYSTEM.md`) handles this case.

---

## 🎯 Why This Works

1. **Fitness Activity Type:** Android categorizes fitness/health apps differently
2. **Deferred Updates:** Batches updates during Doze maintenance windows instead of being blocked
3. **Foreground Service:** Persistent notification keeps service priority high
4. **Battery Exemption:** User whitelists app from Doze restrictions

All using **only** libraries you already have:
- ✅ expo-location
- ✅ React Native core (Alert, Linking)
- ✅ AsyncStorage (already installed)

**Zero new dependencies!**

---

## ⚠️ Important Notes

1. **User action required:** They MUST disable battery optimization
2. **One-time prompt:** Only shows once (stored in AsyncStorage)
3. **Works with ping/pong:** If heartbeat still fails, backend ping/pong catches it
4. **Manufacturer variations:** Some brands (Xiaomi, Huawei) have extra battery settings

---

## 🔧 Troubleshooting

**Still stops after 6 minutes?**
1. Check user disabled battery optimization
2. Check foreground notification is visible while tracking
3. Check backend receives location updates (not just heartbeats)
4. Try on different device (some manufacturers override settings)

**Prompt not showing?**
- Clear app data or AsyncStorage key: `@texxano:battery_prompt_shown`

**Settings button doesn't open right screen?**
- Normal - `Linking.openSettings()` opens app info, user navigates to battery
- Some manufacturers hide this setting or use different names

---

## 📞 Support

If issues persist:
1. Check `adb logcat` for Doze-related messages
2. Verify device isn't on "Ultra battery saver" mode
3. Test with screen ON (should always work)
4. Confirm backend receives heartbeats before lock

The combination of:
- Optimized location config
- User battery exemption  
- FCM ping/pong fallback

...ensures the most reliable tracking possible! 🎉
