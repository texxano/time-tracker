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
  RefreshControl,
  TextInput,
  StyleSheet,
  Platform,
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

const MODAL_HEIGHT = Platform.OS === 'ios' ? Math.round(Dimensions.get("window").height * 0.8) : Math.round(Dimensions.get("window").height * 0.6)
const LIST_HEIGHT = Math.round(MODAL_HEIGHT * 0.5);

// Utility function to fetch user data from references
const fetchUserData = async (rootId, userId) => {
  try {
    const userRef = doc(db, 'companies', rootId, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {

    return null;
  }
};

// Utility function to fetch all users for a chat
const fetchChatMembers = async (rootId, members) => {
  try {
    const userPromises = members.map(member => fetchUserData(rootId, member.userId));
    const users = await Promise.all(userPromises);
    return users.filter(user => user !== null);
  } catch (error) {
    return [];
  }
};


export default function UserListModal({ 
  visible, 
  onClose, 
  onUserSelect = null, 
  title = 'Select User', 
  excludeUserIds = [] 
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' | 'error'
  const [creating, setCreating] = useState(false);
  
  // Pagination state - matching AllUsers.js exactly
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



  // Function to fetch users with pagination - matching AllUsers.js exactly
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
          ? response.list.filter(u => 
              u.email !== loggedUserEmail && 
              !excludeUserIds.includes(u.id)
            )
          : [];
        
        setUsers(filtered);
        setPageIndex(response.pageIndex);
        setTotalPages(response.totalPages);
        setDataLength(response.list.length === 0);
        setRequestApi(false);
      }
      
      return response;
    } catch (error) {
      // Error fetching users
      setRequestApi(false);
      setDataLength(true);
      setUsers([]);
      throw error;
    }
  };

  // Load initial users when modal opens - matching AllUsers.js exactly
  useEffect(() => {
    if (!visible) return;
    
    setUsers([]);
    setCurrentPage(1); // Reset to page 1 when modal opens
    fetchUsers();
  }, [visible, rootId]);

  // Handle page changes and search - separate from initial load
  useEffect(() => {
    if (visible && (currentPage || searchQuery)) {
      fetchUsers();
    }
  }, [currentPage, searchQuery]);

  // Handle empty pages - matching AllUsers.js exactly
  useEffect(() => {
    if (dataLength && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [dataLength, currentPage]);

  // Function to handle page change - matching AllUsers.js exactly
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to refresh users (pull-to-refresh) - matching AllUsers.js pattern
  const refreshUsers = async () => {
    setCurrentPage(1);
    setUsers([]);
    await fetchUsers();
  };

  // Effect to handle search changes - matching AllUsers.js pattern
  useEffect(() => {
    if (searchQuery.trim()) {
      // Reset pagination when searching
      setCurrentPage(1);
      setUsers([]);
    }
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    if (onUserSelect) {
      // If onUserSelect is provided, call it and close modal
      onUserSelect(user);
      onClose();
    } else {
      // Original behavior for chat creation
      setSelectedUser(user);
    }
  };

  const handleCreateChat = async () => {
    if (!selectedUser) return;

    setCreating(true);

    try {
      // First, ensure both users exist in Firestore users collection
      const currentUserRef = doc(db, 'companies', rootId, 'users', userData.id);
      const selectedUserRef = doc(db, 'companies', rootId, 'users', selectedUser.id);
      
      // Check if current user exists
      const currentUserSnap = await getDoc(currentUserRef);
      
      // If current user exists, get their avatar
      let currentUserAvatar = null;
      if (currentUserSnap.exists()) {
        currentUserAvatar = currentUserSnap.data().avatar || null;
      }
      
      // Check if selected user exists and get their avatar
      const selectedUserSnap = await getDoc(selectedUserRef);
      let selectedUserAvatar = null;
      
      // If selected user exists, get their avatar
      if (selectedUserSnap.exists()) {
        selectedUserAvatar = selectedUserSnap.data().avatar || null;
      }
      if (!currentUserSnap.exists()) {
        // Validate that we have complete current user data before creating
        if (!userData.firstName && !userData.lastName && !loggedUserEmail) {
          setMessage('Current user has incomplete data. Cannot create chat.');
          setMessageType('error');
          setShowMessageModal(true);
          setCreating(false);
          setTimeout(() => {
            setShowMessageModal(false);
          }, 1500);
          return;
        }

        const currentUserData = {
          id: userData.id,
          firstName: userData.firstName || userData.first_name || "Unknown",
          lastName: userData.lastName || userData.last_name || "User",
          email: loggedUserEmail || "",
          avatar: currentUserAvatar || null, // Avatar will be fetched from Firestore if needed
          isActive: true,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await setDoc(currentUserRef, currentUserData);
      } else {
        // Current user exists, check if data is complete and update if needed
        const existingData = currentUserSnap.data();
        if (!existingData.firstName && !existingData.lastName && !existingData.email) {
          // Update incomplete current user data
          const updateData = {
            firstName: userData.firstName || userData.first_name || "Unknown",
            lastName: userData.lastName || userData.last_name || "User",
            email: loggedUserEmail || "",
            updatedAt: new Date().toISOString(),
          };
          await setDoc(currentUserRef, { ...existingData, ...updateData }, { merge: true });
        }
      }
      
      if (!selectedUserSnap.exists()) {
        // Validate that we have complete user data before creating
        if (!selectedUser.firstName && !selectedUser.lastName && !selectedUser.email) {
          setMessage('Selected user has incomplete data. Cannot create chat.');
          setMessageType('error');
          setShowMessageModal(true);
          setCreating(false);
          setTimeout(() => {
            setShowMessageModal(false);
          }, 1500);
          return;
        }

        const selectedUserData = {
          id: selectedUser.id,
          firstName: selectedUser.firstName || selectedUser.first_name || "Unknown",
          lastName: selectedUser.lastName || selectedUser.last_name || "User",
          email: selectedUser.email || "",
          avatar: selectedUserAvatar || null,
          isActive: false,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await setDoc(selectedUserRef, selectedUserData);
      } else {
        // User exists, check if data is complete and update if needed
        const existingData = selectedUserSnap.data();
        if (!existingData.firstName && !existingData.lastName && !existingData.email) {
          // Update incomplete user data
          const updateData = {
            firstName: selectedUser.firstName || selectedUser.first_name || "Unknown",
            lastName: selectedUser.lastName || selectedUser.last_name || "User",
            email: selectedUser.email || "",
            updatedAt: new Date().toISOString(),
          };
          await setDoc(selectedUserRef, { ...existingData, ...updateData }, { merge: true });
        }
      }

      // Use references instead of full user data
      const members = [
        {
          userId: userData.id,
          role: 'member', // or 'admin' for group chats
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
        },
        {
          userId: selectedUser.id,
          role: 'member',
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
        }
      ];

      // Add memberIds array for efficient querying
      const memberIds = [userData.id, selectedUser.id];

      // Deterministic chat id (uuid v3) based on sorted user ids
      const idPair = [userData.id, selectedUser.id].sort().join(":");
      const chatId = uuidv3(idPair, uuidv3.DNS);

      // Create chat object with full user data for immediate use
      const chatObj = {
        id: chatId,
        type: 'single',
        name: null,
        createdAt: new Date().toISOString(),
        lastMessage: null,
        members: members, // References for Firestore
        memberIds: memberIds, // Array of user IDs for efficient querying
        createdBy: userData.id,
      };

      // Check if chat already exists
      const chatRef = doc(collection(db, 'companies', rootId, 'chats'), chatId);

      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        setMessage('This chat already exists');
        setMessageType('warning');
        setShowMessageModal(true);
        setCreating(false);
        setTimeout(() => {
          setShowMessageModal(false);
        }, 1500);
        return;
      }

      await setDoc(chatRef, chatObj);
      setMessage('Chat created successfully');
      setMessageType('success');
      setShowMessageModal(true);
      setSelectedUser(null);
      setTimeout(() => {
        setShowMessageModal(false);
        onClose();
        // Pass the chat object with references
        navigationService.navigate('ChatMessages', { chat: chatObj });
      }, 700);
      setCreating(false);
    } catch (e) {

      setMessage('Error creating chat');
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
     
        }}
      >
        <View
          style={[{
            width: "90%",
            height: MODAL_HEIGHT,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 8,
          }

        ]}
        >
          {/* Header: X and Select users in one line */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 8 }}>
              <Ionicons name="close" size={28} color="#888" />
            </TouchableOpacity>
          </View>

                     {/* Search Input - matching AllUsers.js pattern */}
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
               />
               {searchQuery.length > 0 ? (
                 <TouchableOpacity onPress={() => setSearchQuery('')}>
                   <Ionicons name="close-circle" size={20} color="#6b7280" />
                 </TouchableOpacity>
               ) : null}
             </View>
           </View>

                                {/* Pagination Info */}
           {users.length > 0 ? (
             <View style={{
               flexDirection: 'row',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: 8,
               paddingHorizontal: 4,
             }}>
               <Text style={{ color: '#6b7280', fontSize: 12 }}>
                 Showing {users.length} users
               </Text>
               {(pageIndex && totalPages) ? (
                 <Text style={{ color: '#2563eb', fontSize: 12 }}>
                   Page {pageIndex} of {totalPages}
                 </Text>
               ) : null}
             </View>
           ) : null}

           {/* Pagination Component - matching AllUsers.js exactly */}
           {(users.length > 0 && pageIndex && totalPages) ? (
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
           ) : null}

           {requestApi ? (
            <ActivityIndicator style={{ marginTop: 32 }} />
          ) : (
            <View
              style={{
                height: LIST_HEIGHT,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
                             <FlatList
                 data={users}
                 keyExtractor={(item) => item.id}
                 style={{ flex: 1 }}
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
                  const isSelected = selectedUser?.id === item.id;
                  const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
                  
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
                            {initials || '?'}
                          </Text>
                        </View>
                      )}
                      <Text style={{ fontSize: 14, flex: 1 }}>
                        {fullName || 'Unknown User'}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

          {/* Selected User Display */}
          {selectedUser ? (
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: "#f0f9ff",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#e0f2fe",
              }}
            >
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                Selected User:
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {selectedUser.avatar ? (
                  <Image
                    source={{ uri: selectedUser.avatar }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      marginRight: 8,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: selectedUser.color || "#ccc",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      {((selectedUser.firstName?.[0] || "") + (selectedUser.lastName?.[0] || "")).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <Text style={{ fontSize: 14, fontWeight: "500" }}>
                  {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'Unknown User'}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Success/Error message modal */}
          <ModalShowMessage
            message={message}
            type={messageType}
            showModal={showMessageModal}
            close={() => setShowMessageModal(false)}
            autoDismiss={messageType === 'success'}
            dismissDelay={messageType === 'success' ? 1200 : 1500}
          />
          {/* Footer buttons - only show for chat creation mode */}
          {!onUserSelect && (
            <View
              style={[
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 16,
                  position: "absolute",
                  bottom: 10,
                  left: 0,
                  right: 0,
                },
                px[2],
              ]}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  flex: 1,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#333", fontWeight: "bold", fontSize: 11 }}>
                  Close
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateChat}
                style={{
                  flex: 1,
                  backgroundColor: creating ? '#a5b4fc' : (selectedUser ? '#2563eb' : '#ccc'),
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginLeft: 8,
                  opacity: creating ? 0.7 : 1,
                }}
                disabled={creating || !selectedUser}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>
                    Create Chat
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
