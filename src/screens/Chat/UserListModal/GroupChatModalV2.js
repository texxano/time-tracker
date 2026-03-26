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


export default function GroupChatModalV2({ visible, onClose, onChatCreated, projectUsers = [], projectTitle = "", projectId = null }) {
  const [users, setUsers] = useState(projectUsers);
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

  // Load initial users when modal opens - matching UserListModal exactly
  useEffect(() => {
    if (!visible) return;


    if (projectTitle) {
      setGroupName(`${projectTitle} - Chat`);
    }
    
      // Automatically add all project users to selectedUsers array (excluding current user)
      const filteredProjectUsers = projectUsers.filter(user => 
        user && user.email && user.email !== userData.email && 
        (user.firstName || user.lastName || user.email)
      );
      setSelectedUsers(filteredProjectUsers);
      setUsers(filteredProjectUsers);
  }, [visible, rootId]);




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

    setCreating(true);

    try {
      // First, ensure all users exist in Firestore users collection (scoped by rootId)
      const userRefs = [userData, ...users];
      
      for (const user of userRefs) {
        if (!user?.id) {
          console.warn("User missing ID, skipping:", user);
          continue;
        }

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
        ...users.map(user => ({
          userId: user.id,
          role: 'member',
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
        }))
      ];

      // Add memberIds array for efficient querying
      const memberIds = [userData.id, ...users.map(u => u.id)];

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
        createdBy: userData.id,
         // Add project context if available
         ...(projectId && {
          projectId: projectId,
          projectTitle: projectTitle
        })
      };

      // Save chat (scoped by rootId)
      const existingGroupsRef = collection(db, 'companies', rootId, 'chats');
      await setDoc(doc(existingGroupsRef, groupId), chatObj);
      setMessage('Group chat created successfully');
      setMessageType('success');
      setShowMessageModal(true);
      setSelectedUsers([]);
      setGroupName('');
      
      
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

          {/* Project Users Count */}
          {users.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Project members: {users.length} user{users.length !== 1 ? 's' : ''}
              </Text>
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
        
              </View>
            </View>
          )}

          {/* Users List */}
          <View style={{ flex: 1, marginBottom: 16 }}>


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
                  contentContainerStyle={{ 
                    flexGrow: 1,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    padding: 8,
                  }}
                
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
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                          }}
                        >
                          <View style={{ 
                            backgroundColor: "#e3f2fd", 
                            borderRadius: 20, 
                            paddingHorizontal: 12, 
                            paddingVertical: 6,
                            marginHorizontal: 2,
                            marginVertical: 2,
                            borderWidth: 1,
                            borderColor: "#2196f3",
                          }}>
                            <Text style={{ 
                              fontSize: 14, 
                              color: "#1976d2",
                              textAlign: "center",
                              fontWeight: "500"
                            }}>
                              {item.firstName} {item.lastName}
                            </Text>
                          </View>
                        </View>
                      );
                  }}
                />
              </View>
          
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreateGroupChat}
            disabled={creating || users.length === 0 || !groupName.trim()}
            style={{
              backgroundColor: creating || users.length === 0 || !groupName.trim() ? "#ccc" : "#6f42c1",
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
