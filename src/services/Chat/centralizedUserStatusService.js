import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { store } from '../../redux/store/store';

class CentralizedUserStatusService {
  constructor() {
    this.userStatuses = new Map();
    this.listeners = new Map();
    this.subscribers = new Set();
    this.isListening = false;
    this.currentRootId = null;
    this.currentUserIds = new Set();
    this.notifyDebounceTimer = null;
  }

  // Subscribe to user status updates
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // If we're already listening, send current data immediately
    if (this.isListening && this.userStatuses.size > 0) {
      callback(this.getUserStatuses());
    }
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Get current user statuses
  getUserStatuses() {
    return Object.fromEntries(this.userStatuses);
  }

  // Get specific user status
  getUserStatus(userId) {
    return this.userStatuses.get(userId);
  }

  // Start listening to user statuses
  startListening(rootId, userIds) {
    if (!rootId || !userIds || userIds.length === 0) return;

    // Check if we're already listening to the same data
    const userIdsSet = new Set(userIds);
    const userIdsKey = Array.from(userIdsSet).sort().join(',');
    
    if (this.isListening && 
        this.currentRootId === rootId && 
        this.currentUserIds.size === userIdsSet.size &&
        Array.from(this.currentUserIds).every(id => userIdsSet.has(id))) {
      return;
    }

    
    // Clean up existing listeners
    this.stopListening();

    this.currentRootId = rootId;
    this.currentUserIds = userIdsSet;
    this.isListening = true;

    // Batch users in groups of 10 (Firestore 'in' limit)
    const userIdsArray = Array.from(userIdsSet);
    for (let i = 0; i < userIdsArray.length; i += 10) {
      const batch = userIdsArray.slice(i, i + 10);
      const usersQuery = query(
        collection(db, "companies", rootId, "users"),
        where("id", "in", batch)
      );

      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        let hasStatusChanges = false;
        
        snapshot.forEach((docSnap) => {
          const userData = docSnap.data();
          const userId = userData.id;
          const currentStatus = this.userStatuses.get(userId);
          
          // 🚀 OPTIMIZATION: Only track meaningful status changes
          if (!currentStatus) {
            // New user - this is a change
            hasStatusChanges = true;
          } else {
            // Check if status-related fields changed
            const isActiveChanged = currentStatus.isActive !== userData.isActive;
            const lastSeenChanged = 
              (currentStatus.lastSeen?.seconds || currentStatus.lastSeen) !== 
              (userData.lastSeen?.seconds || userData.lastSeen);
            
            if (isActiveChanged || lastSeenChanged) {
              hasStatusChanges = true;
            }
          }
          
          // Update our local cache
          this.userStatuses.set(userId, {
            ...userData,
            isActive: userData.isActive,
            lastSeen: userData.lastSeen,
            updatedAt: userData.updatedAt,
            firstName: userData.firstName || userData.first_name,
            lastName: userData.lastName || userData.last_name,
            email: userData.email,
            avatar: userData.avatar
          });
        });

        // 🚀 OPTIMIZATION: Only notify if status actually changed
        if (hasStatusChanges) {
          // Debounce notifications to prevent rapid-fire updates
          if (this.notifyDebounceTimer) {
            clearTimeout(this.notifyDebounceTimer);
          }
          
          this.notifyDebounceTimer = setTimeout(() => {
            this.notifySubscribers();
            this.notifyDebounceTimer = null;
          }, 300); // 300ms debounce
        }
      }, (error) => {
        // Error in listener
      });

      this.listeners.set(`batch_${i}`, unsubscribe);
    }
  }

  // Stop listening to user statuses
  stopListening() {
    if (this.listeners.size > 0) {
      this.listeners.forEach((unsubscribe) => unsubscribe());
      this.listeners.clear();
    }
    
    // Clear debounce timer
    if (this.notifyDebounceTimer) {
      clearTimeout(this.notifyDebounceTimer);
      this.notifyDebounceTimer = null;
    }
    
    this.isListening = false;
    this.currentRootId = null;
    this.currentUserIds.clear();
  }

  // Notify all subscribers of status changes
  notifySubscribers() {
    const statuses = this.getUserStatuses();
    this.subscribers.forEach(callback => {
      try {
        callback(statuses);
      } catch (error) {
        // Error notifying subscriber
      }
    });
  }

  // Update user IDs to listen to (called when chat list changes)
  updateUserIds(rootId, userIds) {
    if (!rootId || !userIds || userIds.length === 0) {
      this.stopListening();
      return;
    }

    this.startListening(rootId, userIds);
  }

  // Add a specific user to the listening list (for individual chats)
  addUserToListening(rootId, userId) {
    if (!rootId || !userId) {
      return;
    }
    
    // Check if user is already being tracked
    if (this.currentUserIds.has(userId)) {
      return;
    }

    // Add user to current set and restart listening
    const currentUserIds = Array.from(this.currentUserIds);
    currentUserIds.push(userId);
    
    this.updateUserIds(rootId, currentUserIds);
  }

  // Get Redux state helpers
  getCurrentRootId() {
    const state = store.getState();
    return state.userDataRole?.rootId;
  }

  getCurrentUserId() {
    const state = store.getState();
    return state.userData?.id || state.userDataRole?.userId;
  }

  // Cleanup method
  cleanup() {
    this.stopListening();
    this.userStatuses.clear();
    this.subscribers.clear();
    
    if (this.notifyDebounceTimer) {
      clearTimeout(this.notifyDebounceTimer);
      this.notifyDebounceTimer = null;
    }
  }
}

// Export singleton instance
export default new CentralizedUserStatusService();
