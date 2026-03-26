import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import EmojiPicker from "./EmojiPicker";
import MentionSuggestionList from "./MentionSuggestionList";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export default function MessageInputBar({
  value,
  onChangeText,
  onSend,
  loading,
  onFileSelect,
  uploadProgress,
  editingMessage,
  onCancelEdit,
  replyingTo,
  onCancelReply,
  // Mention props (only for group chats)
  members = [],
  currentUserId,
  isGroupChat = false,
  onMentionAdded,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const textInputRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  // Detect @ mentions in text
  const detectMention = (text, cursorPosition) => {
    if (!isGroupChat || !text) {
      setShowMentionSuggestions(false);
      return;
    }

    // Find the last @ before cursor position
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) {
      setShowMentionSuggestions(false);
      return;
    }

    // Check if there's a space or newline between @ and cursor
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
    if (textAfterAt.includes(" ") || textAfterAt.includes("\n")) {
      setShowMentionSuggestions(false);
      return;
    }

    // Show suggestions
    setMentionStartIndex(lastAtIndex);
    setMentionSearchQuery(textAfterAt);
    setShowMentionSuggestions(true);
  };

  const handleTextChange = (text) => {
    onChangeText(text);
    // Use text.length as cursor position since it moves to the end after typing
    const cursorPosition = text.length;
    detectMention(text, cursorPosition);
  };

  const handleSelectionChange = (event) => {
    const { selection } = event.nativeEvent;
    selectionRef.current = selection;
    // Only detect mention if we have the current value
    if (value) {
      detectMention(value, selection.start);
    }
  };

  const handleMentionSelect = (member) => {
    const displayName = `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email;
    const beforeMention = value.substring(0, mentionStartIndex);
    const afterMention = value.substring(value.length); // Use current text length
    const newText = `${beforeMention}@${displayName} ${afterMention}`;
    
    onChangeText(newText);
    setShowMentionSuggestions(false);
    
    // Update cursor position
    const newCursorPosition = mentionStartIndex + displayName.length + 2; // +2 for @ and space
    selectionRef.current = { start: newCursorPosition, end: newCursorPosition };
    
    // Notify parent about the mention
    if (onMentionAdded) {
      onMentionAdded({
        userId: member.userId || member.id,
        displayName,
      });
    }

    // Focus back on input and set cursor position
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
  };

  const handleEmojiSelected = (emoji) => {
    onChangeText(value + emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleCancelEdit = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleCancelReply = () => {
    if (onCancelReply) {
      onCancelReply();
    }
  };

  const handleFilePicker = async () => {
    Alert.alert(
      "Select File Type",
      "Choose what type of file you want to send",
      [
        {
          text: "Image/Video",
          onPress: () => pickImageOrVideo(),
        },
        {
          text: "Document",
          onPress: () => pickDocument(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickImageOrVideo = async () => {
    Alert.alert("Select Media", "Choose how you want to add media", [
      {
        text: "Camera",
        onPress: () => takePhoto(),
      },
      {
        text: "Gallery",
        onPress: () => pickFromGallery(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Camera permission is required to take photos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          name:
            asset.fileName ||
            `photo_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
          type:
            asset.type || (asset.type === "video" ? "video/mp4" : "image/jpeg"), // Fallback MIME type
          size: asset.fileSize,
        };
        // // console.log('📸 Camera fileData:', fileData);

        // Pass the file data directly - compression will happen in the chat component
        onFileSelect(fileData);
      }
    } catch (error) {
      // Error taking photo
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          name:
            asset.fileName ||
            `file_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
          type:
            asset.type || (asset.type === "video" ? "video/mp4" : "image/jpeg"), // Fallback MIME type
          size: asset.fileSize,
        };
        // // console.log('📁 Original fileData:', fileData);
        // // console.log('📱 Asset from ImagePicker:', asset);
        // Pass the file data directly - compression will happen in the chat component
        onFileSelect(fileData);
      }
    } catch (error) {
      // Error picking image/video
      Alert.alert("Error", "Failed to pick image/video");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
          size: asset.size,
        };
        onFileSelect(fileData);
      }
    } catch (error) {
      // Error picking document
      Alert.alert("Error", "Failed to pick document");
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Reply Indicator - Separate column above input */}
      {replyingTo && (
        <View style={styles.replyIndicator}>
          <View style={styles.replyContent}>
            <Ionicons name="arrow-undo" size={16} color="#3b82f6" />
            <Text style={styles.replyText} numberOfLines={1}>
              Replying to: {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cancelReplyBtn}
            onPress={handleCancelReply}
          >
            <Ionicons name="close" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Input Container */}
      <View style={styles.container}>
        {/* Cancel Edit Button */}
        {editingMessage && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
            <Ionicons name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}

        {/* Emoji Button */}
        <TouchableOpacity style={styles.iconBtn} onPress={toggleEmojiPicker}>
          <Ionicons name="happy-outline" size={24} color="#64748b" />
        </TouchableOpacity>

        {/* File Attachment Button */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleFilePicker}
          disabled={loading}
        >
          <Ionicons name="attach" size={24} color="#64748b" />
        </TouchableOpacity>

        <TextInput
          ref={textInputRef}
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          onSelectionChange={handleSelectionChange}
          placeholder={
            editingMessage
              ? "Edit message..."
              : replyingTo
              ? "Reply to message..."
              : "Type a message..."
          }
          placeholderTextColor="#9ca3af"
          editable={!loading}
          multiline
          textAlignVertical="center"
          underlineColorAndroid="transparent"
          selectionColor="#2563eb"
        />

        <TouchableOpacity
          style={[
            styles.iconBtn,
            { opacity: (value.trim() || onFileSelect) && !loading ? 1 : 0.5 },
          ]}
          onPress={onSend}
          disabled={(!value.trim() && !onFileSelect) || loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              {uploadProgress > 0 && (
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              )}
            </View>
          ) : editingMessage ? (
            <Text style={styles.updateText}>Update</Text>
          ) : (
            <Ionicons name="send" size={24} color="#2563eb" />
          )}
        </TouchableOpacity>
      </View>

      {/* Mention Suggestions */}
      {showMentionSuggestions && isGroupChat && (
        <MentionSuggestionList
          members={members}
          searchQuery={mentionSearchQuery}
          onSelectMember={handleMentionSelect}
          currentUserId={currentUserId}
        />
      )}

      {/* Emoji Picker Modal */}
      <EmojiPicker
        visible={showEmojiPicker}
        onEmojiSelected={handleEmojiSelected}
        onClose={() => setShowEmojiPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    marginHorizontal: 8,
  },
  iconBtn: {
    padding: 6,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 10,
    color: "#2563eb",
    marginTop: 2,
  },
  cancelBtn: {
    padding: 6,
    marginRight: 8,
  },
  updateText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "bold",
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  replyContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  replyText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#3b82f6",
    flex: 1,
  },
  cancelReplyBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
