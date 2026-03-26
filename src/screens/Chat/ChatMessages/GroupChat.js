import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  ActivityIndicator,

} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatMessageHeader from "../components/ChatMessageHeader";
import UserInfoModal from "../components/UserInfoModal";
import MessageList from "../components/MessageList";
import MessageInputBar from "../components/MessageInputBar";
import NavigationService from "../../../navigator/navigationService";
import HybridChatService from "../../../services/Chat/hybridChatService";

import { db } from "../../../utils/firebase";
import {
  doc,
  onSnapshot as onSnapshotDoc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Audio } from "expo-av";

import sendSound from "../../../../assets/send.wav";
import receiveSound from "../../../../assets/receive.mp3";
import {
  sendChatNotification,
} from "../../../utils/pushNotification";

import FilePreview from "../components/FilePreview";

import { UnreadMessageService } from "../../../services/Chat/unreadMessageService";
import { updateUnreadCount } from "../../../redux/actions/Chat/Chat.actions";
import { handleFileSelect } from "./helper";
import userProfileCache from "../../../services/Chat/userProfileCache";
import centralizedUserStatusService from "../../../services/Chat/centralizedUserStatusService";

import smartListenerManager from "../../../services/Chat/smartListenerManager";
import ForwardMessageModal from "../components/ForwardMessageModal";

const detectForwardableType = (message) => {
  if (!message) {
    return null;
  }

  const checkValue = (value) => {
    if (!value || typeof value !== "string") {
      return null;
    }
    const normalized = value.toLowerCase();
    if (normalized.includes("image")) {
      return "image";
    }
    if (normalized.includes("video")) {
      return "video";
    }
    if (
      normalized.includes("doc") ||
      normalized.includes("pdf") ||
      normalized.includes("xls") ||
      normalized.includes("ppt") ||
      normalized.includes("zip") ||
      normalized.includes("file")
    ) {
      return "document";
    }
    return null;
  };

  return (
    checkValue(message.type) ||
    checkValue(message.fileData?.fileType) ||
    checkValue(message.fileData?.mimeType) ||
    checkValue(message.fileData?.name) ||
    checkValue(message.fileData?.fileName) ||
    (message.fileData ? "document" : null)
  );
};


// Utility function to fetch user data from Firestore
const fetchUserData = async (rootId, userId) => {
  try {
    // Use cache to avoid redundant Firestore reads
    return await userProfileCache.getUserProfile(rootId, userId);
  } catch (error) {
    return null;
  }
};

export default function GroupChat({ chat, navigation, route }) {
  const insets = useSafeAreaInsets();
  const intl = useIntl();
  const chatFromNavigation = route?.params?.chat || navigation?.state?.params?.chat;
  const currentChat = chatFromNavigation || chat; // Use route params first, fallback to prop
  
  // Debug logging removed to prevent infinite re-renders
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.userData.id);
  const userEmail = useSelector((state) => state.userData?.email);

  const rootId = useSelector((state) => state.userDataRole.rootId);
  const userRole = useSelector((state) => state.userDataRole?.role);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirmingUpload, setIsConfirmingUpload] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastMessageDoc, setLastMessageDoc] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [selectedUserForInfo, setSelectedUserForInfo] = useState(null);
  const [userStatuses, setUserStatuses] = useState({});
  const [isForwardModalVisible, setIsForwardModalVisible] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [isForwarding, setIsForwarding] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const unsubRef = useRef(null);
  const lastMessageId = useRef(null);
  const messagesRef = useRef([]); // Ref to track current messages state
  const soundRef = useRef(null);
  const hasMarkedAsReadRef = useRef(false); // Flag to track if chat has been marked as read
  const isLoadingOlderMessagesRef = useRef(false); // Flag to prevent subscription interference


  const userData = useSelector((state) => state.userData);
  const isAdministrator = useSelector((state) => state.userDataRole.isAdministrator);
  const isTeamLead = useSelector((state) => state.userData.isTeamLead);
  const isEditorForRoot = useSelector((state) => state.userDataRole.isEditorForRoot);
  const isOwnerForRoot = useSelector((state) => state.userDataRole.isOwnerForRoot);

  const isAdminOrSupervisor =
  userData.isAdministrator ||
  isTeamLead ||
  isEditorForRoot ||
  isOwnerForRoot ||
  isAdministrator;

  // Load more messages function
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      isLoadingOlderMessagesRef.current = true; // Set flag to prevent subscription interference
      const result = await HybridChatService.getMessagesWithPagination(
        rootId,
        currentChat.id,
        20, // Smaller pagination size for better performance
        lastMessageDoc
      );

      if (result.messages.length > 0) {
        // Enrich messages with user data (avatars, names)
        const enrichedMessages = await enrichMessagesWithUserData(result.messages);
        
        // Prevent duplicates when adding older messages
        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((m) => m.id));
          const newOlderMessages = enrichedMessages.filter(
            (m) => !existingIds.has(m.id)
          );

          if (newOlderMessages.length > 0) {
            const updatedMessages = [...newOlderMessages, ...prevMessages];
            messagesRef.current = updatedMessages; // Update ref with new messages
            return updatedMessages;
          }

          return prevMessages;
        });

        setLastMessageDoc(result.lastDoc);
        setHasMoreMessages(result.hasMore);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
    } finally {
      setIsLoadingMore(false);
      // Delay resetting the flag to allow subscription to process without interference
      setTimeout(() => {
        isLoadingOlderMessagesRef.current = false;
      }, 2000); // 2 second delay to ensure subscription doesn't interfere
    }
  }, [hasMoreMessages, isLoadingMore, rootId, currentChat.id, lastMessageDoc]);


  const currentUser = members.find((m) => m.isCurrentUser);
  const other = members.find((m) => !m.isCurrentUser);

  useEffect(() => {
    if (!currentChat?.id || !userId) {
      return;
    }

    // Initial load of messages
    const loadInitialMessages = async () => {
      try {
        setLoading(true);

        const result = await HybridChatService.getMessagesWithPagination(
          rootId,
          currentChat.id,
          15 // Smaller initial load for better performance
        );

        setMessages(result.messages);
        setLastMessageDoc(result.lastDoc);
        setHasMoreMessages(result.hasMore);
        messagesRef.current = result.messages; // Update ref with current messages

        // Additional check: if we have exactly 15 messages, there might be more
        if (result.messages.length === 15 && !result.hasMore) {
          setHasMoreMessages(true);
        }
      } catch (error) {
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadInitialMessages();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [currentChat, userId]); // Include full chat object to re-run when chat data changes

  // Mark chat as read when messages are loaded (only once)
  useEffect(() => {
    const markChatAsRead = async () => {
      if (currentChat?.id && userId && rootId && !isInitialLoading && !hasMarkedAsReadRef.current) {
        try {
          await UnreadMessageService.markChatAsRead(rootId, currentChat.id, userId);
          dispatch(updateUnreadCount(currentChat.id, 0));
          hasMarkedAsReadRef.current = true; // Mark as completed
        } catch (error) {
        }
      }
    };

    markChatAsRead();
  }, [currentChat?.id, userId, rootId, isInitialLoading]);

  // Sound effects
  async function playSendSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(sendSound);

      await sound.playAsync();

      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (e) {
    }
  }

  async function playReceiveSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(receiveSound);
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (e) {
    }
  }



  // Function to enrich messages with user data (avatars, names)
  const enrichMessagesWithUserData = useCallback(async (messages) => {
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        // If message already has avatar, return as is
        if (message.avatar) {
          return message;
        }

        // If message has senderId, try to get user data
        if (message.senderId) {
          try {
            const userDoc = await getDoc(doc(db, "companies", rootId, "users", message.senderId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                ...message,
                avatar: userData.avatar || null,
                senderName: message.senderName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
              };
            }
          } catch (error) {
          }
        }

        return message;
      })
    );

    return enrichedMessages;
  }, [rootId]);

  // Immediately navigate to ChatRoomList if currentUser is not found
  useEffect(() => {
    if (!currentUser && !loading) {
      // Small delay to ensure navigation is ready
      const timer = setTimeout(() => {
        NavigationService.navigate('ChatRoomList');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading]);

  // 🚀 Hybrid approach: Real-time listeners + FCM optimization
  useEffect(() => {
    if (!currentChat?.id || !userId || !rootId || isInitialLoading || !messages.length) {
      return;
    }


    // Clean up any existing subscriptions
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    // Get the timestamp of the last loaded message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.createdAt) {
      return;
    }

    const lastMessageTime = lastMessage.createdAt;

    // Set up listener for new messages after the last loaded message
    const messagesRef = collection(db, "companies", rootId, "chats", currentChat.id, "messages");
    const newMessagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc"), // Ascending to get newer messages
      where("createdAt", ">", lastMessageTime)
    );

    const unsubscribeNewMessages = onSnapshot(newMessagesQuery, async (snapshot) => {
      if (snapshot.empty) {
        return;
      }

      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });

      if (newMessages.length > 0) {
        
        // Enrich messages with user data (avatars, names)
        const enrichedMessages = await enrichMessagesWithUserData(newMessages);
        
        // Play receive sound if a new message arrives from other user
        const lastMsg = enrichedMessages[enrichedMessages.length - 1];
        if (lastMsg.senderId !== userId && lastMsg.id !== lastMessageId.current) {
          playReceiveSound();
        }
        
        // Merge new messages with existing ones
        setMessages(prevMessages => {
          const currentMessages = messagesRef.current || prevMessages;
          const messageMap = new Map(currentMessages.map(m => [m.id, m]));
          
          // Add new messages from real-time listener
          enrichedMessages.forEach(msg => {
            messageMap.set(msg.id, msg);
          });
          
          // Convert back to array and sort by timestamp
          const allMessages = Array.from(messageMap.values());
          allMessages.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return timeA.getTime() - timeB.getTime();
          });

          messagesRef.current = allMessages;
          return allMessages;
        });
        
        // Update last message ID for messages sent by current user
        const lastNewMessage = enrichedMessages[enrichedMessages.length - 1];
        if (lastNewMessage && lastNewMessage.senderId === userId) {
          lastMessageId.current = lastNewMessage.id;
        }
        
        // Mark chat as read in real-time when new messages arrive (user is actively viewing)
        // This prevents unread badges from appearing in ChatRoomList while user is in chat
        if (lastNewMessage && lastNewMessage.senderId !== userId) {
          UnreadMessageService.markChatAsRead(rootId, currentChat.id, userId).catch(() => {
            // Silent fail - unread count will update on next check
          });
        }
      }
    });

    // OPTIMIZATION: Single listener for message updates (respects pagination)
    // Only listen for updates to existing messages, not all messages
    const existingMessageIds = new Set(messages.map(m => m.id));
    
    const unsubscribeAllMessages = onSnapshot(messagesRef, (snapshot) => {
      const updatedMessages = [];
      snapshot.forEach((doc) => {
        const messageData = { id: doc.id, ...doc.data() };
        // Only include messages that are already loaded (respect pagination)
        if (existingMessageIds.has(doc.id)) {
          updatedMessages.push(messageData);
        }
      });
      
      // Update only existing messages, don't add new ones
      if (updatedMessages.length > 0) {
        setMessages(prevMessages => {
          const messageMap = new Map(prevMessages.map(m => [m.id, m]));
          updatedMessages.forEach(msg => {
            messageMap.set(msg.id, msg);
          });
          const updated = Array.from(messageMap.values());
          updated.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return timeA.getTime() - timeB.getTime();
          });
          messagesRef.current = updated;
          return updated;
        });
      }
    });

    // Store all unsubscribe functions
    const allUnsubscribeFunctions = [unsubscribeNewMessages, unsubscribeAllMessages];
    
    // 🚀 Use smart listener manager for cost optimization
    smartListenerManager.registerChatListeners(
      currentChat.id, 
      'group', 
      allUnsubscribeFunctions
    );

    // Store cleanup function for component unmount
    unsubRef.current = () => {
      smartListenerManager.cleanupChatListeners(currentChat.id);
    };

    // Cleanup function
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [currentChat?.id, userId, rootId, isInitialLoading, messages.length]);




  // Fetch and process member data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);

        // If currentChat.members is missing (e.g., from notification), fetch complete chat data first
        let chatData = currentChat;
        if (!currentChat.members && currentChat.id) {
          const chatRef = doc(db, "companies", rootId, "chats", currentChat.id);
          const chatSnap = await getDoc(chatRef);
          if (chatSnap.exists()) {
            chatData = { id: currentChat.id, ...chatSnap.data() };
          } else {
            setLoading(false);
            return;
          }
        }

        // Validate that we have members to process
        if (!chatData.members || chatData.members.length === 0) {
          setLoading(false);
          return;
        }

        // Process members from chat.members array
        const memberPromises = chatData.members.map(async (member) => {
          // If member already has full user data (legacy format), use it
          if (member.firstName && member.lastName) {
            return {
              ...member,
              isCurrentUser: member.id === userId || member.userId === userId,
            };
          }

          // Otherwise, fetch user data from Firestore (new format with userId)
          const userData = await fetchUserData(rootId, member.userId);
          if (userData) {
            return {
              ...member,
              ...userData,
              isCurrentUser: member.userId === userId,
            };
          }

          // Fallback if user data not found
          return {
            ...member,
            firstName: "Unknown",
            lastName: "User",
            email: "",
            avatar: null,
            isCurrentUser: member.userId === userId,
          };
        });

        const resolvedMembers = await Promise.all(memberPromises);
        setMembers(resolvedMembers);
      } catch (error) {
        // Error fetching members
      } finally {
        setLoading(false);
      }
    };

    if (currentChat && currentChat.id) {
      fetchMembers();
    }
  }, [currentChat, userId]);

  // Subscribe to user status updates for all group members
  useEffect(() => {
    if (!members || members.length === 0 || !rootId) return;

    // Get all member IDs except current user
    const memberIds = members
      .filter(m => !m.isCurrentUser)
      .map(m => m.userId || m.id)
      .filter(Boolean);

    if (memberIds.length === 0) return;

    // Update centralized service with member IDs
    centralizedUserStatusService.updateUserIds(rootId, memberIds);

    // Subscribe to status updates
    const unsubscribe = centralizedUserStatusService.subscribe((statuses) => {
      setUserStatuses(statuses);
    });

    return unsubscribe;
  }, [members, rootId]);

  // Function to refresh members (called when members are added/removed)
  const refreshMembers = useCallback(async () => {
    if (!currentChat?.id || !rootId || !userId) {
      return;
    }
    
    try {
      setLoading(true);
      const chatRef = doc(db, "companies", rootId, "chats", currentChat.id);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const chatData = { id: currentChat.id, ...chatSnap.data() };
        
        if (!chatData.members || chatData.members.length === 0) {
          setLoading(false);
          return;
        }


        // Process members from chat.members array
        const memberPromises = chatData.members.map(async (member) => {
          try {
            // If member already has full user data (legacy format), use it
            if (member.firstName && member.lastName) {
              return {
                ...member,
                isCurrentUser: member.id === userId || member.userId === userId,
              };
            }

            // Otherwise, fetch user data from Firestore (new format with userId)
            const userData = await fetchUserData(rootId, member.userId);
            if (userData) {
              return {
                ...member,
                ...userData,
                isCurrentUser: member.userId === userId,
              };
            }

            // Fallback if user data not found
            return {
              ...member,
              firstName: "Unknown",
              lastName: "User",
              email: "",
              avatar: null,
              isCurrentUser: member.userId === userId,
            };
          } catch (error) {
            return {
              ...member,
              firstName: "Unknown",
              lastName: "User",
              email: "",
              avatar: null,
              isCurrentUser: member.userId === userId,
            };
          }
        });

        const resolvedMembers = await Promise.all(memberPromises);
        setMembers(resolvedMembers);
      } else {
      }
    } catch (error) {
      // Error refreshing members
    } finally {
      setLoading(false);
    }
  }, [currentChat?.id, userId, rootId]);

  // Message interaction handlers
  const handleReact = useCallback(async (messageId, emoji) => {
    try {
      if (!currentUser || !currentChat?.id) {
        return;
      }

      // Prepare user data for the reaction
      const userData = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      };

      // Add reaction using HybridChatService
      const reactions = await HybridChatService.addReaction(
        rootId,
        currentChat.id,
        messageId,
        currentUser.id,
        userData,
        emoji
      );

      // Update local state immediately to show the reaction
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, reactions: reactions } : msg
        );
        messagesRef.current = updatedMessages; // Update ref
        return updatedMessages;
      });
    } catch (error) {
      Alert.alert("Error", "Failed to add reaction. Please try again.");
    }
  }, [currentUser, currentChat?.id, rootId]);

  const handleReply = useCallback((message) => {
    setReplyingTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleMentionAdded = useCallback((mention) => {
    setMentionedUsers((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.userId === mention.userId)) {
        return prev;
      }
      return [...prev, mention];
    });
  }, []);

  const handleEdit = useCallback((message) => {
    setEditingMessage(message);
    setInput(message.text || "");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setInput("");
  }, []);

  const handleDelete = useCallback(async (messageId) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Find the message in local state to get its data
              const messageToDelete = messages.find(msg => msg.id === messageId);
              
              if (!messageToDelete) {
                return;
              }
              
              // Update local state immediately to remove the message from UI
              setMessages((prevMessages) => {
                const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
                messagesRef.current = updatedMessages; // Update ref
                return updatedMessages;
              });
              
              // Delete from Firestore
              const messageRef = doc(
                db,
                "companies",
                rootId,
                "chats",
                currentChat.id,
                "messages",
                messageId
              );
              await deleteDoc(messageRef);
              

            } catch (error) {
              // Error deleting message
              // Revert local state change if Firestore deletion failed
              setMessages((prevMessages) => {
                const messageToRestore = messages.find(msg => msg.id === messageId);
                if (messageToRestore) {
                  const updatedMessages = [...prevMessages, messageToRestore];
                  updatedMessages.sort((a, b) => {
                    const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt);
                    const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt);
                    return timeA.getTime() - timeB.getTime();
                  });
                  messagesRef.current = updatedMessages;
                  return updatedMessages;
                }
                return prevMessages;
              });
            }
          },
        },
      ]
    );
  }, [rootId, currentChat.id, currentChat.projectId, messages, dispatch]);

  const handleForwardCancel = useCallback(() => {
    if (isForwarding) {
      return;
    }
    setIsForwardModalVisible(false);
    setMessageToForward(null);
  }, [isForwarding]);

  const handleForwardRequest = useCallback((message) => {
    if (!message) {
      return;
    }

    const forwardType = detectForwardableType(message);

    if (!forwardType) {
      Alert.alert(
        "Forward unavailable",
        "Only images, videos or documents can be forwarded."
      );
      return;
    }

    setMessageToForward(message);
    setIsForwardModalVisible(true);
  }, []);

  const handleForwardToChat = useCallback(
    async (targetChat) => {
      if (!targetChat || !messageToForward || !rootId) {
        return;
      }

      // Get sender profile
      const senderProfile =
        currentUser ||
        members.find(
          (member) =>
            member.userId === userId ||
            member.id === userId ||
            member.email === userEmail
        ) || {
          id: userId,
          firstName: "",
          lastName: "",
          email: userEmail,
          avatar: null,
        };

      const senderIdValue = senderProfile.id || userId;
      const senderNameValue =
        `${senderProfile.firstName || ""} ${senderProfile.lastName || ""}`.trim() ||
        senderProfile.name ||
        senderProfile.email ||
        "You";

      try {
        setIsForwarding(true);

        const attachmentType = detectForwardableType(messageToForward) || "document";

        const forwardedMessage = {
          text:
            messageToForward.text ||
            messageToForward.fileData?.fileName ||
            "",
          type: attachmentType,
          senderId: senderIdValue,
          senderName: senderNameValue,
          avatar: senderProfile.avatar || null,
          status: "sent",
          timestamp: new Date().toISOString(),
        };

        if (messageToForward.fileData) {
          forwardedMessage.fileData = { ...messageToForward.fileData };
        }

        forwardedMessage.forwardedFrom = {
          chatId: currentChat?.id,
          messageId: messageToForward.id,
          senderName: messageToForward.senderName || senderNameValue,
        };

        await HybridChatService.sendMessage(
          rootId,
          targetChat.id,
          forwardedMessage
        );

        const targetName =
          targetChat.name ||
          targetChat.displayName ||
          targetChat.groupName ||
          targetChat.chatName ||
          "chat";

        playSendSound();
        // Don't close modal - allow forwarding to multiple chats
        // setIsForwardModalVisible(false);
        // setMessageToForward(null);
      } catch (forwardError) {
        Alert.alert(
          "Forward failed",
          forwardError?.message || "Failed to forward attachment"
        );
      } finally {
        setIsForwarding(false);
      }
    },
    [
      currentChat?.id,
      currentUser,
      members,
      messageToForward,
      detectForwardableType,
      rootId,
      userEmail,
      userId,
      playSendSound,
    ]
  );

  // File handling
  const handleFileSelectLocal = async (fileData) => {
    await handleFileSelect(
      fileData,
      setSelectedFile,
      setIsSelectingFile,
      setUploadProgress,
      setIsConfirmingUpload
    );
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsConfirmingUpload(false);
  };

  const handleDeleteChat = async () => {
    try {
    
      
      const result = await HybridChatService.deleteChat(
        rootId, 
        currentChat.id, 
        userId, 
        isAdminOrSupervisor, 
        isAdminOrSupervisor, 
        'group'
      );
      
      if (result.success) {
        // Cleanup listeners before navigating away
        if (unsubRef.current) {
          unsubRef.current();
        }
        
        // Navigate back to chat list
        navigation.goBack();
        
        Alert.alert("Success", "Group chat has been deleted successfully.");
      } else {
        Alert.alert("Error", result.error || "Failed to delete chat. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while deleting the chat. Please try again.");
    }
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() && !selectedFile) {
      return;
    }

    if (!currentUser) {
      Alert.alert(
        "Error",
        "Unable to identify current user. Please try refreshing the group chat.",
        [{ text: "OK" }]
      );
      return;
    }

    setMessageLoading(true);
    setUploadProgress(0);

    try {
      const senderName =
        `${currentUser.firstName} ${currentUser.lastName}`.trim();

      // Check if we're editing an existing message
      if (editingMessage) {
        // Update the existing message in Firestore
        await HybridChatService.updateMessage(
          rootId,
          currentChat.id,
          editingMessage.id,
          {
            text: input.trim(),
            editedAt: new Date().toISOString(),
            isEdited: true,
          }
        );

        // Update the local state immediately to show the edited message
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.map((msg) =>
            msg.id === editingMessage.id
              ? {
                  ...msg,
                  text: input.trim(),
                  editedAt: new Date().toISOString(),
                  isEdited: true,
                }
              : msg
          );
          messagesRef.current = updatedMessages; // Update ref
          return updatedMessages;
        });

        // Clear editing state
        setEditingMessage(null);
        setInput("");
        setMessageLoading(false);
        return;
      }
      // Determine message type based on content
      let messageType = "text";
      if (selectedFile) {
        if (
          selectedFile.type.includes("image") ||
          selectedFile.type.includes("image/pdf") ||
          selectedFile.type.includes("application/octet-stream") ||
          selectedFile.type.includes("jpeg") ||
          selectedFile.type.includes("png") ||
          selectedFile.type.includes("gif") ||
          selectedFile.type.includes("bmp") ||
          selectedFile.type.includes("tiff") ||
          selectedFile.type.includes("webp") ||
          selectedFile.type.includes("jpg")
        ) {
          messageType = "image";
        } else if (selectedFile.type.includes("video")) {
          messageType = "video";
        } else {
          messageType = "document";
        }
      }
      // Determine message text based on type
      let messageText = input;
      if (selectedFile && messageType !== "text") {
        // For file messages, use the file name as the text if no input text
        messageText = input.trim() || selectedFile.name;
      }
      let messageData = {
        text: messageText,
        type: messageType, // Add message type
        senderId: currentUser.id,
        senderName: senderName,
        avatar: currentUser.avatar || null,
        status: "sent",
        timestamp: new Date().toISOString(),
      };

      // Add mentions if any
      if (mentionedUsers.length > 0) {
        messageData.mentions = mentionedUsers.map((m) => ({
          userId: m.userId,
          displayName: m.displayName,
        }));
      }

      // Add reply data if replying to a message
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.senderName,
          type: replyingTo.type || "text",
        };
      }

      // If file is selected, store minimal file data
      if (selectedFile) {
        setUploadProgress(75);

        // Store only essential file data
        messageData.fileData = {
          url: selectedFile.url, // Azure URL for loading the file
          fileName: selectedFile.name, // Original file name for display
          fileType: selectedFile.type || "application/octet-stream", // File type for rendering with fallback
          uploadId: selectedFile.uploadId, // Server-generated UUID for storage
        };
      }

      // Use hybrid service to send message
      const sentMessage = await HybridChatService.sendMessage(
        rootId,
        currentChat.id,
        messageData
      );

      // Add the sent message to local state immediately
      if (sentMessage) {
        // Add to local messages state immediately
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, sentMessage];
          messagesRef.current = updatedMessages; // Update ref
          return updatedMessages;
        });

        // Update last message ID ref
        lastMessageId.current = sentMessage.id;
      }


      // Save mentioned users before clearing
      const sentMentionedUsers = [...mentionedUsers];
      
      setInput("");
      setSelectedFile(null);
      setUploadProgress(0);
      setReplyingTo(null); // Clear reply state
      setMentionedUsers([]); // Clear mentioned users

      // Play send sound
      playSendSound();

      // Send push notifications
      // Priority 1: Mentioned users who are offline
      // Priority 2: All other group members
      const otherMembers = members.filter((member) => !member.isCurrentUser);
      const mentionedUserIds = sentMentionedUsers.map((m) => m.userId);

      for (const member of otherMembers) {
        const memberId = member.userId || member.id;
        const isMentioned = mentionedUserIds.includes(memberId);
        const memberStatus = userStatuses[memberId];
        const isOnline = memberStatus?.online;

        // Always send to mentioned users, only send to others if they're offline
        if (!isMentioned && isOnline) {
          continue;
        }
        
        // Send notification if user is not active (offline or status not available)
        const isUserActive = memberStatus?.isActive === true;
        
        if (!isUserActive) {
          // Special notification message for mentions
          const notificationMessage = isMentioned
            ? `${senderName} mentioned you: ${input.trim().substring(0, 50)}${input.trim().length > 50 ? "..." : ""}`
            : selectedFile
            ? `Sent ${selectedFile.name}`
            : input.trim();

          await sendChatNotification(
            memberId,
            senderName,
            notificationMessage,
            currentChat.name || "Group",
            "group",
            currentChat.id
          );
        }
      }
    } catch (e) {
      Alert.alert(
        "Error",
        `Failed to send group message: ${e.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
      setSelectedFile(null);
      setUploadProgress(0);
    }
    setMessageLoading(false);
  }, [input, selectedFile, currentUser, editingMessage, replyingTo, rootId, currentChat.id, currentChat.name, currentChat.projectId, members, mentionedUsers, userStatuses]);

  if (loading) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#64748b" }}>
          Loading group chat data...
        </Text>
      </KeyboardAvoidingView>
    );
  }


  if (!currentUser) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
      >
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ fontSize: 16, color: "#6b7280", marginTop: 10 }}>
          Redirecting to chat list...
        </Text>
      </KeyboardAvoidingView>
    );
  }

  // Compose subtitle: e.g. "5 members"
  const subtitle = `${members.length} member${members.length > 1 ? "s" : ""}`;
  // Use group avatar or fallback
  const avatar = chat.avatar || undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : insets.bottom}
    >
      <ChatMessageHeader
        title={chat.name || "Group"}
        subtitle={subtitle}
        avatar={avatar}
        initials={
          !avatar
            ? (chat.name || "Group").substring(0, 2).toUpperCase()
            : undefined
        }
        onBack={() => navigation.goBack()}
        groupActions={null} // Placeholder for group actions
        isGroupChat={true}
        members={members}
        chatName={chat.name || "Group"}
        chatId={currentChat.id}
        onMembersChanged={currentChat?.id ? refreshMembers : null}
        onDeleteChat={handleDeleteChat}
        onHeaderPress={() => {
          // For group chats, we'll show group info instead of individual user info
          setSelectedUserForInfo({
            firstName: "Group",
            lastName: chat.name || "Chat",
            email: "",
            avatar: avatar,
            isActive: true,
            lastSeen: new Date().toISOString(),
          });
          setShowUserInfoModal(true);
        }}
        userData={{
          firstName: "Group",
          lastName: chat.name || "Chat",
          email: "",
          avatar: avatar,
          isActive: true,
          lastSeen: new Date().toISOString(),
        }}
      />
      {isInitialLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#64748b" }}>
            Loading messages...
          </Text>
        </View>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={currentUser.id}
          showAvatars={true}
          isGroup={true}
          onReact={handleReact}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onForward={handleForwardRequest}
          onLoadMore={loadMoreMessages}
          hasMore={hasMoreMessages}
          isLoadingMore={isLoadingMore}
          style={{ flex: 1 }}
        />
      )}

      <ForwardMessageModal
        visible={isForwardModalVisible}
        onClose={handleForwardCancel}
        message={messageToForward}
        rootId={rootId}
        userId={currentUser?.id}
        userEmail={userEmail}
        excludeChatId={currentChat?.id}
        onForward={handleForwardToChat}
        isForwarding={isForwarding}
        translations={{
          title: intl.formatMessage({ id: "chat.forward.title" }),
          image: intl.formatMessage({ id: "chat.forward.image" }),
          video: intl.formatMessage({ id: "chat.forward.video" }),
          document: intl.formatMessage({ id: "chat.forward.document" }),
          attachment: intl.formatMessage({ id: "chat.forward.attachment" }),
          send: intl.formatMessage({ id: "chat.forward.send" }),
          sent: intl.formatMessage({ id: "chat.forward.sent" }),
          cancel: intl.formatMessage({ id: "chat.forward.cancel" }),
          search: intl.formatMessage({ id: "chat.forward.search" }),
          noChats: intl.formatMessage({ id: "chat.forward.noChats" }),
          noResults: intl.formatMessage({ id: "chat.forward.noResults" }),
          error: intl.formatMessage({ id: "chat.forward.error" }),
          retry: intl.formatMessage({ id: "chat.forward.retry" }),
          single: intl.formatMessage({ id: "chat.forward.single" }),
          groups: intl.formatMessage({ id: "chat.forward.groups" }),
        }}
      />

      {/* File Preview */}
      {selectedFile && (
        <FilePreview fileData={selectedFile} onRemove={handleRemoveFile} />
      )}

      <MessageInputBar
        value={input}
        onChangeText={setInput}
        onSend={handleSend}
        loading={messageLoading || isConfirmingUpload || isSelectingFile}
        onFileSelect={handleFileSelectLocal}
        uploadProgress={uploadProgress}
        isConfirmingUpload={isConfirmingUpload}
        isSelectingFile={isSelectingFile}
        editingMessage={editingMessage}
        onCancelEdit={handleCancelEdit}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        members={members}
        currentUserId={userId}
        isGroupChat={true}
        onMentionAdded={handleMentionAdded}
      />

      {/* User Info Modal */}
      <UserInfoModal
        visible={showUserInfoModal}
        onClose={() => setShowUserInfoModal(false)}
        userData={selectedUserForInfo}
        isGroupChat={true}
        groupName={currentChat.name || "Group"}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
});
