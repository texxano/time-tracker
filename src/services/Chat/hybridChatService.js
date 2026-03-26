import {
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  where,
  arrayUnion,
  arrayRemove,
  increment,
  deleteDoc,
  limit as limitFn,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../../utils/firebase";

// Redis imports removed - using Firestore only

export class HybridChatService {
  // Chat List Management
  static async getChatList(rootId, userId, userEmail) {
    const startTime = Date.now();
    try {
      const chatsRef = collection(db, "companies", rootId, "chats");


      // Try to use a more efficient query with array-contains if possible
      // This requires the members array to be structured consistently
      let userChats = [];
      let queryMethod = "unknown";

      try {
        // First, try to query chats where the user is a member using array-contains
        // This is much faster than fetching all chats and filtering
        const memberQuery = query(
          chatsRef,
          where("memberIds", "array-contains", userId)
        );


        const memberSnapshot = await getDocs(memberQuery);
        memberSnapshot.forEach((doc) => {
          const chatData = { id: doc.id, ...doc.data() };
          // Ensure memberIds is an array before processing
          if (Array.isArray(chatData.memberIds)) {
            userChats.push(chatData);
          }
        });

        queryMethod = "memberIds (fast)";
      } catch (queryError) {
        // Fallback: get all chats and filter in memory (slower but more flexible)
        const allChatsQuery = query(chatsRef);

        const allChatsSnapshot = await getDocs(allChatsQuery);

        const processedChatIds = new Set();

        allChatsSnapshot.forEach((doc) => {
          const chatData = { id: doc.id, ...doc.data() };

          // Check if user is a member of this chat
          const isMember =
            Array.isArray(chatData.members) &&
            chatData.members.some((member) => {
              if (typeof member === "object" && member !== null) {
                return member.userId === userId;
              }
              return member === userId || member === userEmail;
            });

          if (isMember && !processedChatIds.has(doc.id)) {
            userChats.push(chatData);
            processedChatIds.add(doc.id);
          }
        });

        queryMethod = "full scan (slow)";
      }

      // Sort chats by last message timestamp (most recent first)
      if (userChats.length > 0) {
        userChats.sort((a, b) => {
          const aTime =
            a.lastMessage?.createdAt?.toDate?.() ||
            a.lastMessage?.createdAt ||
            a.createdAt?.toDate?.() ||
            a.createdAt ||
            new Date(0);
          const bTime =
            b.lastMessage?.createdAt?.toDate?.() ||
            b.lastMessage?.createdAt ||
            b.createdAt?.toDate?.() ||
            b.createdAt ||
            new Date(0);

          const aDate = aTime instanceof Date ? aTime : new Date(aTime);
          const bDate = bTime instanceof Date ? bTime : new Date(bTime);

          return bDate.getTime() - aDate.getTime();
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Return performance information along with chats
      return {
        chats: userChats,
        performance: {
          duration,
          queryMethod: queryMethod || "unknown",
          isOptimized: queryMethod === "memberIds (fast)",
        },
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Return empty result with proper structure
      return {
        chats: [],
        performance: {
          duration,
          queryMethod: "error",
          isOptimized: false,
        },
      };
    }
  }

  // Utility function to add memberIds field to existing chats for better performance
  static async addMemberIdsToExistingChats(rootId) {
    try {
      const chatsRef = collection(db, "companies", rootId, "chats");
      const allChatsQuery = query(chatsRef);
      const allChatsSnapshot = await getDocs(allChatsQuery);

      let updatedCount = 0;

      for (const chatDoc of allChatsSnapshot.docs) {
        const chatData = chatDoc.data();

        // Skip if memberIds already exists
        if (chatData.memberIds && Array.isArray(chatData.memberIds)) {
          continue;
        }

        // Extract member IDs from members array
        const memberIds = [];
        if (chatData.members && Array.isArray(chatData.members)) {
          chatData.members.forEach((member) => {
            if (
              typeof member === "object" &&
              member !== null &&
              member.userId
            ) {
              memberIds.push(member.userId);
            } else if (typeof member === "string") {
              memberIds.push(member);
            }
          });
        }

        // Update the chat document with memberIds
        if (memberIds.length > 0) {
          await updateDoc(chatDoc.ref, {
            memberIds: memberIds,
          });
          updatedCount++;
        }
      }

      return updatedCount;
    } catch (error) {
      return 0;
    }
  }

  static subscribeToChatList(rootId, userId, userEmail, callback) {
    const chatsRef = collection(db, "companies", rootId, "chats");

    // Try to use the same efficient query approach as getChatList
    let q;

    try {
      // Use array-contains query for better performance
      q = query(chatsRef, where("memberIds", "array-contains", userId));
    } catch (queryError) {
      // Fallback to full collection query
      q = query(chatsRef);
    }

    // 🚀 OPTIMIZATION: Track previous state to detect meaningful changes
    let previousChatData = new Map();
    let debounceTimer = null;
    let pendingUpdate = null;

    // Helper to create a hash of relevant chat fields
    const getChatHash = (chat) => {
      return JSON.stringify({
        id: chat.id,
        lastMessageId: chat.lastMessage?.id,
        lastMessageTime: chat.lastMessage?.createdAt?.seconds || chat.lastMessage?.createdAt,
        lastMessageText: chat.lastMessage?.text,
        type: chat.type,
        name: chat.name,
        membersCount: chat.members?.length || 0,
      });
    };

    return onSnapshot(
      q,
      async (querySnapshot) => {
        const userChats = [];
        const processedChatIds = new Set();
        let hasRelevantChanges = false;

        querySnapshot.forEach((doc) => {
          const chatData = { id: doc.id, ...doc.data() };

          // If we used memberIds query, we can trust all results are user's chats
          // Otherwise, filter in memory like before
          let isMember = true;

          if (!q.where) {
            // We're using full collection query, need to filter
            isMember = chatData.members?.some((member) => {
              if (typeof member === "object" && member !== null) {
                return member.userId === userId;
              }
              return member === userId || member === userEmail;
            });
          }

          if (isMember && !processedChatIds.has(doc.id)) {
            userChats.push(chatData);
            processedChatIds.add(doc.id);

            // 🚀 Check if this chat has meaningful changes
            const currentHash = getChatHash(chatData);
            const previousHash = previousChatData.get(doc.id);
            
            if (previousHash !== currentHash) {
              hasRelevantChanges = true;
              previousChatData.set(doc.id, currentHash);
            }
          }
        });

        // Check for deleted chats
        const currentChatIds = new Set(userChats.map(c => c.id));
        previousChatData.forEach((_, chatId) => {
          if (!currentChatIds.has(chatId)) {
            hasRelevantChanges = true;
            previousChatData.delete(chatId);
          }
        });

        // Only trigger callback if there are relevant changes
        if (!hasRelevantChanges && previousChatData.size > 0) {
          return;
        }

        // Sort chats by last message timestamp (most recent first)
        if (userChats.length > 0) {
          userChats.sort((a, b) => {
            const aTime =
              a.lastMessage?.createdAt?.toDate?.() ||
              a.lastMessage?.createdAt ||
              a.createdAt?.toDate?.() ||
              a.createdAt ||
              new Date(0);
            const bTime =
              b.lastMessage?.createdAt?.toDate?.() ||
              b.lastMessage?.createdAt ||
              b.createdAt?.toDate?.() ||
              b.createdAt ||
              new Date(0);

            const aDate = aTime instanceof Date ? aTime : new Date(aTime);
            const bDate = bTime instanceof Date ? bTime : new Date(bTime);

            return bDate.getTime() - aDate.getTime();
          });
        }

        // 🚀 OPTIMIZATION: Debounce callback to prevent rapid-fire updates
        pendingUpdate = userChats;
        
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          if (pendingUpdate) {
            callback(pendingUpdate);
            pendingUpdate = null;
          }
        }, 300); // 300ms debounce
      },
      (error) => {}
    );
  }

  // User Status Management
  static async updateUserStatus(rootId, userId, isActive, lastSeen = null) {
    try {
      const userRef = doc(db, "companies", rootId, "users", userId);
      const statusData = {
        isActive,
        lastSeen: lastSeen || serverTimestamp(),
        updatedAt: serverTimestamp(),
        platform: Platform.OS,
      };

      // Try to update, if document doesn't exist, create it
      try {
        await updateDoc(userRef, statusData);
      } catch (updateError) {
        // If document doesn't exist, create it
        if (updateError.code === 'not-found') {
          // Get user data from Redux store
          const { store } = require('../../redux/store/store');
          const state = store.getState();
          const userData = state.userData;
          
          const newUserData = {
            id: userId,
            firstName: userData?.firstName || userData?.first_name || "",
            lastName: userData?.lastName || userData?.last_name || "",
            email: userData?.email || "",
            avatar: userData?.avatar || null,
            ...statusData,
            createdAt: serverTimestamp(),
          };
          
          await setDoc(userRef, newUserData);
        } else {
          throw updateError;
        }
      }
    } catch (error) {
      console.error("Error in updateUserStatus:", error);
      throw error;
    }
  }

  // Message Management
  static async sendMessage(rootId, chatId, messageData) {
    try {
      const chatRef = doc(db, "companies", rootId, "chats", chatId);
      const messagesRef = collection(chatRef, "messages");

      // Add reactions field to new messages
      const messageWithReactions = {
        ...messageData,
        reactions: {},
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(messagesRef, messageWithReactions);

      // Update lastMessage in chat document
      const lastMessageText = messageData.fileData
        ? `${messageData.fileData.fileName}${
            messageData.text ? ` - ${messageData.text}` : ""
          }`
        : messageData.text;

      await updateDoc(chatRef, {
        lastMessage: {
          text: lastMessageText,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          createdAt: serverTimestamp(),
        },
      });

      // Return the complete message object for immediate local state update
      const completeMessage = {
        id: docRef.id,
        ...messageWithReactions,
        createdAt: new Date(), // Use current client time for immediate display
      };

      return completeMessage;
    } catch (error) {
      throw error;
    }
  }

  static async updateMessage(rootId, chatId, messageId, updateData) {
    try {
      const chatRef = doc(db, "companies", rootId, "chats", chatId);
      const messageRef = doc(chatRef, "messages", messageId);

      // Update the message with the new data
      await updateDoc(messageRef, updateData);

      return messageId;
    } catch (error) {
      throw error;
    }
  }

  static async deleteMessage(rootId, chatId, messageId) {
    try {
      const chatRef = doc(db, "companies", rootId, "chats", chatId);
      const messageRef = doc(chatRef, "messages", messageId);
      await deleteDoc(messageRef);

      return messageId;
    } catch (error) {
      throw error;
    }
  }

  static subscribeToMessages(rootId, chatId, callback, sinceTimestamp = null) {
    const messagesRef = collection(
      db,
      "companies",
      rootId,
      "chats",
      chatId,
      "messages"
    );

    let q;

    if (sinceTimestamp) {
      // Listen to recent messages for ANY changes (new messages + updates to existing ones)
      // This is the ONLY way to catch message edits in real-time

      q = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limitFn(30) // Listen to last 30 messages for any changes
      );
    } else {
      // Fallback: listen to recent messages only (should not happen in normal flow)
      q = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limitFn(10) // Very small limit for fallback
      );
    }


    return onSnapshot(
      q,
      async (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          const messageData = { id: doc.id, ...doc.data() };
          messages.push(messageData);
        });

        // Call callback with all messages (parent will handle deduplication and filtering)
        if (messages.length > 0) {
          callback(messages.reverse()); // Reverse to get chronological order
        } else {
        }
      },
      (error) => {}
    );
  }

  static async getMessagesWithPagination(
    rootId,
    chatId,
    limitCount = 20,
    lastMessageDoc = null
  ) {
    try {
      const messagesRef = collection(
        db,
        "companies",
        rootId,
        "chats",
        chatId,
        "messages"
      );

      let q;
      if (lastMessageDoc) {
        // Pagination: get messages before the last message
        const lastMessageTime = lastMessageDoc.data().createdAt;

        q = query(
          messagesRef,
          orderBy("createdAt", "desc"),
          limitFn(limitCount),
          where("createdAt", "<", lastMessageTime)
        );
      } else {
        // Initial load: get the most recent messages
        q = query(
          messagesRef,
          orderBy("createdAt", "desc"),
          limitFn(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      // Determine if there are more messages
      const hasMore = messages.length === limitCount;

      const result = {
        messages: messages.reverse(), // Reverse to get chronological order
        hasMore: hasMore,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      };

      return result;
    } catch (error) {
      return { messages: [], hasMore: false, lastDoc: null };
    }
  }

  // Reaction Management
  static async addReaction(rootId, chatId, messageId, userId, userData, emoji) {
    try {
      const messageRef = doc(
        db,
        "companies",
        rootId,
        "chats",
        chatId,
        "messages",
        messageId
      );

      // Get current message data
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        throw new Error("Message not found");
      }

      const messageData = messageDoc.data();
      const reactions = messageData.reactions || {};

      // Initialize emoji reaction if it doesn't exist
      if (!reactions[emoji]) {
        reactions[emoji] = {
          count: 0,
          users: [],
        };
      }

      // Check if user already reacted with this emoji
      const existingUserIndex = reactions[emoji].users.findIndex(
        (user) => user.id === userId
      );

      if (existingUserIndex === -1) {
        // Add new reaction
        reactions[emoji].users.push({
          id: userId,
          name:
            userData.name ||
            `${userData.firstName} ${userData.lastName}`.trim(),
          avatar: userData.avatar || null,
          reactedAt: new Date().toISOString(), // Use regular timestamp instead of serverTimestamp
        });
        reactions[emoji].count = reactions[emoji].users.length;
      } else {
        // User already reacted, remove their reaction
        reactions[emoji].users.splice(existingUserIndex, 1);
        reactions[emoji].count = reactions[emoji].users.length;

        // Remove emoji if no users left
        if (reactions[emoji].count === 0) {
          delete reactions[emoji];
        }
      }

      // Update the message with new reactions
      await updateDoc(messageRef, {
        reactions: reactions,
      });

      return reactions;
    } catch (error) {
      throw error;
    }
  }

  // Group Chat Member Management
  static async addMemberToGroup(rootId, chatId, userId, userData) {
    try {
      const chatRef = doc(db, "companies", rootId, "chats", chatId);

      // First, get the current chat data
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        return { success: false, error: "Chat not found" };
      }

      const chatData = chatSnap.data();
      const currentMembers = chatData.members || [];
      const currentMemberIds = chatData.memberIds || [];

      // Check if user is already a member
      if (currentMemberIds.includes(userId)) {
        return {
          success: false,
          error: "User is already a member of this group",
        };
      }

      // Add to members array
      const newMember = {
        userId: userId,
        role: "member",
        addedAt: new Date().toISOString(),
        addedBy: userData.id,
      };

      // Update with new arrays
      await updateDoc(chatRef, {
        members: [...currentMembers, newMember],
        memberIds: [...currentMemberIds, userId],
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async removeMemberFromGroup(rootId, chatId, userId, userData) {
    try {
      const chatRef = doc(db, "companies", rootId, "chats", chatId);

      // Get current chat data to find the exact member object to remove
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        return { success: false, error: "Chat not found" };
      }

      const chatData = chatSnap.data();
      const memberToRemove = chatData.members?.find(
        (member) => member.userId === userId
      );

      if (!memberToRemove) {
        return { success: false, error: "Member not found in group" };
      }

      // Remove from members array and memberIds
      await updateDoc(chatRef, {
        members: arrayRemove(memberToRemove),
        memberIds: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async deleteChat(rootId, chatId, userId, isAdmin, isSupervisor, chatType) {
    try {
      // Permission check for group chats
      if (chatType === 'group' && !isAdmin && !isSupervisor) {
        return { success: false, error: "Only admins and supervisors can delete group chats" };
      }

      const chatRef = doc(db, "companies", rootId, "chats", chatId);

      // Check if chat exists before deleting
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        return { success: false, error: "Chat not found" };
      }

      // Delete all messages in the chat first
      const messagesRef = collection(chatRef, "messages");
      const messagesSnapshot = await getDocs(messagesRef);
      
      // Delete all messages in batches
      const deletePromises = [];
      messagesSnapshot.forEach((messageDoc) => {
        deletePromises.push(deleteDoc(messageDoc.ref));
      });
      
      await Promise.all(deletePromises);

      // Now delete the chat document
      await deleteDoc(chatRef);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get or create single chat
  static async getOrCreateSingleChat(rootId, currentUser, otherUser) {
    try {
      // Import uuid v3 dynamically
      const { v3: uuidv3 } = await import('uuid');
      
      // Ensure both users exist in Firestore users collection
      const currentUserRef = doc(db, 'companies', rootId, 'users', currentUser.id);
      const otherUserRef = doc(db, 'companies', rootId, 'users', otherUser.id);
      
      // Check and create/update current user
      const currentUserSnap = await getDoc(currentUserRef);
      if (!currentUserSnap.exists()) {
        const currentUserData = {
          id: currentUser.id,
          firstName: currentUser.firstName || "Unknown",
          lastName: currentUser.lastName || "User",
          email: currentUser.email || "",
          avatar: currentUser.avatar || null,
          isActive: true,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await setDoc(currentUserRef, currentUserData);
      }
      
      // Check and create/update other user
      const otherUserSnap = await getDoc(otherUserRef);
      if (!otherUserSnap.exists()) {
        const otherUserData = {
          id: otherUser.id,
          firstName: otherUser.firstName || "Unknown",
          lastName: otherUser.lastName || "User",
          email: otherUser.email || "",
          avatar: otherUser.avatar || null,
          isActive: false,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await setDoc(otherUserRef, otherUserData);
      }

      // Use references instead of full user data
      const members = [
        {
          userId: currentUser.id,
          role: 'member',
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
        },
        {
          userId: otherUser.id,
          role: 'member',
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
        }
      ];

      // Add memberIds array for efficient querying
      const memberIds = [currentUser.id, otherUser.id];

      // Deterministic chat id (uuid v3) based on sorted user ids
      const idPair = [currentUser.id, otherUser.id].sort().join(":");
      const chatId = uuidv3(idPair, uuidv3.DNS);

      // Check if chat already exists
      const chatRef = doc(collection(db, 'companies', rootId, 'chats'), chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        // Chat already exists, return it
        return {
          success: true,
          chat: { id: chatSnap.id, ...chatSnap.data() },
          chatId: chatSnap.id,
          isNew: false,
        };
      }

      // Create new chat
      const chatObj = {
        id: chatId,
        type: 'single',
        name: null,
        createdAt: new Date().toISOString(),
        lastMessage: null,
        members: members,
        memberIds: memberIds,
        createdBy: currentUser.id,
      };

      await setDoc(chatRef, chatObj);
      
      return {
        success: true,
        chat: chatObj,
        chatId: chatId,
        isNew: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default HybridChatService;
