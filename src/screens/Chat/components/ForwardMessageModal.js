import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import HybridChatService from "../../../services/Chat/hybridChatService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../utils/firebase";

const getDisplayName = (chat, currentUserId, currentUserEmail, userStatuses = {}) => {
  if (!chat) {
    return "Unknown chat";
  }

  if (chat.type === "group") {
    return (
      chat.name ||
      chat.displayName ||
      chat.groupName ||
      chat.chatName ||
      "Group chat"
    );
  }

  if (Array.isArray(chat.members)) {
    const otherMember = chat.members.find((member) => {
      if (member && typeof member === "object") {
        const memberId = member.userId || member.id;
        const memberEmail = member.email;
        if (memberId && memberId !== currentUserId) {
          return true;
        }
        if (memberEmail && memberEmail !== currentUserEmail) {
          return true;
        }
      } else if (
        typeof member === "string" &&
        member !== currentUserId &&
        member !== currentUserEmail
      ) {
        return true;
      }
      return false;
    });

    if (otherMember && typeof otherMember === "object") {
      const memberId = otherMember.userId || otherMember.id;
      const userStatus = memberId ? userStatuses[memberId] : null;
      
      // Use userStatus data if available
      const firstName =
        userStatus?.firstName ||
        userStatus?.first_name ||
        otherMember.firstName ||
        otherMember.first_name ||
        otherMember.first ||
        "";
      const lastName =
        userStatus?.lastName ||
        userStatus?.last_name ||
        otherMember.lastName ||
        otherMember.last_name ||
        otherMember.last ||
        "";
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName.length > 0) {
        return fullName;
      }

      if (otherMember.displayName) {
        return otherMember.displayName;
      }
      if (otherMember.email) {
        return otherMember.email;
      }
    }
  }

  return (
    chat.displayName ||
    chat.name ||
    chat.chatName ||
    chat.otherUserName ||
    chat.lastMessage?.senderName ||
    "Unknown chat"
  );
};

const getChatSubtitle = (chat) => {
  if (chat?.type === "group") {
    const count = Array.isArray(chat.members) ? chat.members.length : 0;
    return count > 0 ? `${count} members` : "Group chat";
  }
  return chat?.lastMessage?.senderName || "";
};

const detectAttachmentType = (message) => {
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

const getMessagePreview = (message, translations) => {
  if (!message) {
    return {
      label: translations.attachment,
      icon: "share-outline",
      title: translations.attachment,
    };
  }

  const fileName =
    message?.fileData?.fileName ||
    message?.fileData?.name ||
    message?.text ||
    translations.attachment;

  const attachmentType = detectAttachmentType(message);

  if (attachmentType === "image") {
    return { 
      label: fileName, 
      icon: "image-outline", 
      title: translations.image
    };
  }

  if (attachmentType === "video") {
    return {
      label: fileName,
      icon: "videocam-outline",
      title: translations.video,
    };
  }

  return {
    label: fileName,
    icon: "document-text-outline",
    title: translations.document,
  };
};

const ForwardMessageModal = ({
  visible,
  onClose,
  message,
  rootId,
  userId,
  userEmail,
  excludeChatId = null,
  onForward,
  isForwarding = false,
  translations = {
    title: "Forward",
    image: "Forward image",
    video: "Forward video",
    document: "Forward document",
    attachment: "Forward attachment",
    send: "Send",
    sent: "Sent",
    cancel: "Cancel",
    search: "Search chats",
    noChats: "No other chats available.",
    noResults: "No chats found for your search.",
    error: "Failed to load chats. Please try again.",
    retry: "Try again",
    single: "Single",
    groups: "Groups",
  },
}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingChatId, setPendingChatId] = useState(null);
  const [userStatuses, setUserStatuses] = useState({});
  const [sentChatIds, setSentChatIds] = useState(new Set());

  const preview = useMemo(() => getMessagePreview(message, translations), [message, translations]);

  const fetchChats = useCallback(async () => {
    if (!visible || !rootId || !userId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await HybridChatService.getChatList(
        rootId,
        userId,
        userEmail
      );

      if (Array.isArray(result?.chats)) {
        const filtered = excludeChatId
          ? result.chats.filter((chat) => chat?.id !== excludeChatId)
          : result.chats;
        setChats(filtered);

        // Fetch user data for all members in the chats
        const allUserIds = new Set();
        filtered.forEach((chat) => {
          chat.members?.forEach((member) => {
            const memberId = member.userId || member.id;
            if (memberId && memberId !== userId) {
              allUserIds.add(memberId);
            }
          });
        });

        // Fetch user details for each unique user ID
        const userDataPromises = Array.from(allUserIds).map(async (memberId) => {
          try {
            const userRef = doc(db, "companies", rootId, "users", memberId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return { id: memberId, data: userSnap.data() };
            }
          } catch (error) {
            // Error fetching user data
          }
          return null;
        });

        const userDataResults = await Promise.all(userDataPromises);
        const newUserStatuses = {};
        userDataResults.forEach((result) => {
          if (result) {
            newUserStatuses[result.id] = result.data;
          }
        });

        setUserStatuses(newUserStatuses);
      } else {
        setChats([]);
      }
    } catch (fetchError) {
      setChats([]);
      setError("Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [visible, rootId, userId, userEmail, excludeChatId]);

  useEffect(() => {
    if (visible) {
      fetchChats();
      setSentChatIds(new Set()); // Reset sent chats when modal opens
    } else {
      setSearchQuery("");
      setChats([]);
      setError(null);
      setPendingChatId(null);
      setSentChatIds(new Set());
    }
  }, [visible, fetchChats]);

  useEffect(() => {
    if (!isForwarding) {
      setPendingChatId(null);
    }
  }, [isForwarding]);

  const { singleChats, groupChats } = useMemo(() => {
    let filtered = chats;

    if (searchQuery.trim()) {
      const term = searchQuery.trim().toLowerCase();

      filtered = chats
        .filter(Boolean)
        .filter((chat) => {
          const name = getDisplayName(chat, userId, userEmail, userStatuses).toLowerCase();
          if (name.includes(term)) {
            return true;
          }

          if (Array.isArray(chat.members)) {
            return chat.members.some((member) => {
              if (member && typeof member === "object") {
                const memberId = member.userId || member.id;
                const userStatus = memberId ? userStatuses[memberId] : null;
                
                const firstName =
                  userStatus?.firstName || userStatus?.first_name ||
                  member.firstName || member.first_name || member.first || "";
                const lastName =
                  userStatus?.lastName || userStatus?.last_name ||
                  member.lastName || member.last_name || member.last || "";
                const displayName = member.displayName || "";
                const email = member.email || "";

                const combined = `${firstName} ${lastName} ${displayName} ${email}`.toLowerCase();
                return combined.includes(term);
              }
              if (typeof member === "string") {
                return member.toLowerCase().includes(term);
              }
              return false;
            });
          }

          return false;
        });
    }

    // Separate singles and groups
    const singles = [];
    const groups = [];

    filtered.forEach((chat) => {
      const isGroup = chat.type === "group" || (chat.members && chat.members.length > 2);
      if (isGroup) {
        groups.push(chat);
      } else {
        singles.push(chat);
      }
    });

    // Sort each group alphabetically
    singles.sort((a, b) => {
      const aName = getDisplayName(a, userId, userEmail, userStatuses);
      const bName = getDisplayName(b, userId, userEmail, userStatuses);
      return aName.localeCompare(bName);
    });

    groups.sort((a, b) => {
      const aName = getDisplayName(a, userId, userEmail, userStatuses);
      const bName = getDisplayName(b, userId, userEmail, userStatuses);
      return aName.localeCompare(bName);
    });

    return { singleChats: singles, groupChats: groups };
  }, [chats, searchQuery, userId, userEmail, userStatuses]);

  const handleSendToChat = useCallback(
    async (chat) => {
      if (!onForward || !chat || isForwarding) {
        return;
      }

      // Don't send again if already sent to this chat
      if (sentChatIds.has(chat.id)) {
        return;
      }

      setPendingChatId(chat.id);
      try {
        await onForward(chat);
        // Mark this chat as sent
        setSentChatIds((prev) => new Set([...prev, chat.id]));
      } catch (error) {
        // Error forwarding message
      } finally {
        setPendingChatId(null);
      }
    },
    [onForward, isForwarding, sentChatIds]
  );

  const renderChatItem = ({ item }) => {
    const isPending = pendingChatId === item.id && isForwarding;
    const isSent = sentChatIds.has(item.id);
    const isSingle = item.type !== "group";
    
    // Get other user for single chats
    const otherUser = isSingle
      ? item.members?.find(
          (m) =>
            (m.userId && m.userId !== userId) ||
            (m.email && m.email !== userEmail)
        )
      : null;
    
    // Get user status data if available
    const otherUserId = otherUser?.userId || otherUser?.id;
    const userStatus = otherUserId ? userStatuses[otherUserId] : null;
    
    // Get display name and initials
    const displayName = getDisplayName(item, userId, userEmail, userStatuses);
    
    const initials = isSingle && otherUser
      ? (() => {
          // Use userStatus data if available, otherwise fall back to otherUser
          const firstName = userStatus?.firstName || userStatus?.first_name || 
                           otherUser.firstName || otherUser.first_name || "";
          const lastName = userStatus?.lastName || userStatus?.last_name || 
                          otherUser.lastName || otherUser.last_name || "";
          const firstInitial = firstName.charAt(0) || "";
          const lastInitial = lastName.charAt(0) || "";
          return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
        })()
      : displayName.substring(0, 2).toUpperCase();
    
    // Get avatar from userStatus if available
    const avatar = isSingle && otherUserId
      ? (userStatus?.avatar || otherUser?.avatar)
      : item.avatar;
    
    return (
      <TouchableOpacity
        onPress={() => handleSendToChat(item)}
        disabled={isForwarding || isSent}
        style={[styles.chatRow, isSent && styles.chatRowSent]}
      >
        <View style={styles.chatAvatar}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: item.type === "group" ? "#7c3aed" : "#2563eb",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isSingle ? (
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                  {initials}
                </Text>
              ) : (
                <Ionicons name="people" size={20} color="#ffffff" />
              )}
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName} numberOfLines={1}>
            {displayName}
          </Text>
          {/* {getChatSubtitle(item)?.length > 0 && (
            <Text style={styles.chatSubtitle} numberOfLines={1}>
              {getChatSubtitle(item)}
            </Text>
          )} */}
        </View>
        <View style={styles.sendButton}>
          {isPending ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : isSent ? (
            <View style={[styles.sentButton]}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginRight: 4 }} />
              <Text style={styles.sentButtonText}>
                {translations.sent}
              </Text>
            </View>
          ) : (
            <Text style={styles.sendButtonText}>
              {translations.send}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 99999, elevation: 99999 }]}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Ionicons name="arrow-redo-outline" size={22} color="#2563eb" />
              <Text style={styles.headerText}>
                {translations.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={styles.hitSlop}>
              <Ionicons name="close" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            <View style={styles.previewIcon}>
              <Ionicons name={preview.icon} size={28} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>
                {preview.title || translations.attachment}
              </Text>
              <Text style={styles.previewSubtitle} numberOfLines={1}>
                {preview.label}
              </Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#475569" />
            <TextInput
              style={styles.searchInput}
              placeholder={translations.search}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            ) : error ? (
              <View style={styles.centerContent}>
                <Text style={styles.errorText}>
                  {translations.error}
                </Text>
                <TouchableOpacity
                  onPress={fetchChats}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>
                    {translations.retry}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : singleChats.length === 0 && groupChats.length === 0 ? (
              <View style={styles.centerContent}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? translations.noResults
                    : translations.noChats}
                </Text>
              </View>
            ) : (
              <FlatList
                data={[
                  ...(singleChats.length > 0 ? [{ type: 'header', title: translations.single }] : []),
                  ...singleChats,
                  ...(groupChats.length > 0 ? [{ type: 'header', title: translations.groups }] : []),
                  ...groupChats,
                ]}
                keyExtractor={(item, index) => item.id || `header-${item.title}-${index}`}
                renderItem={({ item }) => {
                  if (item.type === 'header') {
                    return (
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>{item.title}</Text>
                      </View>
                    );
                  }
                  return renderChatItem({ item });
                }}
                ItemSeparatorComponent={({ leadingItem }) => 
                  leadingItem?.type !== 'header' ? (
                    <View style={styles.separator} />
                  ) : null
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, isForwarding && styles.disabledButton]}
            onPress={onClose}
            disabled={isForwarding}
          >
            <Text style={styles.cancelButtonText}>
              {translations.cancel}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: "85%",
    minHeight: 300,
    width: "100%",
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  previewSubtitle: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#0f172a",
    fontSize: 15,
    paddingVertical: 0,
  },
  listContainer: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    maxHeight: 360,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    color: "#475569",
    fontSize: 14,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatRowSent: {
    opacity: 0.6,
  },
  chatAvatar: {
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  chatSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
  },
  sendButtonText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13,
  },
  sentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#d1fae5",
  },
  sentButtonText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 16,
  },
  sectionHeader: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cancelButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
});

export default ForwardMessageModal;


