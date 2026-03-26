import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GroupMembersModal from './GroupMembersModal';
import { useSelector } from 'react-redux';

export default function ChatMessageHeader({ 
  title, 
  subtitle, 
  avatar, 
  onBack, 
  groupActions, 
  initials, 
  logo,
  isGroupChat = false,
  members = [],
  chatName = '',
  chatId = null,
  onHeaderPress = null,
  userData = null,
  onMembersChanged = null,
  onDeleteChat = null,
  canDeleteChat = true
}) {
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleTitlePress = () => {
    if (isGroupChat) {
      setShowMembersModal(true);
    }
  };

  const handleDeleteChat = () => {
    setShowMenu(false);
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (onDeleteChat) {
              onDeleteChat();
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        
        {/* Logo or Avatar */}
        {logo ? (
          <Image source={logo} style={styles.logo} />
        ) : avatar ? (
          <Image 
            source={{ uri: avatar }} 
            style={styles.avatar}
            onError={() => {
              // If image fails to load, we'll fall back to initials
            }}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' }] }>
            {initials ? (
              <Text style={styles.initialsText}>{initials}</Text>
            ) : (
              <Ionicons name="person" size={24} color="#fff" />
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.titleContainer, (isGroupChat || onHeaderPress) && styles.clickableTitle]} 
          onPress={isGroupChat ? handleTitlePress : onHeaderPress}
          disabled={!isGroupChat && !onHeaderPress}
        >
          <Text style={[styles.title, (isGroupChat || onHeaderPress) && styles.clickableTitleText]} numberOfLines={1}>
            {title}
            {(isGroupChat || onHeaderPress) && <Ionicons name="chevron-down" size={16} color="#666" style={styles.chevronIcon} />}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, (isGroupChat || onHeaderPress) && styles.clickableSubtitleText]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </TouchableOpacity>
        
        {groupActions && <View style={styles.actions}>{groupActions}</View>}
        
        {/* Three Dot Menu - Only show if onDeleteChat is provided */}
        {onDeleteChat && (
          <TouchableOpacity 
            onPress={() => setShowMenu(true)} 
            style={styles.menuButton}
            activeOpacity={0.6}
          >
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleDeleteChat}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={styles.menuItemTextDelete}>Delete Chat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Group Members Modal */}
      <GroupMembersModal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={members}
        chatName={chatName}
        chatId={chatId}
        onMembersChanged={onMembersChanged}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
  },
  clickableTitle: {
    // Add styles for clickable title if needed
  },
  clickableTitleText: {
    // Add styles for clickable title text if needed
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
  },
  clickableSubtitleText: {
    // Add styles for clickable subtitle text if needed
  },
  chevronIcon: {
    marginLeft: 4,
  },
  actions: {
    marginLeft: 8,
  },
  menuButton: {
 
    padding: 6,
    marginLeft: 12,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  menuDots: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    lineHeight: 22,
    textAlign: 'center',
    height: 16,
    width: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 12,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemTextDelete: {
    marginLeft: 12,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
}); 