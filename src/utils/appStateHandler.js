import { AppState } from 'react-native';
// NOTE: Firestore and store imports removed - user status is now managed by UserStatusManager
// Only listener cleanup is handled here for cost optimization

let appState = AppState.currentState;

// Global listener registry for cleanup
const listenerRegistry = new Set();

// NOTE: getCurrentUserId and getRootId removed - no longer needed
// User status is managed by UserStatusManager

export const initializeAppStateHandler = () => {
  const handleAppStateChange = async (nextAppState) => {
    // OPTIMIZATION: User status updates are now handled by UserStatusManager
    // This handler only manages listener cleanup for cost optimization
    
    if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App has gone to the background - cleanup all Firestore listeners
      cleanupAllListeners();
      
      // NOTE: User status is managed by UserStatusManager in navigationPrivate.js
      // No need to duplicate status updates here
    }
    appState = nextAppState;
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  // NOTE: Initial user status is handled by UserStatusManager
  // No duplicate initialization needed here

  return () => {
    subscription?.remove();
    // NOTE: User status cleanup is handled by UserStatusManager
  };
};

// REMOVED: updateUserStatus, setUserActive, setUserInactive
// These functions are now handled exclusively by UserStatusManager
// to prevent duplicate Firestore writes and race conditions

// Global listener management functions
export const registerListener = (listenerId, cleanupFunction) => {
  listenerRegistry.add({ id: listenerId, cleanup: cleanupFunction });
};

export const unregisterListener = (listenerId) => {
  for (const listener of listenerRegistry) {
    if (listener.id === listenerId) {
      listenerRegistry.delete(listener);
      break;
    }
  }
};

const cleanupAllListeners = () => {
  listenerRegistry.forEach(({ id, cleanup }) => {
    try {

      cleanup();
    } catch (error) {
      // Error cleaning up listener
    }
  });
  listenerRegistry.clear();
}; 