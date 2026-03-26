import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  ActivityIndicator,
  AppState,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIntl } from "react-intl";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatMessageHeader from "../components/ChatMessageHeader";
import UserInfoModal from "../components/UserInfoModal";
import MessageList from "../components/MessageList";
import MessageInputBar from "../components/MessageInputBar";
import NavigationService from "../../../navigator/navigationService";
import { db } from "../../../utils/firebase";
import {
  doc,
  onSnapshot as onSnapshotDoc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import sendSound from "../../../../assets/send.wav";
import receiveSound from "../../../../assets/receive.mp3";
import {
  sendChatNotification,
} from "../../../utils/pushNotification";
import HybridChatService from "../../../services/Chat/hybridChatService";
import { UnreadMessageService } from "../../../services/Chat/unreadMessageService";
import centralizedUserStatusService from "../../../services/Chat/centralizedUserStatusService";


import FilePreview from "../components/FilePreview";
import { chatService } from "../../../services/Chat/Chat.services";
import { updateUnreadCount } from "../../../redux/actions/Chat/Chat.actions";
import { handleFileSelect } from "./helper";
import userProfileCache from "../../../services/Chat/userProfileCache";

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
    return await userProfileCache.getUserProfile(rootId, userId);
  } catch (error) {
    return null;
  }
};

export default function SingleChat({ chat, navigation, route }) {
  // ALL HOOKS - NO CONDITIONAL LOGIC BEFORE THESE
  const dispatch = useDispatch();
  const intl = useIntl();
  const insets = useSafeAreaInsets();
  const userId = useSelector((state) => state.userData?.id);
  const userEmail = useSelector((state) => state.userData?.email);

  const rootId = useSelector((state) => state.userDataRole?.rootId);
  const userRole = useSelector((state) => state.userDataRole?.role);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [otherUserStatus, setOtherUserStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConfirmingUpload, setIsConfirmingUpload] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastMessageDoc, setLastMessageDoc] = useState(null);
  const [isForwardModalVisible, setIsForwardModalVisible] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [isForwarding, setIsForwarding] = useState(false);
  
  const unsubRef = useRef(null);
  const lastMessageId = useRef(null);
  const messagesRef = useRef([]);
  const subscriptionSetUpRef = useRef(false);
  const soundRef = useRef(null);
  const hasMarkedAsReadRef = useRef(false);
  const isLoadingOlderMessagesRef = useRef(false);
  const messageListRef = useRef(null);

  // Computed values
  const chatFromNavigation = route?.params?.chat || navigation?.state?.params?.chat;
  const currentChat = chatFromNavigation || chat;
  const currentUser = useMemo(() => members.find((m) => m.isCurrentUser), [members]);
  const other = useMemo(() => members.find((m) => !m.isCurrentUser), [members]);




  // Callbacks
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMore || !lastMessageDoc) return;
    
    try {
      setIsLoadingMore(true);
      isLoadingOlderMessagesRef.current = true;
      const result = await HybridChatService.getMessagesWithPagination(
        rootId,
        currentChat.id,
        15, // Reduced from 20 to 15 for load more
        lastMessageDoc
      );

      if (result.messages.length > 0) {
        setMessages((prevMessages) => {
          const existingIds = new Set(prevMessages.map((m) => m.id));
          const newOlderMessages = result.messages.filter(
            (m) => !existingIds.has(m.id)
          );
          if (newOlderMessages.length > 0) {
            const updatedMessages = [...newOlderMessages, ...prevMessages];
            messagesRef.current = updatedMessages;
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
      setTimeout(() => {
        isLoadingOlderMessagesRef.current = false;
      }, 2000);
    }
  }, [hasMoreMessages, isLoadingMore, lastMessageDoc, rootId, currentChat.id]);

  const handleReact = useCallback(async (messageId, emoji) => {
    if (!currentUser || !currentChat?.id) {
      return;
    }
    
    const userData = {
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      avatar: currentUser.avatar,
      name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
    };

    try {
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

  const handleEdit = useCallback((message) => {
    setEditingMessage(message);
    setInput(message.text || "");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setInput("");
  }, []);



  const handleDelete = useCallback(async (messageId, fileName) => {
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
              // Optimistically remove message from local state
              setMessages(prevMessages => {
                const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
                messagesRef.current = updatedMessages;
                return updatedMessages;
              });

              // Delete from Firestore
              await HybridChatService.deleteMessage(rootId, currentChat.id, messageId);
              
              // Delete file if it exists
              if (fileName) {
                await chatService.deleteDocument({ fileName });
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete message. Please try again.");
              
              // Revert optimistic update on error
              // The real-time listener will restore the correct state
            }
          },
        },
      ]
    );
  }, [rootId, currentChat?.id]);

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

  // Sound effects
  async function playSendSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(sendSound);
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      // Silent error handling
    }
  }

  async function playReceiveSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(receiveSound);
      await sound.playAsync();
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      // Silent error handling
    }
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!currentUser) {
      Alert.alert("Error", "Unable to identify current user. Please try refreshing the chat.");
      return;
    }

    setMessageLoading(true);
    setUploadProgress(0);

    try {
      const senderName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

      if (editingMessage) {
        // Optimistically update the message in local state
        setMessages(prevMessages => {
          const updatedMessages = prevMessages.map(msg =>
            msg.id === editingMessage.id
              ? {
                  ...msg,
                  text: input.trim(),
                  editedAt: new Date().toISOString(),
                  isEdited: true,
                }
              : msg
          );
          messagesRef.current = updatedMessages;
          return updatedMessages;
        });

        try {
          // Update in Firestore
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
        } catch (error) {
          Alert.alert("Error", "Failed to update message. Please try again.");
          // The real-time listener will restore the correct state
        }

        setEditingMessage(null);
        setInput("");
        setMessageLoading(false);
        return;
      }

      let messageType = "text";
      if (selectedFile) {
        if (selectedFile.type.includes("image")) {
          messageType = "image";
        } else if (selectedFile.type.includes("video")) {
          messageType = "video";
        } else {
          messageType = "document";
        }
      }

      let messageText = input;
      if (selectedFile && messageType !== "text") {
        messageText = input.trim() || selectedFile.name;
      }

      let messageData = {
        text: messageText,
        type: messageType,
        senderId: currentUser.id,
        senderName: senderName,
        avatar: currentUser.avatar || null,
        status: "sent",
        timestamp: new Date().toISOString(),
      };

      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.senderName,
          type: replyingTo.type || "text",
        };
      }

      if (selectedFile) {
        setUploadProgress(75);
        messageData.fileData = {
          url: selectedFile.url,
          fileName: selectedFile.name,
          fileType: selectedFile.type || 'application/octet-stream',
          uploadId: selectedFile.uploadId,
        };
      }

      const sentMessage = await HybridChatService.sendMessage(
        rootId,
        currentChat.id,
        messageData
      );

      if (sentMessage) {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, sentMessage];
          messagesRef.current = updatedMessages;
          return updatedMessages;
        });
         // Update last message ID ref
         lastMessageId.current = sentMessage.id;
      }

      // Clear loading state immediately after successful send
      setMessageLoading(false);
      setInput("");
      setSelectedFile(null);
      setUploadProgress(0);
      setReplyingTo(null);

      // Play send sound
      playSendSound();

      if (otherUserStatus && otherUserStatus.isActive === false) {
        await sendChatNotification(
          other.id,
          currentUser.firstName,
          selectedFile ? `Sent ${selectedFile.name}` : input.trim(),
          null,
          currentChat.type,
          currentChat.id
        );
      }
    } catch (error) {
      Alert.alert("Error", `Failed to send message: ${error.message || "Unknown error"}`);
      setSelectedFile(null);
      setUploadProgress(0);
      setMessageLoading(false); // Clear loading state on error too
    }
  };

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
  };

  const handleDeleteChat = async () => {
    try {
      const result = await HybridChatService.deleteChat(
        rootId, 
        currentChat.id, 
        userId, 
        false, 
        false, 
        'single'
      );
      
      if (result.success) {
        // Cleanup listeners before navigating away
        if (unsubRef.current) {
          unsubRef.current();
        }
        
        // Navigate back to chat list
        navigation.goBack();
        
        Alert.alert("Success", "Chat has been deleted successfully.");
      } else {
        Alert.alert("Error", result.error || "Failed to delete chat. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while deleting the chat. Please try again.");
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
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

        if (!chatData.members || chatData.members.length === 0) {
          setLoading(false);
          return;
        }

        const memberPromises = chatData.members.map(async (member) => {
          const isCurrentUser = member.userId === userId || member.id === userId;
          
          if (member.firstName && member.lastName) {
            return { ...member, isCurrentUser };
          }

          const userData = await fetchUserData(rootId, member.userId);
          if (userData) {
            return { ...member, ...userData, isCurrentUser };
          }

          return {
            ...member,
            firstName: "Unknown",
            lastName: "User",
            email: "",
            avatar: null,
            isCurrentUser,
          };
        });

        const resolvedMembers = await Promise.all(memberPromises);
        setMembers(resolvedMembers);
        
        const otherUser = resolvedMembers.find((m) => !m.isCurrentUser);
        if (otherUser) {
          setOtherUserStatus(otherUser);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (currentChat && currentChat.id) {
      fetchMembers();
    }
  }, [currentChat, userId, rootId]);

  // Subscribe to real-time status updates for the other user
  useEffect(() => {
    const otherUserId = otherUserStatus?.userId || otherUserStatus?.id;
    if (!otherUserId || !otherUserStatus || !rootId) return;

    // Ensure the other user is being tracked by centralized service
    centralizedUserStatusService.addUserToListening(rootId, otherUserId);

    const unsubscribe = centralizedUserStatusService.subscribe((statuses) => {
      const updatedStatus = statuses[otherUserId];
      if (updatedStatus) {
        setOtherUserStatus(prev => ({
          ...prev,
          isActive: updatedStatus.isActive,
          lastSeen: updatedStatus.lastSeen,
          updatedAt: updatedStatus.updatedAt
        }));
      }
    });

    return unsubscribe;
  }, [otherUserStatus?.userId, otherUserStatus?.id, rootId]);

  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const result = await HybridChatService.getMessagesWithPagination(
          rootId,
          currentChat.id,
          15
        );

        setMessages(result.messages);
        setLastMessageDoc(result.lastDoc);
        setHasMoreMessages(result.hasMore);
        messagesRef.current = result.messages;

        if (result.messages.length === 15 && !result.hasMore) {
          setHasMoreMessages(true);
        }
      } catch (error) {
        // Error loading initial messages
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };

    if (currentChat?.id && userId) {
      loadInitialMessages();
    }
  }, [currentChat, userId, rootId]);

  useEffect(() => {
    const markChatAsRead = async () => {
      if (currentChat?.id && userId && rootId && !isInitialLoading && !hasMarkedAsReadRef.current) {
        try {
          await UnreadMessageService.markChatAsRead(rootId, currentChat.id, userId);
          dispatch(updateUnreadCount(currentChat.id, 0));
          hasMarkedAsReadRef.current = true;
        } catch (error) {
        }
      }
    };

    markChatAsRead();
  }, [currentChat?.id, userId, rootId, isInitialLoading, dispatch]);

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

  // 🚀 Hybrid approach: Real-time listeners
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

    const unsubscribeNewMessages = onSnapshot(newMessagesQuery, (snapshot) => {
      if (snapshot.empty) {
        return;
      }

      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });

      if (newMessages.length > 0) {
        
        // Merge new messages with existing ones
        setMessages(prevMessages => {
          const currentMessages = messagesRef.current || prevMessages;
          const messageMap = new Map(currentMessages.map(m => [m.id, m]));
          
          // Add new messages from real-time listener
          newMessages.forEach(msg => {
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
        const lastNewMessage = newMessages[newMessages.length - 1];
        if (lastNewMessage && lastNewMessage.senderId === userId) {
          lastMessageId.current = lastNewMessage.id;
        } else if (lastNewMessage && lastNewMessage.senderId !== userId) {
          // Play receive sound for messages from other users
          playReceiveSound();
          
          // Mark chat as read in real-time when new messages arrive (user is actively viewing)
          // This prevents unread badges from appearing in ChatRoomList while user is in chat
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
      'single', 
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




  // Memoized props
  const messageListProps = useMemo(() => ({
    messages,
    currentUserId: currentUser?.id,
    showAvatars: true,
    isGroup: false,
    onReact: handleReact,
    onReply: handleReply,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onForward: handleForwardRequest,
    onLoadMore: loadMoreMessages,
    hasMore: hasMoreMessages,
    isLoadingMore,
    style: { flex: 1 }
  }), [
    messages,
    currentUser?.id,
    handleReact,
    handleReply,
    handleEdit,
    handleDelete,
    handleForwardRequest,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,

  ]);

  // Conditional rendering - AFTER all hooks
  if (loading) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
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

  return (
    <>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : insets.bottom}
    >
      <ChatMessageHeader
        title={
          otherUserStatus?.firstName + " " + otherUserStatus?.lastName ||
          "Unknown User"
        }
        subtitle={otherUserStatus?.isActive ? "Active now" : "Offline"}
        avatar={otherUserStatus?.avatar}
        onBack={() => navigation.goBack()}
        onHeaderPress={() => {
          if (otherUserStatus) {
            setShowUserInfoModal(true);
          } else {
            Alert.alert('User Info', 'User information is not available yet. Please try again in a moment.');
          }
        }}
        userData={otherUserStatus}
        onDeleteChat={handleDeleteChat}
      />

      {isInitialLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#64748b" }}>
            Loading messages...
          </Text>
        </View>
      ) : (
        <MessageList ref={messageListRef} {...messageListProps} />
      )}

      {selectedFile && (
        <FilePreview
          fileData={selectedFile}
          onRemove={handleRemoveFile}
        />
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
      />

      {showUserInfoModal && (
        <UserInfoModal
          visible={showUserInfoModal}
          onClose={() => setShowUserInfoModal(false)}
          userData={otherUserStatus}
          isGroupChat={false}
        />
      )}
    </KeyboardAvoidingView>

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
    </>
  );
}