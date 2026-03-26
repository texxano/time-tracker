import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ProfileImagePicker({
  visible,
  onClose,
  onImageSelected,
  userId
}) {

  const MAX_SIZE_KB = 200;

  const base64SizeInKB = (base64) => {
    if (!base64) return 0;
    // Base64 size formula: (length * 3/4) - padding
    const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
    const bytes = (base64.length * 3) / 4 - padding;
    return Math.ceil(bytes / 1024);
  };

  const optimizeImageToUnderLimit = async (uri, width, height, fileNameHint = 'image') => {
    try {

      
      // Start with a reasonable max dimension
      let targetWidth = width || 1024;
      let targetHeight = height || 1024;
      // Maintain aspect ratio based on width only; manipulator keeps ratio if one side provided
      let compress = 0.9;

      // Cap initial size
      if (targetWidth > 1024) targetWidth = 1024;


      let lastResult = null;
      for (let i = 0; i < 12; i++) {

        
        const result = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: Math.max(200, Math.floor(targetWidth)) } }],
          {
            compress: Math.max(0.3, compress),
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        lastResult = result;
        const sizeKB = base64SizeInKB(result.base64);

        
        if (sizeKB <= MAX_SIZE_KB) {

          return {
            uri: result.uri,
            base64: result.base64,
            fileName: `${fileNameHint}.jpg`,
          };
        }

        // Reduce quality first, then dimensions
        if (compress > 0.4) {
          compress -= 0.1;

        } else {
          targetWidth = Math.floor(targetWidth * 0.85);

        }
      }

      // Return best-effort, even if slightly over
      const finalSizeKB = lastResult ? base64SizeInKB(lastResult.base64) : 'unknown';

      return {
        uri: lastResult?.uri || uri,
        base64: lastResult?.base64,
        fileName: `${fileNameHint}.jpg`,
      };
    } catch (err) {
      // Error during optimization
      return null;
    }
  };

  const openCamera = async () => {
  
    
    try {
      // Request camera permissions first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {

        Alert.alert("Permission Required", "Please grant permission to access your camera.");
        return;
      }
    
      // Use ImagePicker for camera on both platforms for consistency
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
        exif: false, // Disable EXIF data to reduce file size
      });
      

      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        
        const optimized = await optimizeImageToUnderLimit(asset.uri, asset.width, asset.height, asset.fileName || `camera_${Date.now()}`);
        if (!optimized?.base64) {

          Alert.alert("Error", "Failed to process the image. Please try again.");
          return;
        }

        const imageData = {
          userId: userId,
          base64Content: optimized.base64,
          fileName: optimized.fileName,
          uri: optimized.uri,
        };

        // Safety check for size
        const finalSizeKB = base64SizeInKB(imageData.base64Content);

        
        if (finalSizeKB > MAX_SIZE_KB) {

          Alert.alert('Image too large', 'Could not compress under 200 KB. Please choose a smaller image.');
          return;
        }


        onImageSelected(imageData);
        onClose(); // Close modal after successful image selection
      } else {

        onClose(); // Close modal when canceled
      }
    } catch (error) {

      Alert.alert("Camera Error", `Failed to open camera: ${error.message || 'Unknown error'}`);
      onClose(); // Close modal on error
    }
  };


  const pickImage = async () => {
    onClose(); // Close the initial modal
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please grant permission to access your photo library.");
        return;
      }

      // Launch image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        
        const optimized = await optimizeImageToUnderLimit(asset.uri, asset.width, asset.height, asset.fileName || `image_${Date.now()}`);
        if (!optimized?.base64) return;

        const imageData = {
          userId: userId,
          base64Content: optimized.base64,
          fileName: optimized.fileName,
          uri: optimized.uri,
        };

        // Safety check for size
        if (base64SizeInKB(imageData.base64Content) > MAX_SIZE_KB) {
          Alert.alert('Image too large', 'Could not compress under 200 KB. Please choose a smaller image.');
          return;
        }

        onImageSelected(imageData);
      }
    } catch (error) {
      // Error occurred
    }
  };



  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Add Profile Image</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={openCamera}
            style={styles.optionButton}
          >
            <Ionicons name="camera-outline" size={24} color="#1976d2" />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={pickImage}
            style={styles.optionButton}
          >
            <Ionicons name="images-outline" size={24} color="#1976d2" />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: { 
    backgroundColor: "white", 
    borderRadius: 16, 
    width: "85%",
    maxWidth: 350,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
  },
}); 