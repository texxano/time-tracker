import React, { useState, memo, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable, Platform, Linking, Alert } from 'react-native';
import MessageContextMenu from './MessageContextMenu';
import MessageReactions from './MessageReactions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinkableText from './LinkableText';
import { useIntl } from 'react-intl';

const MessageBubble = memo(function MessageBubble({ message, isOwn, showAvatar, avatar, senderName, time, initials, messageType, onLongPress, onReact, onReply, onEdit, onDelete, onScrollToMessage }) {
  const intl = useIntl();
  
  // Force re-render when reactions change
  const reactionsKey = message.reactions ? JSON.stringify(message.reactions) : 'no-reactions';
  const [showContextMenu, setShowContextMenu] = useState(false);
  
  const translations = useMemo(() => ({
    reply: intl.formatMessage({ id: 'chat.message.reply' }),
    edit: intl.formatMessage({ id: 'chat.message.edit' }),
    forward: intl.formatMessage({ id: 'chat.message.forward' }),
    delete: intl.formatMessage({ id: 'chat.message.delete' }),
  }), [intl]);

  // Extract link from message text
  const extractedLink = useMemo(() => {
    if (!message.text || typeof message.text !== 'string') return null;
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
    const match = message.text.match(urlRegex);
    const link = match ? match[0] : null;
    return link;
  }, [message.text]);

  const handleOpenLink = async () => {
    if (!extractedLink) return;
    
    try {
      // Add https:// if URL doesn't start with http:// or https://
      let fullUrl = extractedLink;
      if (!extractedLink.match(/^https?:\/\//i)) {
        fullUrl = `https://${extractedLink}`;
      }

      const supported = await Linking.canOpenURL(fullUrl);

      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', `Cannot open this URL: ${extractedLink}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link. Please try again.');
    }
  };

  // Memoize time string calculation to prevent unnecessary re-computation
  const timeString = useMemo(() => {
    if (!time) return '';
    
    let dateObj;
    if (time && typeof time.toDate === 'function') {
      dateObj = time.toDate();
    } else if (typeof time === 'string' || typeof time === 'number') {
      dateObj = new Date(time);
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  }, [time]);

  const handleLongPress = () => {
    setShowContextMenu(true);
  };

  const handleContextMenuClose = () => {
    setShowContextMenu(false);
  };

  const handleReact = (emoji) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  return (
    <View>
      <Pressable
        style={[styles.container, isOwn ? styles.own : styles.other]}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.8}
      >
        {showAvatar && !isOwn && (
          avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' }]}>
              {initials ? (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{initials}</Text>
              ) : null}
            </View>
          )
        )}
        <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center'},  isOwn ? {justifyContent: 'flex-start', flexDirection: 'row-reverse'} : {justifyContent: 'flex-start'}]}>
          <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
            {senderName && !isOwn && (
              <Text style={styles.sender}>{senderName}</Text>
            )}
            
            {/* Reply Indicator */}
            {message.replyTo && (
              <TouchableOpacity 
                style={styles.replyIndicator}
                onPress={() => {
                  
                  if (onScrollToMessage && message.replyTo.messageId) {
                    onScrollToMessage(message.replyTo.messageId);
                  } else {
                  }
                }}
              >
                <Ionicons name="arrow-undo" size={12} color="#64748b" />
                <Text style={styles.replyText} numberOfLines={1}>
                  {message.replyTo.senderName}: {message.replyTo.text}
                </Text>
              </TouchableOpacity>
            )}
            
            <Text style={[styles.text, isOwn && styles.textOwn, extractedLink && styles.linkText]}>
              {(() => {
                if (!message.text) {
                  return null;
                }
                
                // Check if message has mentions and text contains @
                if (!message.mentions || message.mentions.length === 0 || !message.text.includes('@')) {
                  return message.text;
                }
                
                // Build regex from actual mention names
                const mentionNames = message.mentions.map(m => m.displayName);
                
                // Escape special regex characters and create pattern
                const escapedNames = mentionNames.map(name => 
                  name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                );
                const mentionPattern = new RegExp(`(@(?:${escapedNames.join('|')}))`, 'g');
                
                // Split by actual mention names
                const parts = message.text.split(mentionPattern);
                
                return parts.map((part, index) => {
                  if (!part) return null;
                  
                  const isMention = part.startsWith('@') && mentionNames.some(name => part === `@${name}`);
                  
                  if (isMention) {
                    return (
                      <Text key={index} style={styles.mention}>
                        {part}
                      </Text>
                    );
                  }
                  return <Text key={index}>{part}</Text>;
                });
              })()}
              {messageType && messageType !== 'text' && (
                <Text style={styles.messageType}> • {messageType}</Text>
              )}
            </Text>
            
            {/* Message Reactions */}
            <MessageReactions
              key={`reactions-${message.id}-${reactionsKey}`}
              reactions={message.reactions}
              onReactionPress={(emoji) => {
                if (onReact) {
                  onReact(message.id, emoji);
                }
              }}
              isOwnMessage={isOwn}
            />
            
            <Text style={[styles.time, isOwn && styles.timeOwn]}>
              {timeString}
              {message.isEdited && (
                <Text style={styles.editedIndicator}> • edited</Text>
              )}
            </Text>
          </View>

          {/* Link Button - positioned outside bubble */}
          {extractedLink && (
            <TouchableOpacity 
              onPress={handleOpenLink}
              style={[styles.linkButton, isOwn ? styles.linkButtonOwn : styles.linkButtonOther]}
              activeOpacity={0.7}
            >
              <Ionicons name="link" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </Pressable>

      {/* Context Menu */}
      <MessageContextMenu
        visible={showContextMenu}
        onClose={handleContextMenuClose}
        onReact={handleReact}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        translations={translations}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  own: {
    justifyContent: 'flex-end',
  },
  other: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: '#2563eb',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 2,
  },
  bubbleOwn: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },
  text: {
    color: '#222',
    fontSize: 15,
  },
  textOwn: {
    color: '#fff',

  },
  linkText: {
    textDecorationLine: 'underline',
  },
  linkButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  linkButtonOwn: {
    marginRight: 8,
  },
  linkButtonOther: {
    marginLeft: 8,
  },
  sender: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2563eb',
    marginBottom: 2,
  },
  time: {
    color: '#64748b',
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  timeOwn: {
    color: '#fff',
  },
  messageType: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  editedIndicator: {
    fontSize: 10,
    opacity: 0.7,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  mention: {
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  replyText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
});

export default MessageBubble; 