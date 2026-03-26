import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
  Alert,
  RefreshControl,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ModalShowMessage from './ModalShowMessage';
import http from "../../../services/http";
import { px } from "../../../asset/style/utilities.style";
import { useSelector } from "react-redux";
import { db } from '../../../utils/firebase';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import navigationService from "../../../navigator/navigationService";
import { v3 as uuidv3 } from 'uuid';

const MODAL_HEIGHT = Math.round(Dimensions.get("window").height * 0.8);
const LIST_HEIGHT = Math.round(Dimensions.get("window").height * 0.25); // Fixed height for list


export default function GroupChatModal({ visible, onClose, onChatCreated }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' | 'error'
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState('');
  
  // Pagination state - matching UserListModal exactly
  const [pageIndex, setPageIndex] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Start with page 1
  const [dataLength, setDataLength] = useState(false);
  const [requestApi, setRequestApi] = useState(false); // Start with false
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  const userData = useSelector((state) => state.userData);
  const loggedUserEmail = userData.email;
  const rootId = useSelector((state) => state.userDataRole.rootId);

  // Function to fetch users with pagination - matching UserListModal exactly
  const fetchUsers = async () => {
    try {
      setRequestApi(true);
         // Build query parameters
         const params = [];
         if (currentPage && currentPage > 1) {
           params.push(`page=${currentPage}`);
         }
         if (searchQuery) {
           params.push(`search=${searchQuery}`);
         }
         
         const queryString = params.length > 0 ? `?${params.join('&')}` : '';
         const response = await http.get(`/chats/users${queryString}`);
      
      if (response && response.list) {
        const filtered = Array.isArray(response.list)
          ? response.list.filter(u => u.email !== loggedUserEmail)
          : [];
        
        setUsers(filtered);
        setPageIndex(response.pageIndex);
        setTotalPages(response.totalPages);
        setDataLength(response.list.length === 0);
        setRequestApi(false);
      }
      
      return response;
    } catch (error) {
      setRequestApi(false);
      setDataLength(true);
      setUsers([]);
      throw error;
    }
  };

  // Load initial users when modal opens - matching UserListModal exactly
  useEffect(() => {
    if (!visible) return;
    
    setUsers([]);
    setCurrentPage(1); // Reset to page 1 when modal opens
    setSelectedUsers([]);
    setGroupName('');
    fetchUsers();
  }, [visible, rootId]);

  // Handle page changes and search - separate from initial load
  useEffect(() => {
    if (visible && (currentPage || searchQuery)) {
      fetchUsers();
    }
  }, [currentPage, searchQuery]);

  // Handle empty pages - matching UserListModal exactly
  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [dataLength, currentPage]);

  // Function to handle page change - matching UserListModal exactly
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to refresh users (pull-to-refresh) - matching UserListModal pattern
  const refreshUsers = async () => {
    setCurrentPage(1);
    setUsers([]);
    await fetchUsers();
  };

  // Effect to handle search changes - matching UserListModal pattern
  useEffect(() => {
    if (searchQuery.trim()) {
      // Reset pagination when searching
      setCurrentPage(1);
      setUsers([]);
    }
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      setMessage('Please enter a group name');
      setMessageType('error');
      setShowMessageModal(true);
      setTimeout(() => {
        setShowMessageModal(false);
      }, 1500);
      return;
    }

    if (selectedUsers.length === 0) {
      setMessage('Please select at least one user');
      setMessageType('error');
      setShowMessageModal(true);
      setTimeout(() => {
        setShowMessageModal(false);
      }, 1500);
      return;
    }

    setCreating(true);

    try {
      // First, ensure all users exist in Firestore users collection (scoped by rootId)
      const userRefs = [userData, ...selectedUsers];
      
      for (const user of userRefs) {
        const userRef = doc(db, 'companies', rootId, 'users', user.id);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const userDataToSave = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar || null,
            isActive: user.id === userData.id,
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, userDataToSave);
        }
      }

      // Create members array with current user as admin
      const members = [
        {
          userId: userData.id,
          role: 'admin',
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
        },
        ...selectedUsers.map(user => ({
          userId: user.id,
          role: 'member',
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
        }))
      ];

      // Add memberIds array for efficient querying
      const memberIds = [userData.id, ...selectedUsers.map(u => u.id)];

      // Deterministic group id (uuid v3) based on name + sorted member ids
      const memberIdsSorted = memberIds.sort().join(',');
      const key = `${groupName.trim()}|${memberIdsSorted}`;
      const groupId = `group_${uuidv3(key, uuidv3.DNS)}`;

      // Create chat object with full user data for immediate use
      const chatObj = {
        id: groupId,
        type: 'group',
        name: groupName.trim(),
        createdAt: new Date().toISOString(),
        lastMessage: null,
        members: members,
        memberIds: memberIds, // Array of user IDs for efficient querying
        createdBy: userData.id
      };

      // Save chat (scoped by rootId)
      const existingGroupsRef = collection(db, 'companies', rootId, 'chats');
      await setDoc(doc(existingGroupsRef, groupId), chatObj);
      setMessage('Group chat created successfully');
      setMessageType('success');
      setShowMessageModal(true);
      setSelectedUsers([]);
      setGroupName('');
      
      // Notify parent component that a new chat was created
      if (onChatCreated) {
        onChatCreated(chatObj);
      }
      
      // Force a refresh of the chat list to ensure the new group appears
      setTimeout(() => {
        setShowMessageModal(false);
        onClose();
        // Navigate to the new group chat
        navigationService.navigate('ChatMessages', { chat: chatObj });
      }, 700);
      setCreating(false);
    } catch (e) {
      setMessage('Error creating group chat');
      setMessageType('error');
      setShowMessageModal(true);
      setTimeout(() => {
        setShowMessageModal(false);
      }, 1500);
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  width: "90%",
                  height: MODAL_HEIGHT,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  maxHeight: "90%",
                }}
              >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                Create Group Chat
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 8 }}>
              <Ionicons name="close" size={28} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Group Name Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
              Group Name
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#f9f9f9',
              }}
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          {/* Search Input - matching UserListModal pattern */}
          <View style={{ marginBottom: 12 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}>
              <Ionicons name="search" size={20} color="#6b7280" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={(value) => {
                  setSearchQuery(value);
                  if (value.trim()) {
                    setCurrentPage(1);
                  }
                }}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#374151',
                }}
                placeholderTextColor="#9ca3af"
                returnKeyType="search"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Selected Users Count */}
          {selectedUsers.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Selected: {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Pagination Info */}
          {users.length > 0 && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              paddingHorizontal: 4,
            }}>
         
              {pageIndex && totalPages && (
                <Text style={{ color: '#2563eb', fontSize: 12 }}>
                  Page {pageIndex} of {totalPages}
                </Text>
              )}
            </View>
          )}

          {/* Pagination Component - matching UserListModal exactly */}
          {users.length > 0 && pageIndex && totalPages && (
            <View style={{ marginBottom: 12 }}>
              <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-between", 
                alignItems: "center",
                paddingHorizontal: 20,
              }}>
                <Text style={{ 
                  color: "#6c757d", 
                  fontSize: 16, 
                  fontWeight: '500',
                }}>
                  {pageIndex}/{totalPages}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                  {pageIndex > 1 ? (
                    <>
                      <TouchableOpacity 
                        style={styles.pageChange} 
                        onPress={() => handlePageChange(1)}
                      >
                        <Ionicons name="play-back" size={20} color="#6c757d" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.pageChange} 
                        onPress={() => handlePageChange(pageIndex - 1)}
                      >
                        <Ionicons name="chevron-back" size={20} color="#6c757d" />
                      </TouchableOpacity>
                    </>
                  ) : null}

                  {pageIndex === totalPages ? null : (
                    <>
                      <TouchableOpacity 
                        style={styles.pageChange} 
                        onPress={() => handlePageChange(pageIndex + 1)}
                      >
                        <Ionicons name="chevron-forward" size={20} color="#6c757d" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.pageChange} 
                        onPress={() => handlePageChange(totalPages)}
                      >
                        <Ionicons name="play-forward" size={20} color="#6c757d" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Users List */}
          <View style={{ flex: 1, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' }}>
              Select Users
            </Text>
            {requestApi ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#007bff" />
              </View>
            ) : (
              <View style={{
                height: LIST_HEIGHT,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                overflow: "hidden",
                flex: 1,
              }}>
                <FlatList
                  data={users}
                  keyExtractor={(item) => item.id.toString()}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ flexGrow: 1 }}
                  refreshControl={
                    <RefreshControl
                      refreshing={requestApi}
                      onRefresh={refreshUsers}
                      colors={["#2563eb"]}
                      tintColor="#2563eb"
                    />
                  }
                  ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                      <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                        {requestApi ? 'Loading users...' : 'No users found'}
                      </Text>
                      <Text style={{ color: '#999', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                        Users count: {users.length}
                      </Text>
                    </View>
                  }
                  renderItem={({ item, index }) => {
                    const initials = (
                      (item.firstName?.[0] || "") + (item.lastName?.[0] || "")
                    ).toUpperCase();
                    const isSelected = selectedUsers.some(u => u.id === item.id);
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelectUser(item)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#eee",
                          backgroundColor: isSelected ? "#e0f2fe" : "#fff",
                        }}
                      >
                        {item.avatar ? (
                          <Image
                            source={{ uri: item.avatar }}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              marginRight: 12,
                            }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: item.color || "#ccc",
                              justifyContent: "center",
                              alignItems: "center",
                              marginRight: 12,
                            }}
                          >
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 12,
                              }}
                            >
                              {initials}
                            </Text>
                          </View>
                        )}
                        <Text style={{ fontSize: 14, flex: 1 }}>
                          {item.firstName} {item.lastName}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreateGroupChat}
            disabled={creating || selectedUsers.length === 0 || !groupName.trim()}
            style={{
              backgroundColor: creating || selectedUsers.length === 0 || !groupName.trim() ? "#ccc" : "#6f42c1",
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 24,
              alignItems: "center",
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Create Group Chat
              </Text>
            )}
          </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Message Modal */}
      <ModalShowMessage
        showModal={showMessageModal}
        message={message}
        type={messageType}
        close={() => setShowMessageModal(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  pageChange: {
    color: "#6c757d",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#dee2e6",
    marginHorizontal: 2,
    fontSize: 24,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
  },
});
