import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { useSelector } from "react-redux";
import UserListModal from "../UserListModal/UserListModal";
import HybridChatService from "../../../services/Chat/hybridChatService";

export default function GroupMembersModal({
  visible,
  onClose,
  members,
  chatName,
  chatId,
  onMembersChanged,
}) {
  const [memberDetails, setMemberDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [isManagingMembers, setIsManagingMembers] = useState(false);

  const rootId = useSelector((state) => state.userDataRole.rootId);
  const userId = useSelector((state) => state.userData.id);
  const userData = useSelector((state) => state.userData);
  const state = useSelector((state) => state);
  const isEditorForRoot = state.userDataRole.isEditorForRoot;
  const teamId = state.userDataRole.teamId;
  const isOwnerForRoot = state.userDataRole.isOwnerForRoot;
  const isAdministrator = state.userDataRole.isAdministrator;
  // Check if current user is admin or supervisor or team lead
  const isAdminOrSupervisor =
    userData.isAdministrator ||
    userData.isTeamLead ||
    isEditorForRoot ||
    isOwnerForRoot ||
    isAdministrator;

  // Temporary: Force admin for testing
  const forceAdmin = members.some(
    (member) => userId === member.userId && member.role === "admin"
  );
  const showAdminFeatures = isAdminOrSupervisor || forceAdmin;

  useEffect(() => {
    if (!visible || !members) return;

    let unsubscriber = null;

    const fetchMemberDetails = async () => {
      setLoading(true);
      setMemberDetails([]); // Reset member details when modal opens

      try {
        // Collect all user IDs
        const userIds = members
          .filter(member => member.userId)
          .map(member => member.userId);

        if (userIds.length === 0) {
          setLoading(false);
          return;
        }

        // OPTIMIZATION: Use batch query instead of individual listeners
        // Batch users in groups of 10 (Firestore 'in' limit)
        const memberDetails = [];
        
        for (let i = 0; i < userIds.length; i += 10) {
          const batch = userIds.slice(i, i + 10);
          const usersQuery = query(
            collection(db, "companies", rootId, "users"),
            where("id", "in", batch)
          );

          // Use getDocs for one-time fetch instead of onSnapshot for real-time
          const snapshot = await getDocs(usersQuery);
          snapshot.forEach((docSnap) => {
            const userData = docSnap.data();
            const member = members.find(m => m.userId === userData.id);
            
            if (member) {
              memberDetails.push({
                id: userData.id,
                firstName: userData.firstName || userData.first_name || "",
                lastName: userData.lastName || userData.last_name || "",
                email: userData.email || "",
                avatar: userData.avatar || null,
                role: member.role || "member",
              });
            }
          });
        }

        // Set all member details at once
        setMemberDetails(memberDetails);

        // NOTE: User status updates are now handled by centralizedUserStatusService
        // No need for individual listeners here - status updates come from centralized service
      } catch (error) {
        // Error fetching member details
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();

    // Cleanup function
    return () => {
      if (unsubscriber) {
        unsubscriber();
      }
    };
  }, [visible, members]);

  const handleAddMember = async (selectedUser) => {
    try {
      setIsManagingMembers(true);

      const result = await HybridChatService.addMemberToGroup(
        rootId,
        chatId,
        selectedUser.id,
        userData
      );

      if (result.success) {
        Alert.alert(
          "Success",
          `${selectedUser.firstName} ${selectedUser.lastName} has been added to the group.`
        );
        setShowUserListModal(false);
        // Notify parent component to refresh members
        if (onMembersChanged && typeof onMembersChanged === "function") {
          try {
            onMembersChanged();
          } catch (error) {}
        }
      } else {
        Alert.alert("Error", result.error || "Failed to add member to group.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add member to group.");
    } finally {
      setIsManagingMembers(false);
    }
  };

  const handleRemoveMember = (member) => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${member.firstName} ${member.lastName} from the group?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setIsManagingMembers(true);

              const result = await HybridChatService.removeMemberFromGroup(
                rootId,
                chatId,
                member.id,
                userData
              );

              if (result.success) {
                Alert.alert(
                  "Success",
                  `${member.firstName} ${member.lastName} has been removed from the group.`
                );
                // Notify parent component to refresh members
                if (onMembersChanged) {
                  onMembersChanged();
                }
              } else {
                Alert.alert(
                  "Error",
                  result.error || "Failed to remove member from group."
                );
              }
            } catch (error) {
              Alert.alert("Error", "Failed to remove member from group.");
            } finally {
              setIsManagingMembers(false);
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }) => {
    const isCurrentUser = item.id === userId;
    const canRemove = showAdminFeatures && !isCurrentUser;

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {`${item.firstName} ${item.lastName}`.trim() || "Unknown User"}
          </Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          {item.role && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    item.role === "admin" ? "#ef4444" : "#3b82f6",
                },
              ]}
            >
              <Text style={styles.roleText}>{item.role === "admin" ? "Supervisor" : item.role}</Text>
            </View>
          )}
        </View>
        {canRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveMember(item)}
            disabled={isManagingMembers}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{chatName || "Group Members"}</Text>
            <View style={styles.headerActions}>
              {showAdminFeatures && (
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => setShowUserListModal(true)}
                  disabled={isManagingMembers}
                >
                  <Ionicons name="person-add" size={20} color="#2563eb" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Members Count */}
          <View style={styles.membersCount}>
            <Text style={styles.membersCountText}>
              {memberDetails.length} member
              {memberDetails.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Members List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976d2" />
              <Text style={styles.loadingText}>Loading members...</Text>
            </View>
          ) : (
            <FlatList
              data={memberDetails}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.membersList}
            />
          )}
        </View>
      </View>

      {/* User List Modal for adding members */}
      <UserListModal
        visible={showUserListModal}
        onClose={() => setShowUserListModal(false)}
        onUserSelect={handleAddMember}
        title="Add Members to Group"
        excludeUserIds={memberDetails.map((member) => member.id)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: "#f0f9ff",
  },
  closeButton: {
    padding: 4,
  },
  membersCount: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
  },
  membersCountText: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  membersList: {
    padding: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fef2f2",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
  },
  roleBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
