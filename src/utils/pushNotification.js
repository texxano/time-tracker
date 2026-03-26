
import { store } from '../redux/store/store';
import { NavigationService } from '../navigator';
import { chatService } from '../services/Chat/Chat.services';

// Expo Push Notification API endpoint
// const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

// export const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
//   try {
//     const message = {
//       to: expoPushToken,
//       sound: 'default',
//       title: title,
//       body: body,
//       data: data,
//     };

//     const response = await fetch(EXPO_PUSH_API, {
//       method: 'POST',
//       headers: {
//         'Accept': 'application/json',
//         'Accept-encoding': 'gzip, deflate',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(message),
//     });

//     const result = await response.json();

//     return result;
//   } catch (error) {
//     throw error;
//   }
// };

export const sendChatNotification = async (recipientId, senderName, messageText, groupName = null, chatType, chatId = null) => {
  try {
    // Get current user info from Redux state
    const state = store.getState();
    const currentUserId = state.userDataRole?.userId || state.userData?.id;
    const currentUserName = state.userDataRole?.userName || state.userData?.name || senderName;
    
    // Validate required data
    if (!currentUserId) {

      return { success: false, reason: 'No current user ID' };
    }

    // Don't send notification to yourself
    if (recipientId === currentUserId) {
      return { success: true, reason: 'Skipped - self notification' };
    }

    // Create human-friendly message
    let messageHumanFriendly;
    if (groupName) {
      messageHumanFriendly = `${senderName} sent a message in ${groupName}: ${messageText}`;
    } else {
      messageHumanFriendly = `${senderName}: ${messageText}`;
    }

    // Call your .NET backend API to send push notification
    const notificationBody = {
      userIds: [recipientId],
      messageHumanFriendly: messageHumanFriendly,
      sound: 'default',
      channelId: 'chat-messages', // Android notification channel
      data: {
        type: 'chat_message',
        chatId: chatId || recipientId, // Use actual chatId if provided, fallback to recipientId
        senderId: currentUserId,
        messageText: messageText,
        chatType: chatType,
        // Add deep link for instant navigation
          deep_link: `texxano://ChatMessages/${chatId || recipientId}`,
        fallback_url: `https://texxano.com/ChatMessages/${chatId || recipientId}`,
      }
    };
    const response = await chatService.sendNotification(notificationBody);
    
    return { 
      success: true, 
      reason: 'Push notification sent via .NET backend',
      response: response
    };
    
  } catch (error) {
    return { success: false, reason: 'Failed to send notification', error: error.message };
  }
};

// New function to handle chat notification responses
export const handleChatNotificationResponse = (response) => {
  try {
    const { data } = response.notification.request.content;
    
    // Check if this is a chat notification
    if (data && data.type === 'chat_message') {
      const { chatId, senderId, messageId } = data;
      
      // Navigate to the specific chat conversation
      if (chatId) {
        NavigationService.navigate('SingleChat', {
          chatId: chatId,
          senderId: senderId,
          messageId: messageId, // Optional: scroll to specific message
        });
      }
    }
  } catch (error) {
    // Error handling chat notification response
  }
};

 