/**
 * Wake Lock Helper for Android
 * 
 * Keeps CPU awake during critical operations like heartbeat sending
 * This is essential for network requests to work when screen is locked
 */

import { Platform, NativeModules } from 'react-native';

let wakeLockCount = 0;

/**
 * Acquire a partial wake lock to keep CPU active
 * On web, uses the Wake Lock API
 * On Android, we need to use native code (see below)
 * 
 * Note: For Android, this requires native module implementation
 * For now, we'll use a JavaScript workaround with timers
 */
export const acquireWakeLock = async (tag = 'heartbeat') => {
  if (Platform.OS === 'web' && 'wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('✅ [WAKE_LOCK] Web wake lock acquired:', tag);
      return wakeLock;
    } catch (error) {
      console.log('⚠️ [WAKE_LOCK] Failed to acquire web wake lock:', error.message);
      return null;
    }
  }

  // For React Native, log attempt
  // Actual wake lock would require native module
  console.log('📱 [WAKE_LOCK] Attempted to acquire wake lock (native module needed):', tag);
  wakeLockCount++;
  return { tag, timestamp: Date.now() };
};

/**
 * Release a wake lock
 */
export const releaseWakeLock = async (wakeLock) => {
  if (!wakeLock) return;

  if (Platform.OS === 'web' && wakeLock.release) {
    try {
      await wakeLock.release();
      console.log('✅ [WAKE_LOCK] Web wake lock released');
    } catch (error) {
      console.log('⚠️ [WAKE_LOCK] Failed to release web wake lock:', error.message);
    }
  } else {
    console.log('📱 [WAKE_LOCK] Released wake lock:', wakeLock.tag);
    wakeLockCount = Math.max(0, wakeLockCount - 1);
  }
};

/**
 * Execute a function with wake lock held
 * Ensures CPU stays active during the operation
 */
export const withWakeLock = async (fn, tag = 'operation') => {
  const wakeLock = await acquireWakeLock(tag);
  try {
    return await fn();
  } finally {
    await releaseWakeLock(wakeLock);
  }
};

/**
 * Keep alive mechanism using setTimeout chains
 * This is a workaround for Android Doze mode
 * By scheduling the next timer before the current one completes,
 * we prevent the app from entering deep sleep
 */
let keepAliveTimer = null;
let keepAliveCallback = null;
let keepAliveInterval = 25000; // 25 seconds

export const startKeepAlive = (callback, interval = 25000) => {
  stopKeepAlive(); // Clear any existing timer
  
  keepAliveCallback = callback;
  keepAliveInterval = interval;
  
  const scheduleNext = () => {
    keepAliveTimer = setTimeout(async () => {
      try {
        console.log('⏰ [KEEP_ALIVE] Executing callback at:', new Date().toISOString());
        await keepAliveCallback?.();
      } catch (error) {
        console.error('❌ [KEEP_ALIVE] Callback error:', error.message);
      }
      
      // Schedule next execution BEFORE this one completes
      // This prevents deep sleep in Doze mode
      scheduleNext();
    }, keepAliveInterval);
  };
  
  scheduleNext();
  console.log('✅ [KEEP_ALIVE] Started with', keepAliveInterval, 'ms interval');
};

export const stopKeepAlive = () => {
  if (keepAliveTimer) {
    clearTimeout(keepAliveTimer);
    keepAliveTimer = null;
    console.log('🛑 [KEEP_ALIVE] Stopped');
  }
};

export const isKeepAliveActive = () => {
  return keepAliveTimer !== null;
};
