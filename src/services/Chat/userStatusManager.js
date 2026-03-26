import { AppState, Platform } from 'react-native';
import HybridChatService from './hybridChatService';

class UserStatusManager {
  constructor() {
    this.isActive = false;
    this.currentRoute = null;
    this.keepAliveInterval = null;
    this.appStateSubscription = null;
    this.userId = null;
    this.rootId = null;
    this.chatRoutes = ['ChatMessages', 'ChatRoomList', 'SingleChat', 'GroupChat'];
  }

  // Initialize the status manager
  initialize(userId, rootId) {
    this.userId = userId;
    this.rootId = rootId;
    this.setupAppStateListener();
  }

  // Set user as active when entering chat-related routes
  setUserActive(routeName) {
    if (!this.userId || !this.rootId) return;

    const isChatRoute = this.chatRoutes.some(route => 
      routeName.includes(route) || routeName === route
    );

    if (isChatRoute && !this.isActive) {
      this.isActive = true;
      this.currentRoute = routeName;
      this.updateStatusInDatabase(true);
      this.startKeepAlive();
    }
  }

  // Set user as inactive when leaving chat routes
  setUserInactive(routeName) {
    if (!this.userId || !this.rootId) return;

    const isChatRoute = this.chatRoutes.some(route => 
      routeName.includes(route) || routeName === route
    );

    if (!isChatRoute && this.isActive) {
      this.isActive = false;
      this.currentRoute = null;
      this.updateStatusInDatabase(false);
      this.stopKeepAlive();
    }
  }

  // Handle route changes
  handleRouteChange(routeName) {
    const isChatRoute = this.chatRoutes.some(route =>
      routeName.includes(route) || routeName === route
    );

    if (isChatRoute) {
      this.setUserActive(routeName);
    } else {
      this.setUserInactive(routeName);
    }
  }

  // Update status in Firestore
  async updateStatusInDatabase(isActive) {
    try {
      await HybridChatService.updateUserStatus(this.rootId, this.userId, isActive);
    } catch (error) {
      // Error updating user status
    }
  }

  // Start keep-alive mechanism
  startKeepAlive() {
    if (this.keepAliveInterval) return;

    this.keepAliveInterval = setInterval(async () => {
      const currentAppState = AppState.currentState;
      
      // More aggressive check - if app is not active, immediately set inactive
      if (currentAppState !== 'active') {
        this.stopKeepAlive();
        if (this.isActive) {
          this.isActive = false;
          this.currentRoute = null;
          this.updateStatusInDatabase(false);
        }
        return;
      }
      
      if (currentAppState === 'active' && this.isActive && this.currentRoute) {
        // Only keep alive if user is in a chat route
        const isChatRoute = this.chatRoutes.some(route => 
          this.currentRoute.includes(route) || this.currentRoute === route
        );
        
        if (isChatRoute) {
          try {
            await HybridChatService.updateUserStatus(this.rootId, this.userId, true);
          } catch (error) {
            // Error keeping user active
          }
        } else {
          // User is not in a chat route, stop keep-alive and set inactive
          this.stopKeepAlive();
          this.isActive = false;
          this.currentRoute = null;
          this.updateStatusInDatabase(false);
        }
      } else {
        this.stopKeepAlive();
        if (this.isActive) {
          this.isActive = false;
          this.currentRoute = null;
          this.updateStatusInDatabase(false);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  // Stop keep-alive mechanism
  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  // Setup AppState listener
  setupAppStateListener() {
    if (Platform.OS === 'ios') {
      this.setupIOSAppStateListener();
    } else {
      this.setupAndroidAppStateListener();
    }
  }

  // iOS-specific AppState listener with additional checks
  setupIOSAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (!this.userId || !this.rootId) return;

      if (nextAppState === 'active') {
        // App came to foreground - set user as active if in a chat route
        if (this.chatRoutes.some(route => this.currentRoute?.includes(route) || this.currentRoute === route)) {
          this.setUserActive(this.currentRoute);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background - set user as inactive
        if (this.isActive) {
          this.isActive = false;
          this.currentRoute = null;
          this.updateStatusInDatabase(false);
          this.stopKeepAlive();
        }
      }
    });

    // Additional iOS-specific background detection using visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.isActive) {
          this.isActive = false;
          this.currentRoute = null;
          this.updateStatusInDatabase(false);
          this.stopKeepAlive();
        }
      });
    }
  }

  // Android-specific AppState listener
  setupAndroidAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (!this.userId || !this.rootId) return;

      if (nextAppState === 'active') {
        // App came to foreground - set user as active if in a chat route
        if (this.chatRoutes.some(route => this.currentRoute?.includes(route) || this.currentRoute === route)) {
          this.setUserActive(this.currentRoute);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background - set user as inactive
        if (this.isActive) {
          this.isActive = false;
          this.currentRoute = null;
          this.updateStatusInDatabase(false);
          this.stopKeepAlive();
        }
      }
    });
  }

  // Cleanup method
  cleanup() {
    this.stopKeepAlive();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.isActive && this.userId && this.rootId) {
      this.updateStatusInDatabase(false);
    }
    this.isActive = false;
    this.currentRoute = null;
    this.userId = null;
    this.rootId = null;
  }

  // Get current status
  getStatus() {
    return {
      isActive: this.isActive,
      currentRoute: this.currentRoute,
      userId: this.userId,
      rootId: this.rootId
    };
  }
}

export default new UserStatusManager();