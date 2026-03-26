import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SingleChat from "./SingleChat";
import GroupChat from "./GroupChat";
import ChatWrapper from "./ChatWrapper";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { useSelector } from "react-redux";

import NavigationService from "../../../navigator/navigationService";

export default function ChatMessages({ navigation, route }) {
  const chat = route?.params?.chat || navigation?.state?.params?.chat;
  const [completeChat, setCompleteChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const rootId = useSelector((state) => state.userDataRole.rootId);

  // Helper function to navigate back to ChatRoomList
  const goBackToChatList = () => {
    NavigationService.navigate('ChatRoomList');
  };

  // All hooks must be called before any early returns
  // Detect if this is a minimal chat object (from push notifications)
  const isMinimalChat = chat && !chat.members && !chat.memberIds && !chat.name;

  // Fetch complete chat data if we have a minimal chat object
  useEffect(() => {
    if (isMinimalChat && chat?.id && rootId) {
      const fetchCompleteChat = async () => {
        setLoading(true);
        try {
          const chatRef = doc(db, "companies", rootId, "chats", chat.id);
          const chatSnap = await getDoc(chatRef);
          
          if (chatSnap.exists()) {
            const completeChatData = { id: chat.id, ...chatSnap.data() };
            setCompleteChat(completeChatData);
          } else {
            // Chat doesn't exist in Firestore, use the minimal data
            setCompleteChat(chat);
          }
        } catch (error) {
          // Error fetching chat, use the minimal data
          setCompleteChat(chat);
        } finally {
          setLoading(false);
        }
      };

      fetchCompleteChat();
    } else if (chat) {
      // We already have complete chat data
      setCompleteChat(chat);
    }
  }, [isMinimalChat, chat?.id, rootId]);

  // Now handle early returns after all hooks
  if (!chat) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No chat data provided.</Text>
        <Text style={styles.subText}>Please go back and try again.</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={goBackToChatList}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.goBackButtonText}>Go Back to Chats</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // More robust validation - check for essential properties
  if (!chat.id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Unable to open chat.</Text>
        <Text style={styles.subText}>Please go back and try again.</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={goBackToChatList}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.goBackButtonText}>Go Back to Chats</Text>
        </TouchableOpacity>
      </View>
    );
  }


  // Show loading state while fetching complete chat data
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.subText}>Loading chat...</Text>
      </View>
    );
  }

  // Use complete chat data if available, otherwise use original chat
  const chatToUse = completeChat || chat;

  // If type is missing, try to determine it from the chat data
  let chatType = chatToUse.type;
  if (!chatType) {
    // If no type specified, try to determine from members array
    if (chatToUse.members && Array.isArray(chatToUse.members)) {
      chatType = chatToUse.members.length > 2 ? 'group' : 'single';
    } else {
      // Default to single chat if we can't determine
      chatType = 'single';
    }
  }

  // Create a normalized chat object with required properties
  const normalizedChat = {
    id: chatToUse.id,
    type: chatType,
    name: chatToUse.name || null,
    members: chatToUse.members || [],
    memberIds: chatToUse.memberIds || [],
    createdAt: chatToUse.createdAt || new Date().toISOString(),
    lastMessage: chatToUse.lastMessage || null,
    createdBy: chatToUse.createdBy || null,
    // For minimal chat objects (from push notifications), mark as incomplete
    isIncomplete: isMinimalChat,
    ...chatToUse // Include any other properties
  };
  
  if (normalizedChat.type === "single") {
    return (
      <ChatWrapper>
        <SingleChat chat={normalizedChat} navigation={navigation} />
      </ChatWrapper>
    );
  } else if (normalizedChat.type === "group") {
    return (
      <ChatWrapper>
        <GroupChat chat={normalizedChat} navigation={navigation} />
      </ChatWrapper>
    );
  } else {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Unable to open this chat.</Text>
        <Text style={styles.subText}>Please go back and try again.</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={goBackToChatList}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.goBackButtonText}>Go Back to Chats</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#22223b",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
  },
  memberBox: {
    alignItems: "center",
    marginRight: 18,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    minWidth: 90,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  memberName: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#22223b",
  },
  memberEmail: {
    color: "#64748b",
    fontSize: 11,
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1976d2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  goBackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
