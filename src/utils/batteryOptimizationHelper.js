import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

/**
 * Battery Optimization Helper for Android
 * 
 * Provides utilities to check and request battery optimization exemption
 * Critical for background heartbeat survival when screen is locked
 */

/**
 * Show user-friendly dialog explaining why battery optimization exemption is needed
 * Then opens Android settings
 */
export const promptBatteryOptimization = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  Alert.alert(
    '🔋 Battery Optimization Required',
    'To ensure time tracking works when your screen is locked, Texxano needs to be exempt from battery optimization.\n\n' +
    'This is critical for:\n' +
    '• Continuous heartbeat monitoring\n' +
    '• Preventing automatic time stop\n' +
    '• Background GPS tracking\n\n' +
    'Tap "Open Settings" and select "Don\'t optimize" or "Allow" for Texxano.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: async () => {
          try {
            // Try direct app-specific settings first
            await IntentLauncher.startActivityAsync(
              'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
              { data: 'package:texxano.v1.android' }
            );
            console.log('✅ Opened battery optimization settings');
          } catch (error) {
            console.log('⚠️ Direct settings failed, opening general settings:', error.message);
            // Fallback to general battery optimization settings
            try {
              await IntentLauncher.startActivityAsync(
                'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'
              );
            } catch (fallbackError) {
              console.error('❌ Failed to open battery settings:', fallbackError);
              Alert.alert(
                'Unable to Open Settings',
                'Please manually go to:\nSettings → Apps → Texxano → Battery → Unrestricted'
              );
            }
          }
        },
      },
    ]
  );
};

/**
 * Show troubleshooting guide for when heartbeats stop on screen lock
 */
export const showHeartbeatTroubleshootingGuide = () => {
  Alert.alert(
    '📱 Heartbeat Stopped on Screen Lock?',
    'If time tracking stops when screen locks, try these steps:\n\n' +
    '1️⃣ Battery Optimization (CRITICAL!)\n' +
    '   Settings → Apps → Texxano → Battery → Unrestricted\n' +
    '   This is the #1 reason for heartbeat failures!\n\n' +
    '2️⃣ Background Location Permission\n' +
    '   Settings → Apps → Texxano → Permissions → Location\n' +
    '   → Allow all the time\n\n' +
    '3️⃣ Keep Notification Visible\n' +
    '   "⏱️ Texxano Time Tracking" notification must stay\n' +
    '   DO NOT DISMISS IT - it keeps the service alive\n\n' +
    '4️⃣ Foreground Service Active\n' +
    '   App now uses Android Foreground Service\n' +
    '   Check HeartbeatDebugger to verify it\'s running\n' +
    '   Look for "Foreground Service: ✅ Running"\n\n' +
    '5️⃣ Manufacturer Settings (varies by brand):\n' +
    '   • Samsung: Add to "Never sleeping apps"\n' +
    '   • Xiaomi: Enable "Autostart"\n' +
    '   • Huawei: Enable "Protected apps"\n' +
    '   • OnePlus: Lock in recents',
    [
      {
        text: 'Close',
        style: 'cancel',
      },
      {
        text: 'View Manufacturer Guide',
        onPress: () => {
          // Detect manufacturer and show specific guide
          const { getSystemName, getBrand } = require('expo-device');
          getBrand().then(brand => {
            if (brand) {
              showManufacturerSpecificGuide(brand);
            }
          });
        },
      },
      {
        text: 'Open Battery Settings',
        onPress: promptBatteryOptimization,
      },
    ]
  );
};

/**
 * Show manufacturer-specific battery optimization instructions
 * @param {string} manufacturer - Device manufacturer (Samsung, Xiaomi, Huawei, OnePlus, etc.)
 */
export const showManufacturerSpecificGuide = (manufacturer) => {
  const guides = {
    samsung: {
      title: 'Samsung Battery Settings',
      message:
        '1. Settings → Battery and device care → Battery\n' +
        '2. Tap "Background usage limits"\n' +
        '3. Tap "Never sleeping apps"\n' +
        '4. Add Texxano\n\n' +
        'Also disable:\n' +
        '• "Put apps to sleep"\n' +
        '• "Auto-disable unused apps"',
    },
    xiaomi: {
      title: 'Xiaomi/MIUI Battery Settings',
      message:
        '1. Security → Permissions → Autostart\n' +
        '   Enable for Texxano\n\n' +
        '2. Settings → Battery & performance\n' +
        '   → Manage apps battery usage\n' +
        '   → Texxano → No restrictions\n\n' +
        '3. Recent apps → Lock Texxano\n' +
        '   (Prevents removal from memory)',
    },
    huawei: {
      title: 'Huawei Battery Settings',
      message:
        '1. Settings → Apps → Apps\n' +
        '   → Texxano → Battery\n' +
        '   → App launch\n' +
        '   Enable: Manual management\n\n' +
        '2. Enable all three:\n' +
        '   • Auto-launch\n' +
        '   • Secondary launch\n' +
        '   • Run in background\n\n' +
        '3. Settings → Battery → Launch\n' +
        '   Add to "Protected apps"',
    },
    oneplus: {
      title: 'OnePlus Battery Settings',
      message:
        '1. Settings → Battery → Battery optimization\n' +
        '   → All apps → Texxano\n' +
        '   → Don\'t optimize\n\n' +
        '2. Recent apps menu\n' +
        '   → Tap lock icon on Texxano\n' +
        '   (Prevents clearing from memory)\n\n' +
        '3. Settings → Apps → Texxano\n' +
        '   → Battery → Intelligent control\n' +
        '   → OFF',
    },
  };

  const normalizedManufacturer = manufacturer.toLowerCase();
  const guide = guides[normalizedManufacturer];

  if (guide) {
    Alert.alert(guide.title, guide.message, [{ text: 'OK' }]);
  } else {
    // Generic guide
    Alert.alert(
      'Battery Optimization Settings',
      'Your device manufacturer may have additional battery optimization settings.\n\n' +
        'Common locations:\n' +
        '• Settings → Battery → Battery optimization\n' +
        '• Settings → Apps → Special access\n' +
        '• Settings → App launch/management\n\n' +
        'Set Texxano to:\n' +
        '• "Unrestricted" or "No restrictions"\n' +
        '• Enable "Auto-launch"\n' +
        '• Add to "Protected apps"\n' +
        '• Lock in recent apps',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Quick action to open app-specific battery settings
 */
export const openAppBatterySettings = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await IntentLauncher.startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
      data: 'package:texxano.v1.android',
    });
  } catch (error) {
    console.error('Failed to open app settings:', error);
    Alert.alert('Error', 'Unable to open settings. Please navigate manually to Settings → Apps → Texxano');
  }
};
