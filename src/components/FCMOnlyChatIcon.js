/**
 * 🚀 FCM-Only ChatIcon - Zero Listeners!
 * 
 * This is the floating chat button that shows unread message counts.
 * Updated to use FCM-only architecture instead of direct Firestore calls.
 * 
 * Benefits:
 * - No direct Firestore listeners
 * - Uses FCM-triggered data fetching
 * - Intelligent caching prevents redundant calls
 * - Consistent with FCM-only architecture
 */

import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, AppState, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationService } from '../navigator';
import { useSelector, useDispatch } from 'react-redux';
import { setUnreadCount } from '../redux/actions/Chat/Chat.actions';
import { store } from '../redux/store/store';
import fcmOnlyService from '../services/Chat/fcmOnlyService';

// Global variable to track if loading has been shown
let globalHasShownLoading = false;

const FCMOnlyChatIcon = ({ style, size = 24, color = '#f02e3a', location }) => {
  const dispatch = useDispatch();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isWaitingForState, setIsWaitingForState] = useState(false);
  const isMountedRef = useRef(true);
  
  // Get user data and root ID from Redux
  const userData = useSelector((state) => state.userData?.data);
  const userDataRole = useSelector((state) => state.userDataRole);
  
  // Get userId from multiple sources
  const userId = userData?.id || userDataRole?.userId;
  
  // More robust rootId extraction with multiple fallbacks
  const rootId = useSelector((state) => {
    const idRootId = state.idRootProject?.id;
    const projectDataId = state.getProjectData?.id;
    const projectId = state.project?.id;
    const userDataRoleRootId = state.userDataRole?.rootId;
    
    return idRootId || projectDataId || projectId || userDataRoleRootId;
  });
  
  // Get unread count from Redux state
  const unreadCount = useSelector((state) => state.chat?.unreadCount || 0);
  const chatState = useSelector((state) => state.chat);

  /**
   * 🚀 FCM-based unread count calculation (NO LISTENERS!)
   */
  const calculateUnreadCountsFCM = async (userIdParam, companyId) => {
    if (!userIdParam || !companyId || isCalculating || !isMountedRef.current) {
      console.log('🚀 FCMOnlyChatIcon: Skipping calculation - missing data or already calculating');
      return;
    }

    // Validate inputs before proceeding
    if (typeof companyId !== 'string' || companyId === '{}' || companyId === 'undefined') {
      if (isMountedRef.current) {
        setIsWaitingForState(false);
      }
      return;
    }
    
    if (typeof userIdParam !== 'string') {
      if (isMountedRef.current) {
        setIsWaitingForState(false);
      }
      return;
    }

    try {
      if (isMountedRef.current) {
        setIsCalculating(true);
      }

      console.log('🚀 FCMOnlyChatIcon: Calculating unread counts using FCM service');

      // 🚀 Use FCM-only service to fetch chat list (NO LISTENERS!)
      const chats = await fcmOnlyService.fetchChatList(
        companyId,
        userIdParam,
        userData?.email || ''
      );

      if (!isMountedRef.current) return;

      if (chats && chats.length > 0) {
        // 🚀 Use FCM-only service to fetch unread counts (NO LISTENERS!)
        const chatsWithUnreadCounts = await fcmOnlyService.fetchAllUnreadCounts(
          companyId,
          userIdParam,
          chats
        );

        let totalUnreadCount = 0;

        // Calculate total unread count
        chatsWithUnreadCounts.forEach((chat) => {
          if (chat.unreadCount && chat.unreadCount > 0) {
            totalUnreadCount += chat.unreadCount;
          }
        });

        console.log(`🚀 FCMOnlyChatIcon: Total unread count: ${totalUnreadCount}`);
        dispatch(setUnreadCount(totalUnreadCount));
      } else {
        console.log('🚀 FCMOnlyChatIcon: No chats found, setting unread count to 0');
        dispatch(setUnreadCount(0));
      }
    } catch (error) {
      console.error('🚀 FCMOnlyChatIcon: Error calculating unread counts:', error);
      if (isMountedRef.current) {
        dispatch(setUnreadCount(0));
      }
    } finally {
      if (isMountedRef.current) {
        setIsCalculating(false);
      }
    }
  };

  // Force loading state on every render using useEffect
  useEffect(() => {
    if (isMountedRef.current) {
      setIsWaitingForState(true);
      
      // Set timer to turn off loading after 2 seconds
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setIsWaitingForState(false);
        }
      }, 2000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, []); // Empty dependency array to run only once

  // 🚀 FCM-based calculation on mount
  useEffect(() => {
    if (userId && rootId) {
      // Add a small delay to ensure loading state is visible
      setTimeout(() => {
        calculateUnreadCountsFCM(userId, rootId);
      }, 500); // 500ms delay to ensure loading state is visible
    } else {
      // Try direct store access as fallback
      try {
        const state = store.getState();
        const directUserId = state.userData?.data?.id || state.userDataRole?.userId;
        const directCompanyId = state.idRootProject?.id || state.getProjectData?.id || state.project?.id || state.userDataRole?.rootId;
        
        if (directUserId && directCompanyId) {
          calculateUnreadCountsFCM(directUserId, directCompanyId);
        } else {
          if (isMountedRef.current) {
            setIsWaitingForState(false);
          }
        }
      } catch (error) {
        if (isMountedRef.current) {
          setIsWaitingForState(false);
        }
      }
    }
  }, []); // Run only on mount

  // 🚀 FCM-based calculation when user data changes
  useEffect(() => {
    if (userId && rootId && isMountedRef.current) {
      calculateUnreadCountsFCM(userId, rootId);
    }
  }, [userId, rootId, userData?.id]);

  // 🚀 Handle FCM refresh for unread counts
  useEffect(() => {
    const handleFCMUnreadCountRefresh = (data) => {
      console.log('📨 FCMOnlyChatIcon: Received FCM unread count refresh');
      if (userId && rootId && isMountedRef.current) {
        calculateUnreadCountsFCM(userId, rootId);
      }
    };

    const handleFCMNewMessage = (data) => {
      console.log('📨 FCMOnlyChatIcon: Received FCM new message');
      if (userId && rootId && isMountedRef.current) {
        calculateUnreadCountsFCM(userId, rootId);
      }
    };

    const handleFCMChatListUpdate = (data) => {
      console.log('📨 FCMOnlyChatIcon: Received FCM chat list update');
      if (userId && rootId && isMountedRef.current) {
        calculateUnreadCountsFCM(userId, rootId);
      }
    };

    // Register for FCM refresh callbacks
    fcmOnlyService.registerUnreadCountRefreshCallback('global', handleFCMUnreadCountRefresh);
    fcmOnlyService.registerMessageRefreshCallback('global', handleFCMNewMessage);
    fcmOnlyService.registerChatListRefreshCallback(handleFCMChatListUpdate);

    return () => {
      // Cleanup is handled automatically by the service
    };
  }, [userId, rootId]);

  // Listen for app state changes to recalculate when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && userId && rootId && isMountedRef.current) {
        console.log('🚀 FCMOnlyChatIcon: App became active, recalculating unread counts');
        calculateUnreadCountsFCM(userId, rootId);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [userId, rootId, isCalculating]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Hide chat icon if already in chat-related screens
  const shouldHide = location && (
    location === 'ChatRoomList' || 
    location === 'ChatMessages' || 
    location === 'Chat' ||
    location === 'FCMOnlyChatRoomList'
  );

  if (shouldHide) {
    return null;
  }

  const handlePress = () => {
    NavigationService.navigate('ChatRoomList');
  };

  return (
    <TouchableOpacity
      style={[styles.chatIcon, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="chatbubble-ellipses" size={size} color={color} />
      {(() => {
        const shouldShow = (unreadCount > 0 || isWaitingForState);
  
        return shouldShow && (
          <View style={styles.badge}>
            {isWaitingForState ? (
              <View style={styles.loadingDot} />
            ) : (
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            )}
          </View>
        );
      })()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
});

export default FCMOnlyChatIcon;
