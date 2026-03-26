import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Pressable, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import centralizedUserStatusService from "../../services/Chat/centralizedUserStatusService";
import HybridChatService from "../../services/Chat/hybridChatService";

import Ionicons from "@expo/vector-icons/Ionicons";

import { NavigationService } from "../../navigator";
import { check } from "../../utils/statusUser";
import { styles } from "../../asset/style/components/header";
import { FormattedMessage } from "react-intl";
import flex from "../../asset/style/flex.style";
import { mr } from "../../asset/style/utilities.style";

const ChatHeader = ({
  location,
  toggleDrawer,
  onAddChat,
  onAddGroupChat,
  onAddImage,
}) => {
  const state = useSelector((state) => state);
  const userData = state.userData;
  const userId = state.userData.id;
  const rootId = state.userDataRole.rootId;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const isEditorForRoot = state.userDataRole.isEditorForRoot;
  const teamId = state.userDataRole.teamId;
  const isAdministrator = state.userDataRole?.isAdministrator;

  const [currentUserData, setCurrentUserData] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const statusButtonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });

  // Fetch current user data directly from Firestore on mount
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      if (!userId || !rootId || location !== "ChatRoomList") return;

      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../../utils/firebase");
        
        const userRef = doc(db, "companies", rootId, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCurrentUserData(userData);
        }
      } catch (error) {
        console.error("Error fetching current user data:", error);
      }
    };

    fetchCurrentUserData();
  }, [userId, rootId, location]);

  // Use centralized user status service for real-time updates
  useEffect(() => {
    if (!userId || !rootId || location !== "ChatRoomList") return;

    // Ensure current user is tracked by centralized service
    centralizedUserStatusService.addUserToListening(rootId, userId);

    const unsubscribe = centralizedUserStatusService.subscribe((statuses) => {
      const userStatus = statuses[userId];
      if (userStatus) {
        setCurrentUserData(userStatus);
      }
    });

    // Get current status immediately if available
    const currentStatus = centralizedUserStatusService.getUserStatus(userId);
    if (currentStatus) {
      setCurrentUserData(currentStatus);
    }

    return unsubscribe;
  }, [userId, rootId, location]);

  // Generate initials from firstName and lastName
  const getInitials = () => {
    const firstName =
      currentUserData?.firstName ||
      currentUserData?.first_name ||
      userData?.firstName ||
      userData?.first_name ||
      "";
    const lastName =
      currentUserData?.lastName ||
      currentUserData?.last_name ||
      userData?.lastName ||
      userData?.last_name ||
      "";
    const firstInitial = firstName.charAt(0) || "";
    const lastInitial = lastName.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // 🚀 Load saved status preference on mount
  useEffect(() => {
    const loadSavedStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem(`userStatus_${userId}`);
        if (savedStatus !== null && rootId && userId) {
          const isActive = savedStatus === 'online';
          // Only update if different from current status
          if (isActive !== (currentUserData?.isActive || false)) {
            await HybridChatService.updateUserStatus(rootId, userId, isActive);
          }
        }
      } catch (error) {
        // Error loading saved status
      }
    };

    if (userId && rootId && location === "ChatRoomList") {
      loadSavedStatus();
    }
  }, [userId, rootId, location]);

  // Handle status change
  const handleStatusChange = async (isActive) => {
    if (isUpdatingStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      
      // Update status in Firebase
      await HybridChatService.updateUserStatus(rootId, userId, isActive);
      
      // Immediately update local state for instant UI feedback
      setCurrentUserData(prev => ({
        ...prev,
        isActive: isActive,
        lastSeen: new Date().toISOString(),
      }));
      
      // 🚀 Save user preference to AsyncStorage
      await AsyncStorage.setItem(
        `userStatus_${userId}`,
        isActive ? 'online' : 'offline'
      );
      
      setShowStatusDropdown(false);
    } catch (error) {
      console.error("❌ Error updating status:", error);
      alert(`Failed to update status: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Get current status
  const isOnline = currentUserData?.isActive || false;

  // Measure button position for dropdown
  const handleStatusButtonPress = () => {
    if (statusButtonRef.current) {
      statusButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          y: pageY + height + 4,
          width: width,
        });
        setShowStatusDropdown(true);
      });
    } else {
      setShowStatusDropdown(true);
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            NavigationService.navigate("Dashboard", {
              navigateRefresh: check(),
            });
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={styles.logo}
              source={require("../../asset/image/logo.png")}
            />
            <Text
              style={{
                fontSize: 24,
                paddingLeft: 5,
                color: "#0c0d0e",

                marginLeft: 10,
              }}
            >
              texxano
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.toggle}>
            <Ionicons name="menu" size={30} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Buttons Row - Below the header */}
      {location === "ChatRoomList" && (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "rgba(104, 96, 96, 0.1)",
            marginHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#e9ecef",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: 10,
          }}
        >
          {/* Profile Image Button - Circular Avatar Style */}
          {onAddImage && (
            <TouchableOpacity
              onPress={onAddImage}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#28a745",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{ position: "relative", width: 46, height: 46 }}>
                {(currentUserData?.avatar || userData?.avatar) ? (
                  <Image
                    source={{ uri: currentUserData?.avatar || userData?.avatar }}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      {getInitials() || "U"}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    position: "absolute",
                    right: -2,
                    top: -2,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#6c757d",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                >
                  <Ionicons name="camera-outline" size={12} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Status Toggle Button */}
          {location === "ChatRoomList" && (
            <View style={{ marginLeft: 12 }}>
              <TouchableOpacity
                ref={statusButtonRef}
                onPress={handleStatusButtonPress}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isOnline ? "#dcfce7" : "#f3f4f6",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isOnline ? "#16a34a" : "#d1d5db",
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isOnline ? "#16a34a" : "#9ca3af",
                    marginRight: 6,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: isOnline ? "#16a34a" : "#6b7280",
                    marginRight: 4,
                  }}
                >
                {isOnline ? "online" : "offline"}
                </Text>
                <Ionicons
                  name={showStatusDropdown ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={isOnline ? "#16a34a" : "#6b7280"}
                />
              </TouchableOpacity>

              {/* Dropdown Menu - Using Modal for better UX */}
              <Modal
                visible={showStatusDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStatusDropdown(false)}
              >
                <Pressable
                  style={dropdownStyles.modalBackdrop}
                  onPress={() => setShowStatusDropdown(false)}
                >
                  <View
                    style={[
                      dropdownStyles.dropdownContainer,
                      {
                        top: dropdownPosition.y || 100,
                        left: dropdownPosition.x || 16,
                        minWidth: Math.max(dropdownPosition.width || 140, 140),
                      },
                    ]}
                    onStartShouldSetResponder={() => true}
                  >
                    <TouchableOpacity
                      onPress={() => handleStatusChange(true)}
                      disabled={isUpdatingStatus}
                      style={[
                        dropdownStyles.dropdownItem,
                        isOnline && dropdownStyles.dropdownItemActive,
                        isUpdatingStatus && dropdownStyles.dropdownItemDisabled,
                      ]}
                    >
                      <View style={dropdownStyles.dropdownItemContent}>
                        <View
                          style={[
                            dropdownStyles.statusIndicator,
                            { backgroundColor: "#16a34a" },
                          ]}
                        />
                        <Text
                          style={[
                            dropdownStyles.dropdownItemText,
                            isOnline && dropdownStyles.dropdownItemTextActive,
                          ]}
                        >
                          online
                        </Text>
                        {isUpdatingStatus && !isOnline ? (
                          <ActivityIndicator
                            size="small"
                            color="#16a34a"
                            style={{ marginLeft: "auto" }}
                          />
                        ) : (
                          isOnline && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#16a34a"
                              style={{ marginLeft: "auto" }}
                            />
                          )
                        )}
                      </View>
                    </TouchableOpacity>

                    <View style={dropdownStyles.dropdownDivider} />

                    <TouchableOpacity
                      onPress={() => handleStatusChange(false)}
                      disabled={isUpdatingStatus}
                      style={[
                        dropdownStyles.dropdownItem,
                        !isOnline && dropdownStyles.dropdownItemActive,
                        isUpdatingStatus && dropdownStyles.dropdownItemDisabled,
                      ]}
                    >
                      <View style={dropdownStyles.dropdownItemContent}>
                        <View
                          style={[
                            dropdownStyles.statusIndicator,
                            { backgroundColor: "#9ca3af" },
                          ]}
                        />
                        <Text
                          style={[
                            dropdownStyles.dropdownItemText,
                            !isOnline && dropdownStyles.dropdownItemTextActive,
                          ]}
                        >
                          offline
                        </Text>
                        {isUpdatingStatus && isOnline ? (
                          <ActivityIndicator
                            size="small"
                            color="#6b7280"
                            style={{ marginLeft: "auto" }}
                          />
                        ) : (
                          !isOnline && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color="#6b7280"
                              style={{ marginLeft: "auto" }}
                            />
                          )
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Modal>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              // paddingHorizontal: 16,
              paddingVertical: 12,

            }}
          >
            {/* Add Chat Button */}
            {/* <TouchableOpacity onPress={onAddChat} style={styles.headerButton}>
              <Ionicons name="person-add" size={20} color="#1976d2" />
            </TouchableOpacity> */}

            {/* Add Group Chat Button */}
            {(isOwnerForRoot ||
              isEditorForRoot ||
              teamId ||
              isAdministrator) && (
              <TouchableOpacity
                onPress={onAddGroupChat}
                style={[styles.headerButton, flex.d_flex_center, { borderWidth: 1, borderColor: "#1976d2", borderRadius: 10 }]}
              >
                <Text style={[mr[3],{fontSize:10, color: "#1976d2"}]}>
                  <FormattedMessage id="create.group" />
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="people" size={16} color="#1976d2" />
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1976d2" }}>+</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* {!requestRefreshToken && <LoaderLine />} */}
    </>
  );
};

export default ChatHeader;

const dropdownStyles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  dropdownContainer: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
    minWidth: 160,
    height:89
  },
  dropdownItem: {
    height: 40,
padding:8
  },
  dropdownItemActive: {
    backgroundColor: "#f9fafb",
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "400",
    flex: 1,
  },
  dropdownItemTextActive: {
    fontWeight: "600",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 8,
  },
  dropdownItemDisabled: {
    opacity: 0.6,
  },
});
