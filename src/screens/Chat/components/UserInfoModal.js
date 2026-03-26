import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function UserInfoModal({
  visible,
  onClose,
  userData,
  isGroupChat = false,
  groupName = '',
}) {
  if (!visible) {
    return null;
  }


  if (!userData) {

    return (
      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerText}>User Information</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading user information...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }   

  const getInitials = () => {
    const firstName = userData.firstName || userData.first_name || '';
    const lastName = userData.lastName || userData.last_name || '';
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (lastName) {
      return lastName[0].toUpperCase();
    } else if (userData.email) {
      return userData.email[0].toUpperCase();
    }
    return '?';
  };
  const getFullName = () => {
    const firstName = userData.firstName || userData.first_name || '';
    const lastName = userData.lastName || userData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const result = fullName || userData.email || 'Unknown User';

    return result;
  };

  const getStatusText = () => {
    if (userData.isActive) {
      return 'Online';
    } else if (userData.lastSeen) {
      try {
        // Handle different date formats
        let lastSeenDate;
        if (userData.lastSeen && typeof userData.lastSeen === 'object' && userData.lastSeen.toDate) {
          // Firestore timestamp
          lastSeenDate = userData.lastSeen.toDate();
        } else if (userData.lastSeen) {
          // Regular date string or timestamp (including ISO strings)
          lastSeenDate = new Date(userData.lastSeen);
        } else {
          return 'Offline';
        }
        
        if (isNaN(lastSeenDate.getTime())) {
          return 'Offline';
        }
        
        const now = new Date();
        const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
        
        
        if (diffInMinutes < 1) {
          return 'Just now';
        } else if (diffInMinutes < 60) {
          return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) {
          const hours = Math.floor(diffInMinutes / 60);
          return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
          const days = Math.floor(diffInMinutes / 1440);
          return `${days} day${days > 1 ? 's' : ''} ago`;
        }
      } catch (error) {
        return 'Offline';
      }
    }
    return 'Offline';
  };

  const getStatusColor = () => {
    if (userData.isActive) {
      return '#10b981'; // Green
    } else if (userData.lastSeen) {
      return '#f59e0b'; // Yellow
    }
    return '#6b7280'; // Gray
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{flex: 1, backgroundColor: 'white', marginTop: Platform.OS === 'ios' ? 44 : 0}}>
        {/* Header */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold'}}>User Info</Text>
          <TouchableOpacity onPress={onClose} style={{padding: 10, backgroundColor: '#e0e0e0', borderRadius: 20}}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={{alignItems: 'center', padding: 30, backgroundColor: '#667eea'}}>
          {userData.avatar ? (
            <Image source={{ uri: userData.avatar }} style={{width: 80, height: 80, borderRadius: 40, marginBottom: 15}} />
          ) : (
            <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginBottom: 15}}>
              <Text style={{color: 'white', fontSize: 32, fontWeight: 'bold'}}>{getInitials()}</Text>
            </View>
          )}
          
          <Text style={{fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10}}>{getFullName()}</Text>
          
          <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20}}>
            <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: getStatusColor(), marginRight: 8}} />
            <Text style={{fontSize: 14, fontWeight: '600', color: getStatusColor()}}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={{flex: 1, padding: 20}}>
          {/* User Details */}
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, backgroundColor: '#f9f9f9', marginBottom: 8, borderRadius: 8}}>
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <View style={{marginLeft: 15, flex: 1}}>
                <Text style={{fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 4}}>FIRST NAME</Text>
                <Text style={{fontSize: 16, color: '#333', fontWeight: '500'}}>
                  {userData.firstName || userData.first_name || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, backgroundColor: '#f9f9f9', marginBottom: 8, borderRadius: 8}}>
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <View style={{marginLeft: 15, flex: 1}}>
                <Text style={{fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 4}}>LAST NAME</Text>
                <Text style={{fontSize: 16, color: '#333', fontWeight: '500'}}>
                  {userData.lastName || userData.last_name || 'Not provided'}
                </Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, backgroundColor: '#f9f9f9', marginBottom: 8, borderRadius: 8}}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <View style={{marginLeft: 15, flex: 1}}>
                <Text style={{fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 4}}>EMAIL</Text>
                <Text style={{fontSize: 16, color: '#333', fontWeight: '500'}}>
                  {userData.email || 'Not provided'}
                </Text>
              </View>
            </View>

            {userData.lastSeen && (
              <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, backgroundColor: '#f9f9f9', marginBottom: 8, borderRadius: 8}}>
                <Ionicons name="time-outline" size={20} color="#6b7280" />
                <View style={{marginLeft: 15, flex: 1}}>
                  <Text style={{fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 4}}>LAST SEEN</Text>
                  <Text style={{fontSize: 16, color: '#333', fontWeight: '500'}}>
                    {(() => {
                      try {
                        // Handle different date formats
                        let date;
                        if (userData.lastSeen && typeof userData.lastSeen === 'object' && userData.lastSeen.toDate) {
                          // Firestore timestamp
                          date = userData.lastSeen.toDate();
                        } else if (userData.lastSeen) {
                          // Regular date string or timestamp (including ISO strings)
                          date = new Date(userData.lastSeen);
                        } else {
                          return 'Unknown';
                        }
                        
                        if (isNaN(date.getTime())) {
                          return 'Unknown';
                        }
                        return date.toLocaleString();
                      } catch (error) {
                        return 'Unknown';
                      }
                    })()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fafbfc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#667eea',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
