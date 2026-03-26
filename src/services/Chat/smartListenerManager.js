/**
 * 🚀 Smart Listener Manager - Cost Optimization
 * 
 * This service manages Firestore listeners intelligently to minimize costs:
 * - Only creates listeners when chat screens are actually open
 * - Automatically cleans up listeners when screens are closed
 * - Prevents duplicate listeners
 * - Tracks listener usage for cost analysis
 */

import { registerListener, unregisterListener } from '../../utils/appStateHandler';

class SmartListenerManager {
  constructor() {
    this.activeListeners = new Map(); // chatId -> { listeners: [], screenType: 'single'|'group' }
    this.listenerCount = 0;
    this.maxListeners = 10; // Safety limit
  }

  /**
   * Register listeners for a chat screen
   * @param {string} chatId - The chat ID
   * @param {string} screenType - 'single' or 'group'
   * @param {Array} unsubscribeFunctions - Array of unsubscribe functions
   */
  registerChatListeners(chatId, screenType, unsubscribeFunctions) {
    const listenerKey = `${screenType}_${chatId}`;
    
    // Check if already registered
    if (this.activeListeners.has(chatId)) {
      this.cleanupChatListeners(chatId);
    }

    // Register with global app state handler
    unsubscribeFunctions.forEach((unsub, index) => {
      const globalKey = `${listenerKey}_${index}`;
      registerListener(globalKey, unsub);
      this.listenerCount++;
    });

    // Store locally
    this.activeListeners.set(chatId, {
      listeners: unsubscribeFunctions,
      screenType,
      registeredAt: Date.now()
    });

    // Safety check
    if (this.listenerCount > this.maxListeners) {
      // High listener count warning
    }
  }

  /**
   * Cleanup listeners for a specific chat
   * @param {string} chatId - The chat ID
   */
  cleanupChatListeners(chatId) {
    const chatData = this.activeListeners.get(chatId);
    if (!chatData) return;

    const { listeners, screenType } = chatData;
    const listenerKey = `${screenType}_${chatId}`;

    // Unregister from global handler
    listeners.forEach((unsub, index) => {
      const globalKey = `${listenerKey}_${index}`;
      unregisterListener(globalKey);
      unsub(); // Call unsubscribe function
      this.listenerCount--;
    });

    // Remove from local tracking
    this.activeListeners.delete(chatId);

    // Cleaned up listeners
  }

  /**
   * Cleanup all listeners
   */
  cleanupAllListeners() {
    
    for (const [chatId, chatData] of this.activeListeners) {
      this.cleanupChatListeners(chatId);
    }
    
    this.activeListeners.clear();
    this.listenerCount = 0;
  }

  /**
   * Get current listener statistics
   */
  getStats() {
    const stats = {
      totalListeners: this.listenerCount,
      activeChats: this.activeListeners.size,
      chatBreakdown: {}
    };

    for (const [chatId, chatData] of this.activeListeners) {
      stats.chatBreakdown[chatId] = {
        screenType: chatData.screenType,
        listenerCount: chatData.listeners.length,
        activeTime: Date.now() - chatData.registeredAt
      };
    }

    return stats;
  }

  /**
   * Check if chat has active listeners
   * @param {string} chatId - The chat ID
   */
  hasActiveListeners(chatId) {
    return this.activeListeners.has(chatId);
  }

  /**
   * Get listener count for a specific chat
   * @param {string} chatId - The chat ID
   */
  getChatListenerCount(chatId) {
    const chatData = this.activeListeners.get(chatId);
    return chatData ? chatData.listeners.length : 0;
  }
}

// Export singleton instance
const smartListenerManager = new SmartListenerManager();
export default smartListenerManager;
