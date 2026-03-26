import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../utils/firebase';


export class UnreadMessageService {
  /**
   * Calculate unread count for a specific chat
   * @param {string} rootId - Company root ID
   * @param {string} chatId - Chat ID
   * @param {string} userId - Current user ID
   * @returns {Promise<number>} - Number of unread messages
   */
  static async getUnreadCountForChat(rootId, chatId, userId) {
    try {
      // Get user's last read timestamp for this chat
      const lastReadRef = doc(db, "companies", rootId, "users", userId, "chatReadTimes", chatId);

      const lastReadSnap = await getDoc(lastReadRef);
      
      let lastReadTimestamp = null;
      if (lastReadSnap.exists()) {
        lastReadTimestamp = lastReadSnap.data().lastReadTime;
      }
      
      // If no read timestamp, limit to recent messages (avoid reading ALL messages)
      if (!lastReadTimestamp) {
        const messagesRef = collection(db, "companies", rootId, "chats", chatId, "messages");
        const recentQuery = query(
          messagesRef,
          orderBy("createdAt", "desc"),
          limit(30) // Only get last 30 messages instead of ALL
        );
      
        const messagesSnap = await getDocs(recentQuery);
        
        // Don't count user's own messages
        let unreadCount = 0;
        messagesSnap.forEach(doc => {
          const message = doc.data();
          if (message.senderId !== userId) {
            unreadCount++;
          }
        });
        
        return unreadCount;
      }
      
      // Count messages after last read timestamp (excluding user's own messages)
      // Use WHERE clause for efficiency (like your web version)
      const messagesRef = collection(db, "companies", rootId, "chats", chatId, "messages");
      const unreadQuery = query(
        messagesRef,
        where("createdAt", ">", lastReadTimestamp),
        orderBy("createdAt", "asc")
      );
      
      const unreadSnap = await getDocs(unreadQuery);
      
      // Filter out user's own messages in JavaScript (to avoid compound index requirement)
      let unreadCount = 0;
      unreadSnap.forEach(doc => {
        const message = doc.data();
        if (message.senderId !== userId) {
          unreadCount++;
        }
      });
      
      return unreadCount;
      
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate unread counts for all chats
   * @param {string} rootId - Company root ID
   * @param {string} userId - Current user ID
   * @param {Array} chats - Array of chat objects
   * @returns {Promise<Array>} - Array of chats with unreadCount property
   */
  static async getUnreadCountsForAllChats(rootId, userId, chats) {
    try {
      const chatsWithUnreadCounts = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = await this.getUnreadCountForChat(rootId, chat.id, userId);
          return {
            ...chat,
            unreadCount
          };
        })
      );

      return chatsWithUnreadCounts;
    } catch (error) {

      return chats.map(chat => ({ ...chat, unreadCount: 0 }));
    }
  }

  /**
   * Mark a chat as read (update last read timestamp)
   * @param {string} rootId - Company root ID
   * @param {string} chatId - Chat ID
   * @param {string} userId - Current user ID
   */
  static async markChatAsRead(rootId, chatId, userId) {
    try {

      
      const lastReadRef = doc(db, "companies", rootId, "users", userId, "chatReadTimes", chatId);
      const currentTime = serverTimestamp();
      
      await setDoc(lastReadRef, {
        lastReadTime: currentTime,
        updatedAt: currentTime
      }, { merge: true });


      
      // Verify the update worked by reading it back
      const verifySnap = await getDoc(lastReadRef);
      if (verifySnap.exists()) {
        const verifyTime = verifySnap.data().lastReadTime?.toDate?.() || new Date(verifySnap.data().lastReadTime);

      }
    } catch (error) {
      // Error marking chat as read
    }
  }

  /**
   * Mark all chats as read
   * @param {string} rootId - Company root ID
   * @param {string} userId - Current user ID
   * @param {Array} chatIds - Array of chat IDs
   */
  static async markAllChatsAsRead(rootId, userId, chatIds) {
    try {
      const promises = chatIds.map(chatId => 
        this.markChatAsRead(rootId, chatId, userId)
      );
      
      await Promise.all(promises);

    } catch (error) {
      // Error marking all chats as read  
    }
  }

  /**
   * Get user's last read time for a specific chat
   * @param {string} rootId - Company root ID
   * @param {string} chatId - Chat ID
   * @param {string} userId - Current user ID
   * @returns {Promise<Date|null>} - Last read time or null
   */
  static async getLastReadTime(rootId, chatId, userId) {
    try {
      const lastReadRef = doc(db, "companies", rootId, "users", userId, "chatReadTimes", chatId);
      const lastReadSnap = await getDoc(lastReadRef);
      
      if (lastReadSnap.exists()) {
        const data = lastReadSnap.data();
        return data.lastReadTime?.toDate?.() || new Date(data.lastReadTime);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}
