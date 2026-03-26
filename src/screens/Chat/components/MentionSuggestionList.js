import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";

export default function MentionSuggestionList({
  members,
  searchQuery,
  onSelectMember,
  currentUserId,
}) {
  // Filter members based on search query (excluding current user)
  const filteredMembers = members.filter((member) => {
    if (member.isCurrentUser || member.userId === currentUserId || member.id === currentUserId) {
      return false;
    }

    const fullName = `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();
    const email = (member.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query);
  });

  if (filteredMembers.length === 0) {
    return null;
  }

  const renderMember = ({ item }) => {
    const displayName = `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email || "Unknown";
    const initials = `${(item.firstName || "?").charAt(0)}${(item.lastName || "?").charAt(0)}`.toUpperCase();

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => onSelectMember(item)}
        activeOpacity={0.7}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{displayName}</Text>
          {item.email && (
            <Text style={styles.memberEmail} numberOfLines={1}>
              {item.email}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.userId || item.id || item.email}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 200,
    minHeight: 100,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  list: {
    flex: 1,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: "#6b7280",
  },
});

