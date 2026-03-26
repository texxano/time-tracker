import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Tracking Notification Service (NO NEW LIBRARIES)
 * 
 * Uses expo-notifications to create a persistent, updatable tracking notification
 * Works alongside expo-location's foreground service
 * 
 * Android: Creates ongoing notification that can't be dismissed
 * iOS: Shows regular notification (iOS doesn't support persistent notifications)
 */

const TRACKING_NOTIFICATION_ID = 'time-tracking-active';
const TRACKING_CHANNEL_ID = 'time-tracking-channel';
const ACTIVE_TRACK_KEY = '@texxano_active_track';

// Configure notification handler to NOT show alerts for our tracking notification
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Don't show alert for tracking notification updates
    if (notification.request.identifier === TRACKING_NOTIFICATION_ID) {
      return {
        shouldShowAlert: false, // Don't popup
        shouldPlaySound: false, // Silent
        shouldSetBadge: false,
      };
    }
    
    // Other notifications show normally
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

/**
 * Initialize notification channel (Android only)
 * Call this once during app startup
 */
export async function initializeTrackingChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(TRACKING_CHANNEL_ID, {
      name: 'Time Tracking',
      description: 'Shows your active time tracking session',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null, // No sound
      vibrationPattern: null, // No vibration
      enableVibrate: false,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    
    console.log('✅ Tracking notification channel initialized');
  }
}

/**
 * Show persistent tracking notification
 * @param {string} trackId - Active track ID
 * @param {Date} startTime - When tracking started
 */
export async function showTrackingNotification(trackId, startTime) {
  try {
    const duration = formatDuration(getDuration(startTime));
    
    await Notifications.scheduleNotificationAsync({
      identifier: TRACKING_NOTIFICATION_ID,
      content: {
        title: '⏱️ Time Tracking Active',
        body: `Duration: ${duration} • Tap to open`,
        data: { 
          type: 'tracking_active',
          trackId,
          startTime: startTime.toISOString(),
        },
        sticky: true,
        autoDismiss: false,
        ...(Platform.OS === 'android' && {
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          color: '#4A90E2',
        }),
      },
      trigger: null, // Show immediately
    });
    
    // Store active track info
    await AsyncStorage.setItem(ACTIVE_TRACK_KEY, JSON.stringify({
      trackId,
      startTime: startTime.toISOString(),
    }));
    
    console.log('✅ Tracking notification shown');
  } catch (error) {
    console.error('❌ Failed to show tracking notification:', error);
  }
}

/**
 * Update tracking notification with current duration
 * Call this every minute to show elapsed time
 * @param {Date} startTime - When tracking started
 */
export async function updateTrackingNotification(startTime) {
  try {
    const duration = formatDuration(getDuration(startTime));
    
    await Notifications.scheduleNotificationAsync({
      identifier: TRACKING_NOTIFICATION_ID, // Same ID = updates existing
      content: {
        title: '⏱️ Time Tracking Active',
        body: `Duration: ${duration} • Tap to open`,
        data: { 
          type: 'tracking_active',
          startTime: startTime.toISOString(),
        },
        sticky: true,
        autoDismiss: false,
        ...(Platform.OS === 'android' && {
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          color: '#4A90E2',
        }),
      },
      trigger: null,
    });
  } catch (error) {
    console.error('❌ Failed to update tracking notification:', error);
  }
}

/**
 * Dismiss tracking notification
 * Call when user stops tracking
 */
export async function dismissTrackingNotification() {
  try {
    await Notifications.dismissNotificationAsync(TRACKING_NOTIFICATION_ID);
    await AsyncStorage.removeItem(ACTIVE_TRACK_KEY);
    console.log('✅ Tracking notification dismissed');
  } catch (error) {
    console.error('❌ Failed to dismiss tracking notification:', error);
  }
}

/**
 * Check if there's an active track (app restart recovery)
 * @returns {Promise<{trackId: string, startTime: Date} | null>}
 */
export async function getActiveTrack() {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_TRACK_KEY);
    if (!data) return null;
    
    const { trackId, startTime } = JSON.parse(data);
    return {
      trackId,
      startTime: new Date(startTime),
    };
  } catch (error) {
    console.error('❌ Failed to get active track:', error);
    return null;
  }
}

/**
 * Start periodic notification updates (every minute)
 * @param {Date} startTime - When tracking started
 * @returns {NodeJS.Timeout} Interval ID (clear with clearInterval)
 */
export function startNotificationUpdates(startTime) {
  // Update immediately
  updateTrackingNotification(startTime);
  
  // Then every minute
  const intervalId = setInterval(() => {
    updateTrackingNotification(startTime);
  }, 60000); // 1 minute
  
  console.log('✅ Notification updates started (every 1 minute)');
  return intervalId;
}

/**
 * Calculate duration in seconds
 */
function getDuration(startTime) {
  return Math.floor((Date.now() - startTime.getTime()) / 1000);
}

/**
 * Format duration as HH:MM:SS
 */
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
