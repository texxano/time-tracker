import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

// Common emojis organized by category
const EMOJI_CATEGORIES = {
  'Smileys': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
    '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽',
    '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦',
    '👩', '🧑', '👨', '👵', '🧓', '👴', '👮', '👷', '💂', '🕵️',
    '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓',
    '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍⚖️', '👨‍⚖️', '👩‍💻', '👨‍💻',
    '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨',
    '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️',
    '🦸‍♀️', '🦸‍♂️', '🦹‍♀️', '🦹‍♂️', '🤶', '🎅', '🧙‍♀️', '🧙‍♂️',
    '🧝‍♀️', '🧝‍♂️', '🧛‍♀️', '🧛‍♂️', '🧟‍♀️', '🧟‍♂️', '🧞‍♀️', '🧞‍♂️',
    '🧜‍♀️', '🧜‍♂️', '🧚‍♀️', '🧚‍♂️', '👼', '🤰', '🤱', '👩‍🍼',
    '👨‍🍼', '🙇‍♀️', '🙇‍♂️', '💁‍♀️', '💁‍♂️', '🙅‍♀️', '🙅‍♂️', '🙆‍♀️',
    '🙆‍♂️', '🙋‍♀️', '🙋‍♂️', '🧏‍♀️', '🧏‍♂️', '🙎‍♀️', '🙎‍♂️', '🙍‍♀️',
    '🙍‍♂️', '😇', '🤦‍♀️', '🤦‍♂️', '🤷‍♀️', '🤷‍♂️', '👩‍⚖️', '👨‍⚖️',
    '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤',
    '👩‍🏫', '👨‍🏫', '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧',
    '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️',
    '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '🦸‍♀️', '🦸‍♂️', '🦹‍♀️', '🦹‍♂️'
  ],
  'Gestures': [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
    '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
    '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
    '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋',
    '🩸', '💧', '💦', '💨', '🫖', '☕', '🍼', '🫗', '🥛', '🍯',
    '🧂', '🥜', '🌰', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽',
    '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖',
    '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗',
    '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮',
    '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛',
    '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠',
    '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂',
    '🍮', '🍭', '🍬', '🍫', '🍿', '🍪', '🌰', '🥜', '🍯', '🥛'
  ],
  'Hearts': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
    '💟', '♥️', '🩷', '🩵', '🩶', '🩸', '🩹', '🩺', '🩻', '🩼',
    '🫀', '🫁', '🫂', '🫃', '🫄', '🫅'
  ]
};

export default function EmojiPicker({ visible, onEmojiSelected, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('Smileys');

  const handleEmojiPress = (emoji) => {
    onEmojiSelected(emoji);
    onClose(); // Close the modal when emoji is selected
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Emoji</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={styles.categoryTabs}>
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.activeCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Emoji Grid */}
          <ScrollView style={styles.emojiContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.emojiGrid}>
              {EMOJI_CATEGORIES[selectedCategory].map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'android' ? 0 : 0,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Platform.OS === 'android' ? screenHeight * 0.7 : '75%',
    minHeight: Platform.OS === 'android' ? screenHeight * 0.5 : '60%',
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  categoryTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeCategoryText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  emojiContainer: {
    padding: 16,
    flex: 1,
    minHeight: Platform.OS === 'android' ? screenHeight * 0.3 : screenHeight * 0.4,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  emoji: {
    fontSize: 24,
  },
}); 