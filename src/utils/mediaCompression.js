import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// Configuration constants
const MAX_IMAGE_SIZE_KB = 2048; // 2MB for images
const MAX_VIDEO_SIZE_KB = 102400; // 100MB for videos
const MAX_IMAGE_DIMENSION = 1920; // Max width/height for images
const MAX_VIDEO_DIMENSION = 1280; // Max width/height for videos

/**
 * Calculate file size in KB from base64 string
 * @param {string} base64 - Base64 encoded string
 * @returns {number} Size in KB
 */
const getBase64SizeInKB = (base64) => {
  if (!base64) return 0;
  // Base64 size formula: (length * 3/4) - padding
  const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  const bytes = (base64.length * 3) / 4 - padding;
  return Math.ceil(bytes / 1024);
};

/**
 * Get file size in KB from URI
 * @param {string} uri - File URI
 * @returns {Promise<number>} Size in KB
 */
const getFileSizeInKB = async (uri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return Math.ceil(fileInfo.size / 1024);
  } catch (error) {
    console.log('Error getting file size:', error);
    return 0;
  }
};

/**
 * Compress image to reduce file size
 * @param {string} uri - Image URI
 * @param {string} fileName - Original file name
 * @param {number} maxSizeKB - Maximum size in KB (default: MAX_IMAGE_SIZE_KB)
 * @returns {Promise<Object>} Compressed image data
 */
export const compressImage = async (uri, fileName, maxSizeKB = MAX_IMAGE_SIZE_KB) => {
  try {

    
    // Get original file size
    const originalSizeKB = await getFileSizeInKB(uri);

    
    // If already under limit, return as is
    if (originalSizeKB <= maxSizeKB) {

      return {
        uri,
        name: fileName,
        size: originalSizeKB * 1024,
        compressed: false
      };
    }

    // Start with reasonable dimensions and quality
    let targetWidth = MAX_IMAGE_DIMENSION;
    let quality = 0.9;
    
    let lastResult = null;
    let attempts = 0;
    const maxAttempts = 10;

    // Try different compression settings
    for (let i = 0; i < maxAttempts; i++) {
      attempts = i + 1;
      
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: Math.max(200, Math.floor(targetWidth)) } }],
        {
          compress: Math.max(0.3, quality),
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false, // We don't need base64 for file uploads
        }
      );

      lastResult = result;
      const compressedSizeKB = await getFileSizeInKB(result.uri);
      // Check if we're under the size limit
      if (compressedSizeKB <= maxSizeKB) {

        return {
          uri: result.uri,
          name: fileName.replace(/\.[^/.]+$/, '.jpg'), // Ensure .jpg extension
          type: 'image/jpeg', // Set proper MIME type for compressed images
          size: compressedSizeKB * 1024,
          compressed: true,
          originalSize: originalSizeKB * 1024
        };
      }

      // Adjust compression parameters
      if (quality > 0.4) {
        quality -= 0.1; // Reduce quality first
      } else {
        targetWidth = Math.floor(targetWidth * 0.8); // Then reduce dimensions
      }
    }

    // Return best effort result
    const finalSizeKB = lastResult ? await getFileSizeInKB(lastResult.uri) : originalSizeKB;
    
    return {
      uri: lastResult?.uri || uri,
      name: fileName.replace(/\.[^/.]+$/, '.jpg'),
      type: 'image/jpeg', // Set proper MIME type for compressed images
      size: finalSizeKB * 1024,
      compressed: true,
      originalSize: originalSizeKB * 1024
    };

  } catch (error) {

    // Return original file if compression fails
    const originalSizeKB = await getFileSizeInKB(uri);
    return {
      uri,
      name: fileName,
      type: 'image/jpeg', // Preserve original type or set default
      size: originalSizeKB * 1024,
      compressed: false,
      error: error.message
    };
  }
};

/**
 * Compress video (basic implementation - videos are harder to compress)
 * @param {string} uri - Video URI
 * @param {string} fileName - Original file name
 * @param {number} maxSizeKB - Maximum size in KB (default: MAX_VIDEO_SIZE_KB)
 * @returns {Promise<Object>} Video data (compression limited)
 */
export const compressVideo = async (uri, fileName, maxSizeKB = MAX_VIDEO_SIZE_KB) => {
  try {
    console.log('🎥 Starting video compression check...');
    
    const originalSizeKB = await getFileSizeInKB(uri);
    console.log(`🎥 Video size: ${originalSizeKB} KB (${Math.round(originalSizeKB / 1024)} MB)`);

    
    // For videos, we can only do basic resizing
    // Most video compression requires server-side processing
    if (originalSizeKB <= maxSizeKB) {

      return {
        uri,
        name: fileName,
        type: 'video/mp4', // Set proper MIME type for videos
        size: originalSizeKB * 1024,
        compressed: false
      };
    }

    // Video compression is very limited in expo-image-manipulator
    // Most video compression requires server-side processing
    console.log('⚠️ Video compression limited - expo-image-manipulator has minimal video support');
    
    return {
      uri,
      name: fileName,
      type: 'video/mp4', // Set proper MIME type for videos
      size: originalSizeKB * 1024,
      compressed: false,
      error: 'Video compression not supported - file exceeds 100MB limit'
    };

  } catch (error) {

    const originalSizeKB = await getFileSizeInKB(uri);
    return {
      uri,
      name: fileName,
      type: 'video/mp4', // Set proper MIME type for videos
      size: originalSizeKB * 1024,
      compressed: false,
      error: error.message
    };
  }
};

/**
 * Compress media file (image or video) based on type
 * @param {Object} fileData - File data object
 * @returns {Promise<Object>} Compressed file data
 */
export const compressMedia = async (fileData) => {
  const { uri, name, type, size } = fileData;
  
  console.log('🎯 Starting media compression...', { name, type, size });
  
  // Determine if it's an image or video
  const isImage = type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name);
  const isVideo = type?.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(name);
  
  if (isImage) {
    return await compressImage(uri, name);
  } else if (isVideo) {
    return await compressVideo(uri, name);
  } else {
    console.log('📄 File is not an image or video, skipping compression');
    return {
      ...fileData,
      compressed: false,
      type: fileData.type || 'application/octet-stream' // Ensure type is always present
    };
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default {
  compressImage,
  compressVideo,
  compressMedia,
  formatFileSize,
  MAX_IMAGE_SIZE_KB,
  MAX_VIDEO_SIZE_KB
};
