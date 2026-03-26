import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, AppState, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationService } from '../navigator';
import { useSelector, useDispatch } from 'react-redux';
import { setUnreadCount } from '../redux/actions/Chat/Chat.actions';
import { UnreadMessageService } from '../services/Chat/unreadMessageService';
import { store } from '../redux/store/store';

// Global variable to track if loading has been shown
let globalHasShownLoading = false;

const ChatIcon = ({ style, size = 24, color = '#f02e3a', location }) => {

  const dispatch = useDispatch();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isWaitingForState, setIsWaitingForState] = useState(false);

  
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
  
  
  // Force loading state on every render using useEffect
  useEffect(() => {

    setIsWaitingForState(true);
    
    // Set timer to turn off loading after 2 seconds
    const timer = setTimeout(() => {
      setIsWaitingForState(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array to run only once

  // Force calculation on mount - separate from the main useEffect
  useEffect(() => {
    if (userId && rootId) {
      // Add a small delay to ensure loading state is visible
      setTimeout(() => {
        // Trigger calculation after delay
        const calculateUnreadCounts = async (userIdParam, companyId) => {
        if (!userIdParam || !companyId || isCalculating) {
          console.log('ChatIcon - Skipping calculation - missing data or already calculating');
          return;
        }

        try {
          setIsCalculating(true);
         
          
          const { HybridChatService } = require('../services/Chat/hybridChatService');
          const chatResponse = await HybridChatService.getChatList(companyId, userIdParam);
          const chats = chatResponse?.chats || [];
          
         
          
          if (chats && chats.length > 0) {
          
            const chatsWithUnreadCounts = await UnreadMessageService.getUnreadCountsForAllChats(
              companyId,
              userIdParam,
              chats
            );

            

            let totalUnreadCount = 0;
            chatsWithUnreadCounts.forEach((chat) => {
              if (chat.unreadCount && chat.unreadCount > 0) {
                totalUnreadCount += chat.unreadCount;
                
              }
            });


            dispatch(setUnreadCount(totalUnreadCount));
           
          } else {
           
            dispatch(setUnreadCount(0));
          }
        } catch (error) {
          console.error('ChatIcon - Error calculating unread counts:', error);
          dispatch(setUnreadCount(0));
        } finally {
          
          setIsCalculating(false);
          // Don't set isWaitingForState to false here - let the timer handle it
        }
      };

        calculateUnreadCounts(userId, rootId);
      }, 500); // 500ms delay to ensure loading state is visible
    } else {

      // Try direct store access
      try {
        const state = store.getState();
        const directUserId = state.userData?.data?.id || state.userDataRole?.userId;
        const directCompanyId = state.idRootProject?.id || state.getProjectData?.id || state.project?.id || state.userDataRole?.rootId;
        
        if (directUserId && directCompanyId) {

          calculateUnreadCounts(directUserId, directCompanyId);
        } else {
         
          setIsWaitingForState(false);
        }
      } catch (error) {
       
        setIsWaitingForState(false);
      }
    }
  }, []); // Run only on mount

  
  
  // Hide chat icon if already in chat-related screens
  const shouldHide = location && (
    location === 'ChatRoomList' || 
    location === 'ChatMessages' || 
    location === 'Chat'
  );

  // Calculate unread counts when component mounts or when user data changes
  useEffect(() => {
    const calculateUnreadCounts = async (userIdParam, companyId) => {
      if (!userIdParam || !companyId || isCalculating) {
        return;
      }

      // Validate inputs before proceeding
      if (typeof companyId !== 'string' || companyId === '{}' || companyId === 'undefined') {
        setIsWaitingForState(false);
        return;
      }
      
      if (typeof userIdParam !== 'string') {
        setIsWaitingForState(false);
        return;
      }

      try {
        setIsCalculating(true);
                 // Get chat list first
         const { HybridChatService } = require('../services/Chat/hybridChatService');
         const chatResponse = await HybridChatService.getChatList(companyId, userIdParam);
         const chats = chatResponse?.chats || [];
        
        if (chats && chats.length > 0) {
          // Calculate unread counts for all chats
          const chatsWithUnreadCounts = await UnreadMessageService.getUnreadCountsForAllChats(
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

          dispatch(setUnreadCount(totalUnreadCount));
        } else {
          dispatch(setUnreadCount(0));
        }
      } catch (error) {
       
        dispatch(setUnreadCount(0));
      } finally {
        setIsCalculating(false);
        // Don't set isWaitingForState to false here - let the timer handle it
      }
    };

    // Try to get data from Redux store directly
    const getDataFromStore = () => {
      const state = store.getState();
      const userId = state.userData?.data?.id || state.userData?.id || state.userDataRole?.userId;
      
      // Try multiple possible paths for company ID
      let companyId = state.idRootProject?.id || 
                     state.getProjectData?.id ||
                     state.project?.id;
      
      // Use rootId as companyId if not available
      if (!companyId || companyId === '{}' || companyId === 'undefined') {
        companyId = rootId;
      }
      
      // Validate companyId before using it
      if (companyId && (typeof companyId !== 'string' || companyId === '{}' || companyId === 'undefined')) {
        return false;
      }
      
      if (userId && companyId) {
        calculateUnreadCounts(userId, companyId);
        return true;
      }
      return false;
    };

    // Try immediately with both Redux state and direct store access
    if (userData?.id && rootId) {
      calculateUnreadCounts(userData.id, rootId);
         } else {
       // Try direct store access as fallback
       getDataFromStore();
     }

  }, [userId, rootId, userData?.id]);

  // Listen for app state changes to recalculate when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && userId && rootId) {
        // Trigger recalculation when app comes to foreground
        const calculateUnreadCounts = async () => {
          if (isCalculating) return;
          
          try {
            setIsCalculating(true);
                         const { HybridChatService } = require('../services/Chat/hybridChatService');
             const chatResponse = await HybridChatService.getChatList(rootId, userId);
             const chats = chatResponse?.chats || [];
            
                         if (chats && chats.length > 0) {
               const chatsWithUnreadCounts = await UnreadMessageService.getUnreadCountsForAllChats(
                 rootId,
                 userId,
                 chats
               );

               let totalUnreadCount = 0;
               chatsWithUnreadCounts.forEach((chat) => {
                 if (chat.unreadCount && chat.unreadCount > 0) {
                   totalUnreadCount += chat.unreadCount;
                 }
               });

               dispatch(setUnreadCount(totalUnreadCount));
             } else {
               dispatch(setUnreadCount(0));
             }
          } catch (error) {
            console.error('🔍 ChatIcon: Error calculating on app foreground:', error);
          } finally {
            setIsCalculating(false);
            // Don't set isWaitingForState to false here - let the timer handle it
          }
        };
        
        calculateUnreadCounts();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [userData?.id, rootId, isCalculating]);

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

export default ChatIcon; 