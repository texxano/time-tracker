import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Modal, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Video } from 'expo-av';
import FileUploadService from '../../../services/Chat/fileUploadService';
import { chatService } from '../../../services/Chat/Chat.services';

const { width } = Dimensions.get('window');

export default function FilePreview({ fileData, onRemove }) {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [readUrl, setReadUrl] = useState(null);
  const [isLoadingReadUrl, setIsLoadingReadUrl] = useState(false);
  
  // Safety check for fileData
  if (!fileData || !fileData.name) {
    return null;
  }
  
  const fileType = FileUploadService.getFileType(fileData.name);
  const fileSize = FileUploadService.formatFileSize(fileData.size);
  const fileIcon = FileUploadService.getFileIcon(fileType);
  
  // Fetch read URL for videos and images when fileData changes
  useEffect(() => {
    const fetchReadUrl = async () => {

      
      // Only fetch read URL for videos and images that have a URL
      if ((fileType === 'video' || fileType === 'image') && fileData.url && !readUrl && !isLoadingReadUrl) {
        setIsLoadingReadUrl(true);
        try {
              const response = await chatService.getReadUrl(fileData.url);
          setReadUrl(response.url || response.readUrl);
        } catch (error) {
          // Keep the original fileData.url as fallback
        } finally {
          setIsLoadingReadUrl(false);
        }
      }
    };

    fetchReadUrl();
  }, [fileData, fileType, readUrl, isLoadingReadUrl]);

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return (
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => setShowFullScreen(true)} style={styles.imageTouchable}>
              {isLoadingReadUrl && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              )}
              <Image
                source={{ uri: readUrl || fileData.url || fileData.uri }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        );
        
      case 'video':
        return (
          <View style={styles.videoContainer}>
            {readUrl && (
              <>
                <Video
                  source={{ uri: readUrl }}
                  style={styles.video}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay={false}
                />
                <View style={styles.videoPlayOverlay}>
                  <Ionicons name="play-circle" size={48} color="#ffffff" />
                </View>
              </>
            )}
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        );
        
      default:
        return (
          <View style={styles.documentContainer}>
            <View style={styles.documentIcon}>
              <Ionicons name={fileIcon} size={32} color="#64748b" />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.fileName} numberOfLines={2}>
                {fileData.name}
              </Text>
              <Text style={styles.fileSize}>{fileSize}</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderPreview()}
      
      {/* Full Screen Modal */}
      <Modal
        visible={showFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullScreen(false)}
      >
        <View style={styles.fullScreenContainer}>
          {fileType === 'image' && (
            <TouchableOpacity 
              style={styles.fullScreenCloseButton}
              onPress={() => setShowFullScreen(false)}
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          )}
          
                     {fileType === 'image' && (
             <Image
               source={{ uri: readUrl || fileData.url || fileData.uri }}
               style={styles.fullScreenImage}
               resizeMode="contain"
             />
           )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    width: "100%",
    height: 200,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: '100%',
  },
  fullScreenVideo: {
    width: width,
    height: '100%',
    resizeMode: 'contain',
  },
  fullScreenVideoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  videoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  loadingOverlay: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  documentIcon: {
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748b',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
}); 