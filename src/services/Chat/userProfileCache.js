/**
 * User Profile Cache Service
 * Caches user profiles to avoid redundant Firestore reads
 */

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

class UserProfileCache {
  constructor() {
    this.cache = new Map(); // userId -> user data
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.pendingFetches = new Map(); // userId -> Promise (for deduplication)
  }

  /**
   * Get user profile from cache or Firestore
   * @param {string} rootId - Company/root ID
   * @param {string} userId - User ID to fetch
   * @returns {Promise<Object|null>} User profile data
   */
  async getUserProfile(rootId, userId) {
    if (!userId || !rootId) return null;

    const cacheKey = `${rootId}_${userId}`;

    // Check if already in cache and not expired
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Check if fetch is already in progress (deduplicate simultaneous requests)
    if (this.pendingFetches.has(cacheKey)) {
      return this.pendingFetches.get(cacheKey);
    }

    // Fetch from Firestore
    const fetchPromise = this._fetchFromFirestore(rootId, userId, cacheKey);
    this.pendingFetches.set(cacheKey, fetchPromise);

    try {
      const userData = await fetchPromise;
      return userData;
    } finally {
      this.pendingFetches.delete(cacheKey);
    }
  }

  /**
   * Internal method to fetch from Firestore and update cache
   */
  async _fetchFromFirestore(rootId, userId, cacheKey) {
    try {
      const userRef = doc(db, "companies", rootId, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = { id: userId, ...userSnap.data() };
        
        // Store in cache with timestamp
        this.cache.set(cacheKey, {
          data: userData,
          timestamp: Date.now(),
        });

        return userData;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Batch fetch multiple user profiles
   * @param {string} rootId - Company/root ID
   * @param {string[]} userIds - Array of user IDs to fetch
   * @returns {Promise<Object>} Map of userId -> user data
   */
  async getUserProfiles(rootId, userIds) {
    if (!userIds || userIds.length === 0) return {};

    const promises = userIds.map(userId => 
      this.getUserProfile(rootId, userId).then(data => ({ userId, data }))
    );

    const results = await Promise.all(promises);
    
    // Convert array to object map
    return results.reduce((acc, { userId, data }) => {
      if (data) acc[userId] = data;
      return acc;
    }, {});
  }

  /**
   * Invalidate cache for a specific user
   * @param {string} rootId - Company/root ID
   * @param {string} userId - User ID to invalidate
   */
  invalidate(rootId, userId) {
    const cacheKey = `${rootId}_${userId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cached profiles
   */
  clearAll() {
    this.cache.clear();
    this.pendingFetches.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cachedProfiles: this.cache.size,
      pendingFetches: this.pendingFetches.size,
    };
  }
}

// Create singleton instance
const userProfileCache = new UserProfileCache();

export default userProfileCache;

