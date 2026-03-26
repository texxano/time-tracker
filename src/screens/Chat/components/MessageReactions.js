import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

export default function MessageReactions({ reactions, onReactionPress, isOwnMessage }) {
  if (!reactions || Object.keys(reactions).length === 0) {
    return null;
  }

  const renderReaction = (emoji, reactionData) => {
    const { count, users } = reactionData;
    
    return (
      <TouchableOpacity
        key={emoji}
        style={[
          styles.reactionContainer,
          isOwnMessage ? styles.ownReaction : styles.otherReaction
        ]}
        onPress={() => onReactionPress && onReactionPress(emoji)}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.count}>{count}</Text>
        
        {/* Show user avatars if there are users (only for other messages) */}
        {users && users.length > 0 && !isOwnMessage && (
          <View style={styles.usersContainer}>
            {users.slice(0, 3).map((user, index) => (
              <View key={user.id} style={[styles.userAvatar, { zIndex: users.length - index }]}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {users.length > 3 && (
              <View style={styles.moreUsers}>
                <Text style={styles.moreUsersText}>+{users.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownContainer : styles.otherContainer
    ]}>
      {Object.entries(reactions).map(([emoji, reactionData]) => 
        renderReaction(emoji, reactionData)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
    marginBottom: 2,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 40,
  },
  ownReaction: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  otherReaction: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  count: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginRight: 4,
  },
  usersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  userAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  avatarImage: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  avatarPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  moreUsers: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  moreUsersText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
}); 