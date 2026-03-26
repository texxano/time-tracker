# Update Notification System

## Overview
This system automatically notifies users when a new OTA (Over-The-Air) update is available and allows them to apply it with a single tap.

## How It Works

### User Experience Flow:
1. **User opens the app** → App checks for updates in the background
2. **Update available** → Download happens silently
3. **Update ready** → A banner notification appears at the top of the screen
4. **User taps "Update Now"** → App restarts with the new version
5. **User taps "Later"** → Banner dismisses (can open app again later to update)

### Technical Flow:
```
App Launch
    ↓
UpdateNotification Component Mounts
    ↓
expo-updates.checkForUpdateAsync()
    ↓
If update available → expo-updates.fetchUpdateAsync()
    ↓
Show Banner Notification
    ↓
User taps "Update Now"
    ↓
expo-updates.reloadAsync()
    ↓
App restarts with new version
```

## Files Modified/Created

### Created Files:
1. **`src/components/UpdateNotification.js`**
   - Main component that handles update checking and UI
   - Automatically checks on mount
   - Shows banner when update is ready
   - Handles user interaction (Update Now / Later)

### Modified Files:
1. **`src/components/AppContainerClean.js`**
   - Added `<UpdateNotification />` component
   - Renders on all screens except Login

2. **Translation files** (all languages):
   - `src/translations/en.json`
   - `src/translations/de.json`
   - `src/translations/mk.json`
   - `src/translations/sq.json`
   - `src/translations/sr.json`
   
   Added keys:
   - `update.available.title`
   - `update.available.message`
   - `update.now`
   - `update.later`

## Configuration

### Current app.json Settings:
```json
{
  "updates": {
    "enabled": true,
    "url": "https://u.expo.dev/2020fb3f-8a83-4c22-8e09-c583d37142dd",
    "fallbackToCacheTimeout": 0,
    "checkAutomatically": "ON_LOAD"
  }
}
```

### What These Mean:
- **enabled**: Updates are active
- **checkAutomatically: "ON_LOAD"**: App checks for updates every launch
- **fallbackToCacheTimeout: 0**: App launches immediately with cached version while checking

## Usage

### Publishing Updates:

#### For Testing (Preview):
```bash
eas update --branch preview --message "Testing new features"
```

#### For Production:
```bash
eas update --branch production --message "Bug fixes and improvements"
```

### What Gets Updated via OTA:
✅ JavaScript code
✅ React components
✅ Business logic
✅ Styles
✅ Assets (images, fonts)
✅ Bug fixes
✅ UI changes

### What Requires New Build:
❌ Native code changes
❌ New native dependencies
❌ Changes to app.json (permissions, version)
❌ Expo SDK upgrades
❌ New plugins

## Testing the Feature

### Test in Development:
The update notification **will NOT show in development mode** (`__DEV__` check). You need to test with a production or preview build.

### Testing Steps:

1. **Build a preview version:**
   ```bash
   eas build --profile preview --platform android
   ```

2. **Install the preview build on your device**

3. **Make a code change** (e.g., change a text label)

4. **Publish an update:**
   ```bash
   eas update --branch preview --message "Testing update notification"
   ```

5. **Close and reopen the app**
   - The update downloads in the background
   - Banner notification should appear at the top

6. **Tap "Update Now"**
   - App restarts with the new version

## Customization Options

### Change Update Check Timing:
You can modify when updates are checked by changing the `useEffect` dependency in `UpdateNotification.js`:

```javascript
// Check only on mount (default)
useEffect(() => {
    checkForUpdates();
}, []);

// Check on app state change (foreground/background)
useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
            checkForUpdates();
        }
    });
    return () => subscription?.remove();
}, []);
```

### Change Banner Position:
Modify the `styles.banner` in `UpdateNotification.js`:

```javascript
banner: {
    position: 'absolute',
    top: 0,        // Change to 'bottom: 0' for bottom banner
    left: 0,
    right: 0,
    // ... rest of styles
}
```

### Auto-Update Without User Interaction:
If you want to apply updates automatically without asking the user:

```javascript
const checkForUpdates = async () => {
    try {
        if (!__DEV__) {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                // Auto-reload without showing banner
                await Updates.reloadAsync();
            }
        }
    } catch (error) {
        console.log('Error checking for updates:', error);
    }
};
```

⚠️ **Warning**: Auto-updates can interrupt the user experience. The current implementation (with user confirmation) is better UX.

## Troubleshooting

### Banner Not Appearing:
1. **Check if you're in development mode**: Updates don't work in dev mode
2. **Verify runtime version matches**: The update must match the build's runtime version
3. **Check console logs**: Look for "Update available" or error messages
4. **Ensure update was published**: Run `eas update:list` to see if update exists

### Update Not Applying:
1. **Check runtime version compatibility**:
   ```bash
   # Check your app.json for runtime version
   # iOS: uses "appVersion" policy (version 1.4.3)
   # Android: uses fixed "1.0.0"
   ```
2. **Verify update was published to correct branch**:
   ```bash
   eas update:list --branch production
   ```

### Runtime Version Mismatch:
If iOS and Android have different runtime versions (like in your current setup):
- iOS preview: `1.4.2`
- Android preview: `1.0.0`

Consider unifying them in `app.json`:
```json
{
  "runtimeVersion": {
    "policy": "sdkVersion"  // Uses Expo SDK version for both
  }
}
```

## Best Practices

1. **Test updates on preview builds first** before publishing to production
2. **Use descriptive commit messages** when publishing updates
3. **Don't force updates** - always give users the option to "Later"
4. **Monitor update adoption** using Expo dashboard
5. **Keep runtime versions consistent** between platforms when possible
6. **Communicate changes** in update messages

## Advanced: Push Notification Integration

If you want to notify users via push notification (even when app is closed), you would need to:

1. **Backend Integration**: Your backend needs to track app versions per user
2. **FCM/APNS Setup**: Send push notifications when new update is published
3. **Deep Linking**: Handle notification tap to trigger update check

This is more complex and requires server-side implementation. The current in-app banner approach is simpler and works well for most use cases.

## Support

For issues or questions:
- Check Expo Updates documentation: https://docs.expo.dev/versions/latest/sdk/updates/
- Review EAS Update documentation: https://docs.expo.dev/eas-update/introduction/

