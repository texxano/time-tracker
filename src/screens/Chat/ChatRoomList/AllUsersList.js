import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import navigationService from "../../../navigator/navigationService";
import http from "../../../services/http";
import HybridChatService from "../../../services/Chat/hybridChatService";

/**
 * AllUsersList Component
 * 
 * Displays all company users without existing single chats and auto-creates chats when clicked.
 * This implements the requirement: "single chat rooms should be created when user opens the chat."
 */
const AllUsersList = React.memo(function AllUsersList({ 
  groups = [], 
  userStatuses = {}, 
  search = "",
  onChatCreated,
  onUpdateUnreadCount,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingChatFor, setCreatingChatFor] = useState(null);

  const userData = useSelector((state) => state.userData);
  const rootId = useSelector((state) => state.userDataRole.rootId);

  // Memoize chat IDs to prevent unnecessary re-fetches
  const singleChatUserIds = React.useMemo(() => {
    const ids = new Set();
    groups.filter(chat => chat.type === 'single').forEach(chat => {
      chat.members?.forEach(member => {
        const userId = member.userId || member.id;
        if (userId && userId !== userData.id) {
          ids.add(userId);
        }
      });
    });
    return ids;
  }, [groups.length, userData?.id]); // Only re-calculate when number of chats changes

  // Fetch users without chat rooms
  const fetchUsers = useCallback(async (searchQuery = "") => {
    if (!rootId || !userData?.id) return;

    try {
      setLoading(true);
      
      // Build query parameters
      const params = [];
      params.push("PageSize=50"); // Load 50 users
      
      if (searchQuery) {
        params.push(`Search=${encodeURIComponent(searchQuery)}`);
      }

      const queryString = params.length > 0 ? `?${params.join("&")}` : "";
      const response = await http.get(`/chats/users${queryString}`);

      if (response && response.list) {
        // Filter out current user and users who already have chat rooms
        const filtered = response.list.filter(
          (u) => u.id !== userData.id && 
                 u.email !== userData.email &&
                 !singleChatUserIds.has(u.id)
        );
        setUsers(filtered);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [rootId, userData?.id, userData?.email, singleChatUserIds]);

  // Fetch users when search changes (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(search);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounce);
  }, [search, fetchUsers]);

  /**
   * Handle user click - auto-create chat and navigate
   * This is the core implementation of the requirement
   */
  const handleUserClick = async (selectedUser) => {
    if (creatingChatFor === selectedUser.id) return; // Prevent double-click

    // Check if userData exists before proceeding
    if (!userData || !userData.id) {
      Alert.alert("Error", "User data not available. Please try again.");
      return;
    }

    try {
      setCreatingChatFor(selectedUser.id);

      // Prepare user data for chat creation
      const currentUser = {
        id: userData.id,
        firstName: userData.firstName || userData.first_name,
        lastName: userData.lastName || userData.last_name,
        email: userData.email,
        avatar: userData.avatar || null,
      };

      const otherUser = {
        id: selectedUser.id,
        firstName: selectedUser.firstName || selectedUser.first_name,
        lastName: selectedUser.lastName || selectedUser.last_name,
        email: selectedUser.email,
        avatar: selectedUser.avatar || null,
      };

      // Get or create chat (idempotent - safe to call every time)
      const result = await HybridChatService.getOrCreateSingleChat(
        rootId,
        currentUser,
        otherUser
      );

      if (result.success) {
        // Notify parent component that chat was created/accessed
        if (onChatCreated) {
          onChatCreated(result.chat);
        }

        // Update unread counts if callback provided
        if (onUpdateUnreadCount) {
          await onUpdateUnreadCount([...groups, result.chat]);
        }
        
        // Navigate to chat
        navigationService.navigate("ChatMessages", {
          chat: { ...result.chat, unreadCount: 0 },
        });
      } else {
        Alert.alert("Error", result.error || "Failed to create chat");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create chat. Please try again.");
    } finally {
      setCreatingChatFor(null);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    const firstName = user.firstName || user.first_name || "";
    const lastName = user.lastName || user.last_name || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    return user.email ? user.email.charAt(0).toUpperCase() : "?";
  };

  // Get user display name
  const getUserDisplayName = (user) => {
    const firstName = user.firstName || user.first_name;
    const lastName = user.lastName || user.last_name;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    return user.email || "Unknown User";
  };

  // Check if user is online
  const isUserOnline = (user) => {
    return userStatuses[user.id]?.isActive || false;
  };

  // Render loading state
  if (loading && users.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#1976d2" />
        <Text style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
          Loading users...
        </Text>
      </View>
    );
  }

  // Render empty state
  if (!loading && users.length === 0) {
    return null; // Don't show anything if no users
  }

  // Render user list
  return (
    <>
      {users.map((user) => {
        const isCreating = creatingChatFor === user.id;
        const isOnline = isUserOnline(user);
        const displayName = getUserDisplayName(user);
        const initials = getUserInitials(user);

        return (
          <TouchableOpacity
            key={user.id}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 0.5,
              borderBottomColor: "#f0f0f0",
              backgroundColor: "#fff",
              opacity: isCreating ? 0.6 : 1,
            }}
            onPress={() => !isCreating && handleUserClick(user)}
            disabled={isCreating}
          >
            {/* Avatar */}
            <View style={{ marginRight: 12, position: "relative" }}>
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: "#10b981",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    {initials}
                  </Text>
                </View>
              )}
              {/* Online indicator */}
              {isOnline && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#22c55e",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
              )}
            </View>

            {/* User Info */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  color: "#222",
                }}
              >
                {displayName}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#888",
                  marginTop: 2,
                }}
              >
                {user.email}
              </Text>
            </View>

            {/* Loading indicator only */}
            <View style={{ alignItems: "center", minWidth: 30 }}>
              {isCreating && <ActivityIndicator size="small" color="#1976d2" />}
            </View>
          </TouchableOpacity>
        );
      })}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if these specific props change
  return (
    prevProps.groups.length === nextProps.groups.length &&
    prevProps.search === nextProps.search &&
    prevProps.onChatCreated === nextProps.onChatCreated &&
    prevProps.onUpdateUnreadCount === nextProps.onUpdateUnreadCount
  );
  // Note: We intentionally skip userStatuses comparison to prevent re-renders on status changes
});

export default AllUsersList;

