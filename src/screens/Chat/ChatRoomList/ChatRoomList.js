import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppContainerClean from "../../../components/AppContainerClean";
import navigationService from "../../../navigator/navigationService";
import {
  doc,
  onSnapshot as onSnapshotDoc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  onSnapshot, 
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import UserListModal from "../UserListModal/UserListModal";
import GroupChatModal from "../UserListModal/GroupChatModal";
import ProfileImagePicker from "./ProfileImagePicker";
import AllUsersList from "./AllUsersList";



import colors from "../../../constants/Colors";
import HybridChatService from "../../../services/Chat/hybridChatService";
import { UnreadMessageService } from "../../../services/Chat/unreadMessageService";
import centralizedUserStatusService from "../../../services/Chat/centralizedUserStatusService";
import {
  AddProfileImage,
  clearChatState,
  updateUnreadCount,
  resetUnreadCount,
} from "../../../redux/actions/Chat/Chat.actions";

export default function ChatRoomList() {
  // Always initialize as arrays
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pagination, setpagination] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [chatFilter, setChatFilter] = useState("single"); // "single", "group", or "all"

  const [realTimeWorking, setRealTimeWorking] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Centralized user status tracking
  const [userStatuses, setUserStatuses] = useState({});

  

  const [showErrorModal, setShowErrorModal] = useState(false);
  const userData = useSelector((state) => state.userData);
  const chatState = useSelector((state) => state.chat);
  const loggedUserEmail = userData.email;
  const dispatch = useDispatch();
  const rootId = useSelector((state) => state.userDataRole.rootId);

  // 🚀 Memoize callback to prevent unnecessary re-renders
  const updateTotalUnreadCount = useCallback(async (chats) => {
    try {
      // Check if userData exists before proceeding
      if (!userData || !userData.id) {
        return 0;
      }

      // Calculate unread counts for all chats
      const chatsWithUnreadCounts =
        await UnreadMessageService.getUnreadCountsForAllChats(
          rootId,
          userData.id,
          chats
        );

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return 0;

      let totalUnreadCount = 0;

      chatsWithUnreadCounts.forEach((chat) => {
        if (chat.unreadCount && chat.unreadCount > 0) {
          totalUnreadCount += chat.unreadCount;
          dispatch(updateUnreadCount(chat.id, chat.unreadCount));
        }
      });

      // Update the groups state with new chat data from Firestore (including lastMessage)
      // and merge in unread counts without overwriting
      if (isMountedRef.current) {
        setGroups((prevGroups) => {
          // Map through new chats from Firestore
          return chatsWithUnreadCounts.map((newChat) => {
            // Find corresponding previous chat
            const prevChat = prevGroups.find(p => p.id === newChat.id);
            
            if (prevChat) {
              // Merge: preserve unreadCount from calculation, but get everything else from new Firestore data
              return {
                ...newChat, // This includes updated lastMessage, members, etc. from Firestore
                unreadCount: newChat.unreadCount // Use calculated unread count
              };
            }
            
            // New chat, use as-is
            return newChat;
          });
        });
      }

      return totalUnreadCount;
    } catch (error) {
      return 0;
    }
  }, [rootId, userData.id, dispatch]); // Dependencies for useCallback

  // Handle profile image selection
  const handleImageSelected = async (imageData) => {
    // Close image picker and dispatch action
    setShowImagePicker(false);
    // Dispatch the action - modal states are handled in useEffect based on Redux state
    dispatch(AddProfileImage(imageData));
  };

  // 🚀 Memoize callback to prevent unnecessary re-renders
  const handleChatCreated = useCallback(async (newChat) => {
    // Add the new chat to the current list
    setGroups((prevGroups) => {
      // Check if the chat already exists to avoid duplicates
      const exists = prevGroups.some((chat) => chat.id === newChat.id);
      if (!exists) {
        return [...prevGroups, newChat];
      }
      return prevGroups;
    });

    // Immediately fetch user data for new chat members to ensure it's available
    try {
      if (newChat.members && newChat.members.length > 0 && userData && userData.id) {
        for (const member of newChat.members) {
          const userId = member.userId || member.id;
          if (userId && userId !== userData.id) {
            const userRef = doc(db, "companies", rootId, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const memberUserData = userSnap.data();

              // Only update if we have valid data
              if (
                memberUserData.firstName ||
                memberUserData.first_name ||
                memberUserData.email
              ) {
                setUserStatuses((prev) => ({
                  ...prev,
                  [userId]: memberUserData,
                }));
              } else {
                // Only create user document if we have a valid email
                if (memberUserData.email && memberUserData.email.trim()) {
                  try {
                    const basicUserData = {
                      id: userId,
                      firstName: memberUserData.firstName || "Unknown",
                      lastName: memberUserData.lastName || "User",
                      email: memberUserData.email.trim(),
                      avatar: memberUserData.avatar || null,
                      isActive: memberUserData.isActive || false,
                      lastSeen: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                    };
                    await setDoc(userRef, basicUserData);

                    setUserStatuses((prev) => ({
                      ...prev,
                      [userId]: basicUserData,
                    }));
                  } catch (createError) {
                    // Error creating user document
                  }
                } else {
                  // Don't create incomplete user data - wait for proper data
                  // The ensureUserData function will handle fetching complete data
                  // User will show as "Unknown User" until complete data is available
                }
              }
            } else {
              // Only create user document if we have a valid email
              if (member.email && member.email.trim()) {
                try {
                  const basicUserData = {
                    id: userId,
                    firstName: member.firstName || "Unknown",
                    lastName: member.lastName || "User",
                    email: member.email.trim(),
                    avatar: member.avatar || null,
                    isActive: false,
                    lastSeen: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                  };
                  await setDoc(userRef, basicUserData);

                  setUserStatuses((prev) => ({
                    ...prev,
                    [userId]: basicUserData,
                  }));
                } catch (createError) {}
              } else {
                // Don't create placeholder data - user will show as "Unknown User"
                // Don't create placeholder data - user will show as "Unknown User"
              }
            }
          }
        }
      }
    } catch (error) {
      // Error fetching user data for new chat
    }
  }, [userData.id, rootId]); // Dependencies for useCallback

  // Function to manually fetch user data if it's missing
  const ensureUserData = async (userId) => {
    if (!userId) return;

    try {
      const userRef = doc(db, "companies", rootId, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();

        // Only update if we have valid data
        if (userData.firstName || userData.first_name || userData.email) {
          setUserStatuses((prev) => ({
            ...prev,
            [userId]: userData,
          }));
        }
      }
    } catch (error) {
      // Error in ensureUserData
      throw error;
    }
  };

  // Manual refresh function
  const refreshChats = async () => {
    try {
      // Check if userData exists before proceeding
      if (!userData || !userData.id) {
        if (isMountedRef.current) {
          setChatError("User data not available. Please try again.");
        }
        return [];
      }

      if (isMountedRef.current) {
        setLoadingChats(true);
        setChatError(null); // Clear any previous errors
      }

      const result = await HybridChatService.getChatList(
        rootId,
        userData.id,
        loggedUserEmail
      );

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return [];

      const userChats = result.chats || result; // Handle both new and old format



      // Update unread counts in Redux (this will also update groups state)
      await updateTotalUnreadCount(userChats);
      
      return userChats;
      // After refreshing chats, check for missing user documents and create them if needed
      try {
        const allMemberIds = new Set();
        userChats.forEach((chat) => {
          chat.members?.forEach((member) => {
            if (member.userId && member.userId !== userData.id) {
              allMemberIds.add(member.userId);
            } else if (member.id && member.id !== userData.id) {
              allMemberIds.add(member.id);
            }
          });
        });

        // Check each member and ensure they have user documents
        for (const memberId of allMemberIds) {
          if (!userStatuses[memberId]) {
            await ensureUserData(memberId);
          }
        }
      } catch (userCheckError) {
        // Error checking user documents after refresh
      }
    } catch (error) {
      if (isMountedRef.current) {
        setChatError(error.message || "Failed to load chats. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingChats(false);
        setIsInitialLoad(false);
      }
    }
  };

    // Safety timeout to prevent stuck loading state
    useEffect(() => {
      if (imageUploadLoading) {
        const timeout = setTimeout(() => {
          setImageUploadLoading(false);
        }, 10000); // 10 second timeout
        
        return () => clearTimeout(timeout);
      }
    }, [imageUploadLoading]);

  // Reset unread count when entering chat list (but don't mark all as read automatically)
  useEffect(() => {
    // Only reset Redux state, don't mark all chats as read
    dispatch(resetUnreadCount());
  }, []);

  // Note: User status tracking is now handled globally by NavigatorPrivateWithTracking


  // Note: Unread counts are recalculated when chats are loaded via refreshChats() and subscribeToChatList()
  // Removed this useEffect completely to prevent infinite loops
  // The updateTotalUnreadCount function is already called in:
  // 1. refreshChats() - line 265
  // 2. subscribeToChatList() - line 396
  // 3. Manual refresh button - line 607

  // Load chats on component mount
  useEffect(() => {
    refreshChats();
  }, [rootId, userData.id, loggedUserEmail]);

  // Handle image upload states
  useEffect(() => {
    if (chatState) {
      // Handle loading state
      if (chatState.request === "request") {
        setImageUploadLoading(true);
        setImageUploadError(null);
        setShowErrorModal(false);
      }

      // Handle data changes
      if (chatState.data) {
        if (chatState.data.userMessage || chatState.data.message) {
          // Only show modal for file size error
          const errorMessage =
            chatState.data.userMessage || chatState.data.message;
          const isFileSizeError =
            errorMessage.includes("exceeds the allowed size") ||
            errorMessage.includes("too large") ||
            errorMessage.includes("204.8 kB");

          if (isFileSizeError) {
            setImageUploadError(errorMessage);
            setImageUploadLoading(false);
            setShowErrorModal(true);
          } else {
            // For other errors, just log them but don't show modal
            // Other error (not showing modal)
            setImageUploadLoading(false);
          }
        } else if (chatState.data.logoUrl) {
          // Success - clear any previous errors and loading
          setImageUploadError(null);
          setImageUploadLoading(false);
          setShowErrorModal(false);
        }
      }
    }
  }, [chatState]);

  // Subscribe to real-time chat updates using hybrid service
  useEffect(() => {
    if (!userData.id || !loggedUserEmail) return;

    const unsubscribe = HybridChatService.subscribeToChatList(
      rootId,
      userData.id,
      loggedUserEmail,
      async (userChats) => {
        if (isMountedRef.current) {
          setRealTimeWorking(true);

          // Update unread counts in Redux (this will also update groups state)
          await updateTotalUnreadCount(userChats);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [rootId, userData.id, loggedUserEmail]);

  // Fallback: If real-time isn't working after 10 seconds, trigger manual refresh
  useEffect(() => {
    if (!userData.id || !loggedUserEmail) return;

    const timer = setTimeout(() => {
      // Only trigger fallback if real-time still hasn't worked after 10 seconds
      if (!realTimeWorking) {
        refreshChats();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [rootId, userData.id, loggedUserEmail, realTimeWorking]); // Removed groups.length to prevent infinite loops



   // Listen to user statuses in real-time (optimized - uses batch queries only)
  // 🚀 CENTRALIZED USER STATUS: Use single listener for all user statuses
  useEffect(() => {
    if (!userData?.id || !rootId || groups.length === 0) return;

    // 🚀 COST OPTIMIZATION: Only listen to 2 most recent chats (was 5)
    const maxChats = 2; // Reduced from 5 to 2 to cut listener costs by 60%
    
    // Sort chats by last message time and take only the most recent ones
    const recentChats = groups
      .slice()
      .sort((a, b) => {
        const timeA = a.lastMessage?.createdAt?.toDate?.() || new Date(a.lastMessage?.createdAt || 0);
        const timeB = b.lastMessage?.createdAt?.toDate?.() || new Date(b.lastMessage?.createdAt || 0);
        return timeB.getTime() - timeA.getTime();
      })
      .slice(0, maxChats);

    // Collect all unique user IDs from most recent chats only
    const allUserIds = new Set();
    recentChats.forEach((chat) => {
      chat.members?.forEach((member) => {
        // Skip the current user
        if (
          (member.userId && member.userId === userData.id) ||
          (member.email && member.email === loggedUserEmail)
        ) {
          return;
        }
        if (member.userId) allUserIds.add(member.userId);
        if (member.id) allUserIds.add(member.id);
      });
    });

    // Only update if user IDs actually changed
    const userIdsArray = Array.from(allUserIds).sort();
    centralizedUserStatusService.updateUserIds(rootId, userIdsArray);
  }, [groups.length, loggedUserEmail, userData?.id, rootId]); // Only runs when chat count changes

  // Subscribe to centralized user status updates
  useEffect(() => {
    const unsubscribe = centralizedUserStatusService.subscribe((statuses) => {
      if (!isMountedRef.current) return;
      setUserStatuses(statuses);
    });

    return unsubscribe;
  }, []);


  // Cleanup effect to set mounted flag to false
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🚀 Memoize filtered and sectioned data to prevent unnecessary re-renders
  // Only recalculate when groups, chatFilter, or search changes - NOT when userStatuses changes
  const sectionedData = useMemo(() => {
    let filteredGroups = groups;
    
    // Apply chat type filter (single/group/all)
    if (chatFilter === "single") {
      filteredGroups = filteredGroups.filter((group) => group.type === "single");
    } else if (chatFilter === "group") {
      filteredGroups = filteredGroups.filter((group) => group.type === "group");
    }
    
    // Apply search filter - search in chat names, user names, emails, and last messages
    if (search.length > 0) {
      const searchLower = search.toLowerCase();
      filteredGroups = filteredGroups.filter((group) => {
        // Search in group name
        if (group.name?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in chat ID
        if (group.id?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in last message
        if (group.lastMessage?.text?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // For single chats, search in the other user's details
        if (group.type === "single") {
          const otherMember = group.members?.find(
            (m) =>
              (m.userId && m.userId !== userData.id) ||
              (m.email && m.email !== loggedUserEmail)
          );
          
          if (otherMember) {
            // Use member data directly instead of userStatuses to avoid dependency
            const firstName = (otherMember.firstName || otherMember.first_name || '').toLowerCase();
            const lastName = (otherMember.lastName || otherMember.last_name || '').toLowerCase();
            const email = (otherMember.email || '').toLowerCase();
            
            if (firstName.includes(searchLower) || 
                lastName.includes(searchLower) || 
                email.includes(searchLower)) {
              return true;
            }
          }
        }
        
        return false;
      });
    }
    
    // Sort: single chats first, then by last message time
    filteredGroups = filteredGroups.slice().sort((a, b) => {
      // First, sort by type (single before group)
      if (a.type === "single" && b.type !== "single") return -1;
      if (a.type !== "single" && b.type === "single") return 1;
      
      // Then sort by last message time
      const timeA = a.lastMessage?.createdAt?.toDate?.() || new Date(a.lastMessage?.createdAt || 0);
      const timeB = b.lastMessage?.createdAt?.toDate?.() || new Date(b.lastMessage?.createdAt || 0);
      return timeB.getTime() - timeA.getTime();
    });
    
    // Create sectioned data for FlatList
    const result = [];
    
    // Add filtered chats
    if (filteredGroups.length > 0) {
      filteredGroups.forEach((item) =>
        result.push({ ...item, _type: "group" })
      );
    }
    
    return result;
  }, [groups, chatFilter, search, userData.id, loggedUserEmail]); // Note: userStatuses NOT included!


  try {
    return (
      <AppContainerClean
        location={"ChatRoomList"}
        pagination={pagination}
        searchChange={search.length > 3 && search.length < 128}
        notAuthorized={false}
        onAddChat={() => setShowUserModal(true)}
        onAddGroupChat={() => setShowGroupChatModal(true)}
        onAddImage={() => setShowImagePicker(true)}
      >
        <View style={{ flex: 1 }}>
          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                chatFilter === "single" && styles.filterButtonActive,
              ]}
              onPress={() => setChatFilter("single")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  chatFilter === "single" && styles.filterButtonTextActive,
                ]}
              >
                <FormattedMessage id="chat.filter.single" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                chatFilter === "group" && styles.filterButtonActive,
              ]}
              onPress={() => setChatFilter("group")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  chatFilter === "group" && styles.filterButtonTextActive,
                ]}
              >
                <FormattedMessage id="chat.filter.group" />
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar - Fixed at top */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#888"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search chat room"
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ flex: 1, fontSize: 16 }}
            />
          </View>

          {/* Content Container - Takes remaining space after search bar */}
          <View style={{ flex: 1, minHeight: 0 }}>
            {/* Loading State */}
            {loadingChats && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 20,
                }}
              >
                <ActivityIndicator size="large" color="#1976d2" />
                <Text
                  style={{
                    marginTop: 16,
                    color: "#666",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {isInitialLoad ? "Loading chats..." : "Updating..."}
                </Text>
              </View>
            )}

            {/* Error State */}
            {!loadingChats && chatError && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 32,
                }}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={64}
                  color="#ef4444"
                />
                <Text
                  style={{
                    marginTop: 16,
                    color: "#ef4444",
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Failed to load chats
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    color: "#666",
                    fontSize: 14,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {chatError}
                </Text>
                <TouchableOpacity
                  onPress={refreshChats}
                  style={{
                    marginTop: 16,
                    backgroundColor: "#1976d2",
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Try Again
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await updateTotalUnreadCount(groups);
                  }}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#4caf50",
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Refresh Unread Counts
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State - Only show if no chats AND (not on single filter OR on single filter with no users) */}
            {!loadingChats && !chatError && sectionedData.length === 0 && (
              <>
                {chatFilter === "single" ? (
                  // For single filter, show users even if no chats exist
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        paddingTop: 12,
                        paddingBottom: 8,
                        paddingHorizontal: 16,
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 12,
                          color: "#666",
                          letterSpacing: 0.5,
                        }}
                      >
                        <FormattedMessage id="start.new.chat" />
                      </Text>
                    </View>
                    <AllUsersList
                      groups={groups}
                      userStatuses={userStatuses}
                      search={search}
                      onChatCreated={handleChatCreated}
                      onUpdateUnreadCount={updateTotalUnreadCount}
                    />
                  </View>
                ) : (
                  // For other filters, show empty state
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                    <Text
                      style={{
                        marginTop: 16,
                        color: "#666",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      {search.length > 0
                        ? "No matching chats found"
                        : chatFilter === "group"
                        ? "No group chats created"
                        : "No chat rooms created"}
                    </Text>
                    <Text
                      style={{
                        marginTop: 8,
                        color: "#999",
                        fontSize: 14,
                        textAlign: "center",
                        paddingHorizontal: 32,
                      }}
                    >
                      {search.length > 0
                        ? "Try adjusting your search terms or start a new conversation"
                        : 'Start a conversation by tapping the "Add chat" button above'}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Chat List */}
            {!loadingChats && !chatError && sectionedData.length > 0 && (
              <FlatList
                data={sectionedData}
                keyExtractor={(item, idx) =>
                  item._type + "-" + (item.id || item.label || idx)
                }
                style={{ flex: 1, minHeight: 0 }}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews={true} // Optimize memory and performance
                maxToRenderPerBatch={10} // Render fewer items per batch
                windowSize={10} // Reduce number of items kept in memory
                ListFooterComponent={
                  chatFilter === "single" ? (
                    <>
                      {/* Section Header */}
                      <View
                        style={{
                          paddingTop: 12,
                          paddingBottom: 8,
                          paddingHorizontal: 16,
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 12,
                            color: "#666",
                            letterSpacing: 0.5,
                          }}
                        >
                       <FormattedMessage id="start.new.chat" />
                        </Text>
                      </View>

                      {/* All Users List Component */}
                      <AllUsersList
                        groups={groups}
                        userStatuses={userStatuses}
                        search={search}
                        onChatCreated={handleChatCreated}
                        onUpdateUnreadCount={updateTotalUnreadCount}
                      />
                    </>
                  ) : null
                }
                renderItem={({ item }) => {
                  if (item._type === "group") {
                    // Get the other user for single chats, or use group name

                    const isSingle = item.type === "single";
                    // const currentUser = item.members?.find(
                    //   (m) => m.userId === userData.id || m.email === loggedUserEmail
                    // );
                    const otherUser = isSingle
                      ? item.members?.find(
                          (m) =>
                            (m.userId && m.userId !== userData.id) ||
                            (m.email && m.email !== loggedUserEmail)
                        )
                      : null;

                    const displayName = isSingle
                      ? (() => {
                          // Try to get the full name from the other user
                          if (otherUser) {
                            // If otherUser has userId, we need to get user data from userStatuses
                            if (otherUser.userId) {
                              const userStatus = userStatuses[otherUser.userId];

                              if (userStatus) {
                                const firstName =
                                  userStatus.firstName ||
                                  userStatus.first_name ||
                                  "";
                                const lastName =
                                  userStatus.lastName ||
                                  userStatus.last_name ||
                                  "";
                                const fullName =
                                  `${firstName} ${lastName}`.trim();

                                if (fullName) {
                                  return fullName;
                                }

                                // Fallback to email if no name
                                if (userStatus.email) {
                                  return userStatus.email;
                                }

                                // Try to refresh user data
                                ensureUserData(otherUser.userId);
                                return "";
                              } else {
                                // Try to get user data directly from Firestore as fallback
                                ensureUserData(otherUser.userId);
                                return "";
                              }

                            
                            }
                          }

                          return "Unknown User";
                        })()
                      : item.name || "Group Chat";

                    const avatar = isSingle
                      ? (() => {
                          if (otherUser) {
                            // If otherUser has userId, get avatar from userStatuses
                            if (otherUser.userId) {
                              const userStatus = userStatuses[otherUser.userId];
                              return userStatus?.avatar || null;
                            } else {
                              // Legacy structure - direct avatar
                              return otherUser.avatar || null;
                            }
                          }
                          return null;
                        })()
                      : item.avatar;
                    const initials = isSingle
                      ? (() => {
                          if (otherUser) {
                            // If otherUser has userId, get user data from userStatuses
                            if (otherUser.userId) {
                              const userStatus = userStatuses[otherUser.userId];
                              if (userStatus) {
                                const firstName =
                                  userStatus.firstName ||
                                  userStatus.first_name ||
                                  "";
                                const lastName =
                                  userStatus.lastName ||
                                  userStatus.last_name ||
                                  "";
                                const firstInitial = firstName.charAt(0) || "";
                                const lastInitial = lastName.charAt(0) || "";
                                return `${firstInitial}${lastInitial}`.toUpperCase();
                              }
                            } else {
                              // Legacy structure - direct user data
                              const firstName =
                                otherUser.firstName ||
                                otherUser.first_name ||
                                "";
                              const lastName =
                                otherUser.lastName || otherUser.last_name || "";
                              const firstInitial = firstName.charAt(0) || "";
                              const lastInitial = lastName.charAt(0) || "";
                              return `${firstInitial}${lastInitial}`.toUpperCase();
                            }
                          }
                          return "";
                        })()
                      : displayName.substring(0, 2).toUpperCase();

                    // Use item.lastMessage directly
                    const lastMessage = item.lastMessage;

                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderBottomWidth: 0.5,
                          borderBottomColor: "#f0f0f0",
                          backgroundColor: "#fff",
                        }}
                        onPress={async () => {
                          try {
                            // Opening chat

                            // Check if userData exists before proceeding
                            if (!userData || !userData.id) {
                              Alert.alert(
                                "Error",
                                "User data not available. Please try again."
                              );
                              return;
                            }

                            // Mark chat as read when opened
                            await UnreadMessageService.markChatAsRead(
                              rootId,
                              item.id,
                              userData.id
                            );

                            // Reset unread count for this chat when opened
                            if (item.unreadCount > 0) {
                              dispatch(updateUnreadCount(item.id, 0));

                              // Also update the local groups state immediately
                              setGroups((prevGroups) =>
                                prevGroups.map((chat) =>
                                  chat.id === item.id
                                    ? { ...chat, unreadCount: 0 }
                                    : chat
                                )
                              );
                            }

                            // Navigate to chat
                            navigationService.navigate("ChatMessages", {
                              chat: { ...item, unreadCount: 0 },
                            });
                          } catch (error) {
                            Alert.alert(
                              "Error",
                              "Unable to open chat. Please try again."
                            );
                          }
                        }}
                      >
                        {/* Avatar */}
                        <View style={{ marginRight: 12 }}>
                          {isSingle ? (
                            // Single chat - show single avatar
                            avatar ? (
                              <Image
                                source={{ uri: avatar }}
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
                                  backgroundColor: colors.gray_100,
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
                            )
                          ) : (
                            // Group chat - show two overlapping avatars
                            (() => {
                              // Get members with avatars from userStatuses
                              const membersWithAvatars =
                                item.members
                                  ?.map((member) => {
                                    if (member.userId) {
                                      const userStatus =
                                        userStatuses[member.userId];
                                      return {
                                        ...member,
                                        avatar: userStatus?.avatar || null,
                                      };
                                    } else {
                                      // Legacy structure - direct avatar
                                      return member;
                                    }
                                  })
                                  .filter((member) => member.avatar) || [];

                              const firstTwoMembers = membersWithAvatars.slice(
                                0,
                                2
                              );

                              return (
                                <View
                                  style={{
                                    position: "relative",
                                    width: 50,
                                    height: 50,
                                  }}
                                >
                                  {firstTwoMembers.length >= 2 ? (
                                    // Show two overlapping avatars
                                    <>
                                      {/* First avatar (background) */}
                                      <Image
                                        source={{
                                          uri: firstTwoMembers[0].avatar,
                                        }}
                                        style={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 20,
                                          position: "absolute",
                                          left: 0,
                                          top: 5,
                                          borderWidth: 2,
                                          borderColor: "#fff",
                                        }}
                                        resizeMode="cover"
                                      />
                                      {/* Second avatar (foreground) */}
                                      <Image
                                        source={{
                                          uri: firstTwoMembers[1].avatar,
                                        }}
                                        style={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 20,
                                          position: "absolute",
                                          right: 0,
                                          top: 5,
                                          borderWidth: 2,
                                          borderColor: "#fff",
                                        }}
                                        resizeMode="cover"
                                      />
                                    </>
                                  ) : firstTwoMembers.length === 1 ? (
                                    // Show single avatar with initials overlay
                                    <>
                                      <Image
                                        source={{
                                          uri: firstTwoMembers[0].avatar,
                                        }}
                                        style={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 20,
                                          position: "absolute",
                                          left: 0,
                                          top: 5,
                                          borderWidth: 2,
                                          borderColor: "#fff",
                                        }}
                                        resizeMode="cover"
                                      />
                                      <View
                                        style={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 20,
                                          backgroundColor: "#7c3aed",
                                          position: "absolute",
                                          right: 0,
                                          top: 5,
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
                                            fontSize: 14,
                                          }}
                                        >
                                          {displayName
                                            .substring(0, 1)
                                            .toUpperCase()}
                                        </Text>
                                      </View>
                                    </>
                                  ) : (
                                    // Show initials for both positions
                                    <>
                                      <View
                                        style={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 20,
                                          backgroundColor: "#7c3aed",
                                          position: "absolute",
                                          left: 0,
                                          top: 5,
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
                                            fontSize: 14,
                                          }}
                                        >
                                          {displayName
                                            .substring(0, 1)
                                            .toUpperCase()}
                                        </Text>
                                      </View>
                                      <View
                                        style={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 20,
                                          backgroundColor: "#9c27b0",
                                          position: "absolute",
                                          right: 0,
                                          top: 5,
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
                                            fontSize: 14,
                                          }}
                                        >
                                          {displayName
                                            .substring(1, 2)
                                            .toUpperCase() || "G"}
                                        </Text>
                                      </View>
                                    </>
                                  )}
                                </View>
                              );
                            })()
                          )}
                        </View>

                        {/* Chat Info */}
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 4,
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                              <Text
                                style={{
                                  fontWeight:
                                    item.unreadCount > 0 ? "800" : "bold", // Extra bold if unread
                                  fontSize: 16,
                                  color: item.unreadCount > 0 ? "#000" : "#222", // Black if unread
                                  marginRight: 8,
                                }}
                              >
                                {displayName}
                              </Text>
                              {/* Online/Offline Badge for single chats */}
                              {isSingle &&
                                (() => {
                                  const otherUser = item.members?.find(
                                    (m) => m.userId !== userData.id
                                  );

                                  if (otherUser) {
                                    const userId = otherUser.userId || otherUser.id;
                                    const userStatus = userStatuses[userId];
                                    const isOnline = userStatus?.isActive || false;

                                    return (
                                      <View
                                        style={{
                                          backgroundColor: isOnline ? "#dcfce7" : "#f3f4f6",
                                          paddingHorizontal: 8,
                                          paddingVertical: 3,
                                          borderRadius: 12,
                                        }}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 11,
                                            color: isOnline ? "#16a34a" : "#6b7280",
                                            fontWeight: "600",
                                          }}
                                        >
                                          {isOnline ? "online" : "offline"}
                                        </Text>
                                      </View>
                                    );
                                  }
                                  return null;
                                })()}
                            </View>
                            <Text style={{ fontSize: 12, color: "#888" }}>
                              {(() => {
                                if (lastMessage?.createdAt) {
                                  const timestamp = lastMessage.createdAt.toDate
                                    ? lastMessage.createdAt.toDate()
                                    : new Date(lastMessage.createdAt);
                                  const now = new Date();
                                  const diffMs = now - timestamp;
                                  const diffH = Math.floor(
                                    diffMs / (1000 * 60 * 60)
                                  );
                                  const diffD = Math.floor(
                                    diffMs / (1000 * 60 * 60 * 24)
                                  );

                                  if (diffD > 0) {
                                    return timestamp.toLocaleDateString([], {
                                      weekday: "short",
                                    });
                                  } else if (diffH > 0) {
                                    // Show actual time instead of just hours
                                    return timestamp.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });
                                  } else {
                                    return timestamp.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });
                                  }
                                }
                                return "Now";
                              })()}
                            </Text>
                          </View>

                          <Text
                            style={{
                              fontSize: 14,
                              color: item.unreadCount > 0 ? "#000" : "#666", // Black if unread, gray if read
                              lineHeight: 18,
                              fontWeight: item.unreadCount > 0 ? "600" : "400", // Bold if unread
                            }}
                            numberOfLines={1}
                          >
                            {(() => {
                              if (lastMessage?.text) {
                                // Get sender information from the message
                                const senderId =
                                  lastMessage.senderId ||
                                  lastMessage.sender?.id;
                                const senderEmail =
                                  lastMessage.senderEmail ||
                                  lastMessage.sender?.email;

                                // Determine if this is the current user's message
                                const isOwnMessage =
                                  senderId === userData.id ||
                                  senderEmail === loggedUserEmail;

                                // Get sender name for display
                                let senderName = "";
                                if (!isOwnMessage) {
                                  // Try to get sender name from userStatuses if we have senderId
                                  if (senderId && userStatuses[senderId]) {
                                    const userStatus = userStatuses[senderId];
                                    const firstName =
                                      userStatus.firstName ||
                                      userStatus.first_name ||
                                      "";
                                    const lastName =
                                      userStatus.lastName ||
                                      userStatus.last_name ||
                                      "";
                                    senderName =
                                      `${firstName} ${lastName}`.trim();
                                  } else if (lastMessage.senderName) {
                                    // Fallback to senderName from message
                                    senderName = lastMessage.senderName;
                                  } else if (senderEmail) {
                                    // Fallback to email if no name available
                                    senderName = senderEmail.split("@")[0];
                                  }
                                }

                                const prefix = isOwnMessage
                                  ? "You: "
                                  : senderName
                                  ? `${senderName}: `
                                  : "";
                                // Handle media messages differently
                                if (lastMessage.type === "image") {
                                  return prefix + "📷 Image";
                                } else if (lastMessage.type === "video") {
                                  return prefix + "🎥 Video";
                                } else if (lastMessage.type === "document") {
                                  return prefix + "📄 Document";
                                }
                                
                                // Fallback: check if message has fileData or looks like a file
                                if (lastMessage.fileData) {
                                  const fileName = lastMessage.fileData.fileName || lastMessage.text;
                                  if (fileName) {
                                    const extension = fileName.split('.').pop()?.toLowerCase();
                                    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(extension)) {
                                      return prefix + "📷 Image";
                                    } else if (['mp4', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'webm', 'mpeg', '3gp'].includes(extension)) {
                                      return prefix + "🎥 Video";
                                    } else {
                                      return prefix + "📄 Document";
                                    }
                                  }
                                }
                                
                                // Additional fallback: check if text looks like a filename
                                if (lastMessage.text && lastMessage.text.includes('.')) {
                                  const extension = lastMessage.text.split('.').pop()?.toLowerCase();
                                  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(extension)) {
                                    return prefix + "📷 Image";
                                  } else if (['mp4', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'webm', 'mpeg', '3gp'].includes(extension)) {
                                    return prefix + "🎥 Video";
                                  } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension)) {
                                    return prefix + "📄 Document";
                                  }
                                }
                                
                                return prefix + lastMessage.text;
                              }
                              return "No messages yet";
                            })()}
                          </Text>
                        </View>

                        {/* Status Indicators */}
                        <View style={{ alignItems: "center", minWidth: 20 }}>
                          {/* Online/Offline status dot for single chats */}
                          {isSingle &&
                            (() => {
                              const otherUser = item.members?.find(
                                (m) => m.userId !== userData.id
                              );

                              if (otherUser) {
                                const userId = otherUser.userId || otherUser.id;
                                const userStatus = userStatuses[userId];
                                const isOnline = userStatus?.isActive || false;

                                return (
                                  <View
                                    style={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: 5,
                                      backgroundColor: isOnline ? "#22c55e" : "#d1d5db",
                                      marginBottom: 4,
                                    }}
                                  />
                                );
                              }
                              return null;
                            })()}

                          {/* Unread count */}
                          {item.unreadCount > 0 && (
                            <View
                              style={{
                                backgroundColor: "#2563eb",
                                borderRadius: 10,
                                minWidth: 20,
                                height: 20,
                                justifyContent: "center",
                                alignItems: "center",
                                paddingHorizontal: 6,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: "bold",
                                }}
                              >
                                {item.unreadCount > 99
                                  ? "99+"
                                  : item.unreadCount}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }
                  return null;
                }}
                ListEmptyComponent={
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingTop: 60,
                    }}
                  >
                    <Ionicons
                      name="chatbubbles-outline"
                      size={64}
                      color="#ccc"
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 16,
                        color: "#888",
                        fontSize: 16,
                      }}
                    >
                      No conversations yet
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 8,
                        color: "#aaa",
                        fontSize: 14,
                      }}
                    >
                      Start a new chat to begin messaging
                    </Text>
                  </View>
                }
                // contentContainerStyle={{ paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                  <RefreshControl
                    refreshing={loadingChats}
                    onRefresh={refreshChats}
                    colors={["#1976d2"]}
                    tintColor="#1976d2"
                    title="Pull to refresh"
                    titleColor="#1976d2"
                  />
                }
              />
            )}

            {/* Fallback State - Should never reach here, but just in case */}
            {!loadingChats && !chatError && sectionedData.length === 0 && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>
                  No chats available
                </Text>
              </View>
            )}
          </View>
        </View>

        <UserListModal
          visible={showUserModal}
          onClose={() => setShowUserModal(false)}
        />

        {/* Group Chat Modal */}
        <GroupChatModal
          visible={showGroupChatModal}
          onClose={() => setShowGroupChatModal(false)}
          onChatCreated={handleChatCreated}
        />

        {/* Centered Image Upload Loader */}
        {imageUploadLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
            pointerEvents="box-none"
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <ActivityIndicator size="large" color="#1976d2" />
              <Text
                style={{
                  color: "#1976d2",
                  fontSize: 16,
                  fontWeight: "500",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                Uploading profile image...
              </Text>
            </View>
          </View>
        )}

        {/* Image Upload Error Modal */}
        {showErrorModal && imageUploadError && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
                maxWidth: "80%",
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: "#f44336",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 24,
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </Text>
              </View>
              <Text
                style={{
                  color: "#d32f2f",
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Upload Failed
              </Text>
              <Text
                style={{
                  color: "#666",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 20,
                  marginBottom: 24,
                }}
              >
                {imageUploadError}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowErrorModal(false);
                  setImageUploadError(null);
                  // Clear the Redux chat state to reset the error
                  dispatch(clearChatState());
                }}
                style={{
                  backgroundColor: "#f44336",
                  paddingHorizontal: 6,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ProfileImagePicker
          visible={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onImageSelected={handleImageSelected}
          userId={userData?.id}
        />
        {/* Profile Image Picker */}
        
     
      </AppContainerClean>
    );
  } catch (error) {
    return (
      <Text style={{ color: "red", fontSize: 18 }}>
        Error rendering ChatRoomList: {error.message}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#1976d2",
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  chatHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976d2",
  },
  chatHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    margin: 16,
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  resultBox: {
    position: "absolute",
    top: 46,
    left: "5%",
    width: "90%",
    height: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 9999,
    pointerEvents: "auto",
    flexDirection: "column",
  },
});
