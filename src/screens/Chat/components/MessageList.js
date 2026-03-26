import React, { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, memo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MessageBubble from './MessageBubble';
import FileMessage from './FileMessage';

// Memoized wrapper for individual message items
const MemoizedMessageItem = memo(({ 
  msg, 
  currentUserId, 
  showAvatars, 
  isGroup, 
  onReact, 
  onReply, 
  onEdit, 
  onDelete,
  onForward,
  scrollToMessage 
}) => {
  // Generate initials from senderName if no avatar
  const initials = useMemo(() => {
    if (!msg.avatar && msg.senderName) {
      const nameParts = msg.senderName.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      } else if (nameParts.length === 1) {
        return nameParts[0][0].toUpperCase();
      }
    }
    return undefined;
  }, [msg.avatar, msg.senderName]);

  // Check if this is a file message or has a specific type
  if (msg.fileData || (msg.type && msg.type !== 'text')) {
    return (
      <FileMessage
        message={msg}
        isOwnMessage={msg.senderId === currentUserId}
        showAvatar={showAvatars && (isGroup || msg.senderId !== currentUserId)}
        avatar={msg.avatar}
        senderName={msg.senderName}
        initials={initials}
        onReact={onReact}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onForward={onForward}
        onScrollToMessage={scrollToMessage}
      />
    );
  }
  
  // Regular text message
  return (
    <MessageBubble
      message={msg}
      isOwn={msg.senderId === currentUserId}
      showAvatar={showAvatars && (isGroup || msg.senderId !== currentUserId)}
      avatar={msg.avatar}
      senderName={msg.senderName}
      time={msg.createdAt}
      status={msg.status}
      initials={initials}
      messageType={msg.type || 'text'}
      onReact={onReact}
      onReply={onReply}
      onEdit={onEdit}
      onDelete={onDelete}
      onScrollToMessage={scrollToMessage}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.msg.id === nextProps.msg.id &&
    prevProps.msg.text === nextProps.msg.text &&
    prevProps.msg.isEdited === nextProps.msg.isEdited &&
    JSON.stringify(prevProps.msg.reactions) === JSON.stringify(nextProps.msg.reactions) &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.showAvatars === nextProps.showAvatars &&
    prevProps.isGroup === nextProps.isGroup
  );
});

function formatDate(dateObj) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  ) {
    return 'Today';
  } else if (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  } else {
    return dateObj.toLocaleDateString();
  }
}

const MessageList = forwardRef(function MessageList({ 
  messages, 
  currentUserId, 
  showAvatars = true, 
  isGroup = false,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false
}, ref) {
  const flatListRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const shouldAutoScrollRef = useRef(true); // Whether we should auto-scroll
  const lastMessageIdRef = useRef(null); // Track the last message ID to detect real new messages
  const scrollPositionRef = useRef(null); // Track scroll position for load more
  const currentScrollOffsetRef = useRef(0); // Track current scroll offset

  // Group messages by date
  const grouped = {};
  
  // Validate messages array - store validation result instead of early return
  const hasValidMessages = messages && messages.length > 0;
  
  // Smart function to scroll to bottom only when appropriate
  const scrollToBottom = (animated = true, force = false) => {
    if (flatListRef.current) {
      // Only auto-scroll if user is at bottom OR if forced
      if (shouldAutoScrollRef.current || force) {
        flatListRef.current.scrollToEnd({ animated });
      }
    }
  };


  // Flatten data structure for proper FlatList virtualization
  // Each item is either a date header or a message
  const flatData = useMemo(() => {
    const items = [];
    
    // First, deduplicate messages by ID
    const uniqueMessages = [];
    const seenIds = new Set();
    
    if (messages && Array.isArray(messages)) {
      messages.forEach((msg) => {
        if (msg && msg.id && !seenIds.has(msg.id)) {
          seenIds.add(msg.id);
          uniqueMessages.push(msg);
        }
      });
    }
    
    // Process deduplicated messages and create flat structure
    let currentDateKey = null;
    
    uniqueMessages.forEach((msg) => {
      let dateObj = null;
      
      // Try to parse createdAt timestamp
      if (msg.createdAt) {
        if (typeof msg.createdAt.toDate === 'function') {
          dateObj = msg.createdAt.toDate();
        } else if (typeof msg.createdAt === 'string' || typeof msg.createdAt === 'number') {
          dateObj = new Date(msg.createdAt);
        }
      }
      
      // Get date key for this message
      let dateKey = 'Recent';
      if (dateObj && !isNaN(dateObj.getTime())) {
        dateKey = formatDate(dateObj);
      }
      
      // If this is a new date, add a date header
      if (dateKey !== currentDateKey) {
        items.push({ type: 'date', date: dateKey, id: `date-${dateKey}` });
        currentDateKey = dateKey;
      }
      
      // Add the message
      items.push({ type: 'message', data: msg, id: msg.id });
    });
    
    return items;
  }, [messages]);
  
  // Validate flatData before rendering
  const hasValidData = flatData.length > 0;

  // Removed duplicate MessageItem - using MemoizedMessageItem instead

  // Add getItemLayout for better scroll performance
  const getItemLayout = useCallback((data, index) => {
    // Estimate heights: date header = 40px, message = 100px average
    const ESTIMATED_DATE_HEIGHT = 40;
    const ESTIMATED_MESSAGE_HEIGHT = 100;
    
    let offset = 0;
    let length = ESTIMATED_MESSAGE_HEIGHT;
    
    // Calculate offset by summing heights of previous items
    for (let i = 0; i < index; i++) {
      const item = data[i];
      if (item.type === 'date') {
        offset += ESTIMATED_DATE_HEIGHT;
      } else {
        offset += ESTIMATED_MESSAGE_HEIGHT;
      }
    }
    
    // Set length for current item
    if (data[index]?.type === 'date') {
      length = ESTIMATED_DATE_HEIGHT;
    }
    
    return { length, offset, index };
  }, []);

  // Handle scroll to index failures gracefully
  const onScrollToIndexFailed = useCallback((info) => {
    // Wait for layout and try again
    setTimeout(() => {
      if (flatListRef.current && info.index < flatData.length) {
        flatListRef.current.scrollToIndex({
          index: info.index,
          animated: false,
        });
      }
    }, 100);
  }, [flatData.length]);

  // Optimized renderItem function with useCallback - handles both date headers and messages
  const renderItem = useCallback(({ item }) => {
    if (item.type === 'date') {
      return <Text style={styles.date}>{item.date}</Text>;
    }
    
    if (item.type === 'message') {
      const msg = item.data;
      
      // Validate message object
      if (!msg.id || !msg.senderId) {
        return null;
      }
      
      return (
        <MemoizedMessageItem
          msg={msg}
          currentUserId={currentUserId}
          showAvatars={showAvatars}
          isGroup={isGroup}
          onReact={onReact}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onForward={onForward}
          scrollToMessage={scrollToMessage}
        />
      );
    }
    
    return null;
  }, [currentUserId, showAvatars, isGroup, onReact, onReply, onEdit, onDelete, onForward, scrollToMessage]);

  // Simple scroll handler - no load more functionality
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    // Track current scroll offset for load more functionality
    currentScrollOffsetRef.current = offsetY;
    
    // Update auto-scroll behavior based on scroll position
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    
    // If user is near the bottom, enable auto-scroll for new messages
    if (offsetY + layoutHeight >= contentHeight - 100) {
      shouldAutoScrollRef.current = true;
    } else {
      shouldAutoScrollRef.current = false;
    }
  };
 
  // Function to scroll to a specific message
  const scrollToMessage = (messageId) => {
    
    // First, try to find the message in the flat messages array (more reliable)
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
      
      if (flatListRef.current) {
        try {
          // Special handling for the last message (bottom of chat)
          if (messageIndex === messages.length - 1) {
            flatListRef.current.scrollToEnd({ animated: true });
            return;
          }
          
          // Find the index in flatData
          const flatIndex = flatData.findIndex(item => item.type === 'message' && item.data.id === messageId);
          
          if (flatIndex !== -1) {
            flatListRef.current.scrollToIndex({
              index: flatIndex,
              animated: true,
              viewPosition: 0.5,
            });
            return;
          }
        } catch (error) {
          
          // Fallback: try scrollToEnd for any error
          try {
            flatListRef.current.scrollToEnd({ animated: true });
          } catch (fallbackError) {
          }
        }
      } else {
      }
    } else {
      
      // Show a user-friendly message
    }
  };

  // Expose scrollToMessage function to parent component
  useImperativeHandle(ref, () => ({
    scrollToMessage
  }));

  // Scroll to bottom when messages change (new message added)
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      // Check if new messages were added at the end (new messages) or beginning (older messages)
      const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
      const isNewMessage = lastMessageId && lastMessageId !== lastMessageIdRef.current;
      
      if (isNewMessage) {
        // Only scroll for new messages at the end, not when loading older messages
        shouldAutoScrollRef.current = true;
        
        // Always scroll to bottom for new messages (immediate visibility)
        setTimeout(() => {
          scrollToBottom(true, true); // Force scroll to bottom
        }, 50); // Reduced delay for immediate visibility
      } else {
        // This is loading older messages - preserve scroll position
        if (scrollPositionRef.current && flatListRef.current) {
          setTimeout(() => {
            // Restore scroll position to maintain visual continuity
            flatListRef.current.scrollToOffset({
              offset: scrollPositionRef.current,
              animated: false
            });
          }, 100);
        }
      }
      
      // Update the message count reference
      lastMessageCountRef.current = messages.length;
      
      // Update the last message ID reference
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        lastMessageIdRef.current = lastMessage.id;
      }
    }
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (flatData.length > 0) {
      // Force scroll on initial load since user hasn't scrolled yet
      setTimeout(() => {
        scrollToBottom(false, true);
      }, 100); // Reduced delay for faster initial scroll
    }
  }, []);




  // Check validation conditions and return early if needed
  if (!hasValidMessages || !hasValidData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages to display</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={flatData}
      keyExtractor={(item) => item.id}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
      inverted={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      removeClippedSubviews={Platform.OS === 'android'}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={15}
      updateCellsBatchingPeriod={100}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={onScrollToIndexFailed}
      maintainVisibleContentPosition={null}
      onLayout={() => {
        // Scroll to end on initial layout
        if (flatData.length > 0) {
          setTimeout(() => {
            if (flatListRef.current) {
              scrollToBottom(false, true);
            }
          }, 100);
        }
      }}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={{ 
        paddingVertical: 8,
        flexGrow: 1,
        minHeight: '100%'
      }}
        ListHeaderComponent={
          <View>
            {hasMore && onLoadMore ? (
                 <TouchableOpacity 
                   style={styles.loadMoreButton}
                   onPress={() => {
                     // Capture current scroll position before loading
                     scrollPositionRef.current = currentScrollOffsetRef.current;
                     onLoadMore();
                   }}
                   disabled={isLoadingMore}
                 >
                   <Text style={styles.loadMoreButtonText}>
                     {isLoadingMore ? 'Loading older messages...' : 'Load older messages'}
                   </Text>
                 </TouchableOpacity>
            ) : !hasMore && messages.length > 0 ? (
              <View style={styles.paginationIndicator}>
                <Text style={styles.paginationText}>beginning of conversation</Text>
              </View>
            ) : null}
          </View>
        }
      // ListFooterComponent={
      //   <View style={styles.listFooter}>
      //     <Text style={styles.footerText}>End of messages</Text>
      //   </View>
      // }
    />
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  date: {
    alignSelf: 'center',
    backgroundColor: '#e5e7eb',
    color: '#64748b',
    fontSize: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginVertical: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
         loadMoreButton: {
           backgroundColor: 'transparent',
           borderWidth: 1,
           borderColor: '#3b82f6',
           borderRadius: 8,
           paddingVertical: 10,
           paddingHorizontal: 16,
           marginHorizontal: 16,
           marginVertical: 8,
           alignItems: 'center',
         },
         loadMoreButtonText: {
           color: '#3b82f6',
           fontSize: 13,
           fontWeight: '500',
         },
  paginationIndicator: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#e0f2fe',
    borderBottomWidth: 1,
    borderBottomColor: '#cceeff',
  },
  paginationText: {
    color: '#3b82f6',
    fontSize: 14,
    fontStyle: 'italic',
  },
  paginationSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  listFooter: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    fontStyle: 'italic',
  },
  newMessageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  newMessageText: {
    color: '#3b82f6',
    fontSize: 14,
    fontStyle: 'italic',
    marginRight: 10,
  },
  newMessageButton: {
    color: '#3b82f6',
    fontSize: 14,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
});

export default MessageList; 