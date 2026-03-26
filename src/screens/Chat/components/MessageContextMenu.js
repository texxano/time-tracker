import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
  InteractionManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function MessageContextMenu({
  visible,
  onClose,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onForward,
  translations = {
    reply: 'Reply',
    edit: 'Edit',
    forward: 'Forward',
    delete: 'Delete',
  },
}) {
  const emojis = ['❤️', '😂', '😮', '😢', '😠', '👍'];

  const handleEmojiPress = (emoji) => {
    onReact(emoji);
    onClose();
  };

  const handleActionPress = (action) => {
    if (onClose) {
      onClose();
    }

    InteractionManager.runAfterInteractions(() => {
      switch (action) {
        case 'reply':
          onReply();
          break;
        case 'edit':
          onEdit();
          break;
        case 'forward':
          if (onForward) {
            onForward();
          }
          break;
        case 'delete':
          onDelete();
          break;
      }
    });
  };

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent={false}
        hardwareAccelerated={true}
      >
        <View style={styles.androidModalContainer}>
          <TouchableOpacity
            style={styles.androidBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          
          <View style={styles.androidMenuWrapper}>
            {/* Emoji Reactions */}
            <View style={styles.androidEmojiContainer}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.androidEmojiButton}
                  onPress={() => handleEmojiPress(emoji)}
                  activeOpacity={0.7}
                  underlayColor="#e2e8f0"
                >
                  <Text style={styles.androidEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Options */}
            <View style={styles.androidActionContainer}>
              <TouchableOpacity
                style={styles.androidActionButton}
                onPress={() => handleActionPress('reply')}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-undo" size={20} color="#3b82f6" />
                <Text style={styles.androidActionText}>
                  {translations.reply}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.androidActionButton}
                onPress={() => handleActionPress('edit')}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
                <Text style={styles.androidActionText}>
                  {translations.edit}
                </Text>
              </TouchableOpacity>

              {onForward ? (
                <TouchableOpacity
                  style={styles.androidActionButton}
                  onPress={() => handleActionPress('forward')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-redo-outline" size={20} color="#3b82f6" />
                  <Text style={styles.androidActionText}>
                    {translations.forward}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.androidActionButton}
                onPress={() => handleActionPress('delete')}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={[styles.androidActionText, styles.androidDeleteText]}>
                  {translations.delete}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // iOS version
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.centeredContainer}>
          <TouchableOpacity
            style={styles.menuWrapper}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Emoji Reactions */}
            <View style={styles.emojiContainer}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Options */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleActionPress('reply')}
              >
                <Ionicons name="arrow-undo" size={24} color="#3b82f6" />
                <Text style={styles.actionText}>
                  {translations.reply}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleActionPress('edit')}
              >
                <Ionicons name="create-outline" size={24} color="#3b82f6" />
                <Text style={styles.actionText}>
                  {translations.edit}
                </Text>
              </TouchableOpacity>

              {onForward ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleActionPress('forward')}
                >
                  <Ionicons name="arrow-redo-outline" size={24} color="#3b82f6" />
                  <Text style={styles.actionText}>
                    {translations.forward}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleActionPress('delete')}
              >
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
                <Text style={[styles.actionText, styles.deleteText]}>
                  {translations.delete}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Android-specific styles
  androidModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  androidBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidMenuWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
  },
  androidEmojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  androidEmojiButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  androidEmoji: {
    fontSize: 20,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  androidActionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  androidActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  androidActionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  androidDeleteText: {
    color: '#ef4444',
  },
  
  // iOS styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  menuWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emojiButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  emoji: {
    fontSize: 20,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  actionText: {
    marginLeft: 16,
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '500',
  },
  deleteText: {
    color: '#ef4444',
  },
}); 