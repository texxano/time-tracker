import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import { compressMedia } from "../../../utils/mediaCompression";
import { chatService } from "../../../services/Chat/Chat.services";
import { uploadToAzureBlobChunked, uploadToAzureBlobSimple } from "../../../utils/azureUpload";

// Helper function to get content type
export const getContentType = (fileType) => {
  // Handle undefined or null fileType
  if (!fileType || typeof fileType !== 'string') {
    // console.log('⚠️ fileType is undefined or invalid:', fileType);
    return "application/octet-stream";
  }

  const lowerType = fileType.toLowerCase();
  
  // Check for image types
  if (lowerType.includes("image")) {
    return "image";
  }

  // Check for video types
  if (lowerType.includes("video")) {
    return "video";
  }

  // Check for document types
  if (lowerType.includes("pdf") ||
      lowerType.includes("document") ||
      lowerType.includes("word") ||
      lowerType.includes("excel") ||
      lowerType.includes("powerpoint") ||
      lowerType.includes("presentation")) {
    return "document";
  }

  // Default fallback
  return "application/octet-stream";
};

// Main file selection and upload handler
export const handleFileSelect = async (
  fileData,
  setSelectedFile,
  setIsSelectingFile,
  setUploadProgress,
  setIsConfirmingUpload,

) => {
  setIsSelectingFile(true);
  setUploadProgress(10); // Start progress for file selection
  
  // Add immediate feedback for video processing
  if (fileData.type && fileData.type.includes('video')) {
    // console.log("🎥 Video detected - starting processing...");
    setUploadProgress(20); // Show immediate progress for video
    
    // Add a small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  try {
    // console.log("Starting file upload process...");
    // console.log("Original file data:", fileData);
    
    // Show progress for compression step
    setUploadProgress(30);
    const compressedData = await compressMedia(fileData);
    // console.log("Media compression completed:", compressedData);
    
    // Show progress after compression
    setUploadProgress(50);
  
    // Use compressed data for upload
    const finalFileData = compressedData;
    // console.log("Final file data:", finalFileData);
    
    // Ensure type is present
    if (!finalFileData.type) {
      // console.log("⚠️ Missing type, setting default");
      finalFileData.type = 'application/octet-stream';
    }
    
    // Show progress for file validation
    setUploadProgress(60);
    
    // Check if file type is supported by backend
    const fileExtension = finalFileData.name.split(".").pop()?.toLowerCase();
    const supportedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "tiff",
      "webp",
      "mp4",
      "mov",
      "mkv",
      "avi",
      "wmv",
      "flv",
      "webm",
      "mpeg",
      "3gp",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
    ];

    if (!supportedExtensions.includes(fileExtension)) {
      setSelectedFile(finalFileData);
      setIsSelectingFile(false);
      return;
    }

    // Check file size (10MB limit)
    const isVideo = finalFileData.type.includes("video");
    const maxFileSize = isVideo ? 100 * 1024 * 1024 : 50 * 1024 * 1024; // 100MB for videos, 50MB for others
    if (finalFileData.size > maxFileSize) {
      Alert.alert(
        "File Too Large",
        "File size must be less than 100MB. Please choose a smaller file.",
        [{ text: "OK" }]
      );
      setIsSelectingFile(false);
      return;
    }

    // Step 1: Get upload URL from server
    setUploadProgress(20); // Progress for getting upload URL
    // console.log("Getting upload URL from server...");
    const uploadInfo = await chatService.getUploadUrl(finalFileData.name);
    // console.log("Upload URL received:", uploadInfo);



    // Step 4: Send binary data to Azure using XMLHttpRequest
    setUploadProgress(70); // Progress for Azure upload

    const contentType = getContentType(fileData.type);


       // Choose upload method based on file size
       const isLargeFile = finalFileData.size > 10 * 1024 * 1024; // 10MB threshold
       // console.log(`File size: ${finalFileData.size} bytes, isLargeFile: ${isLargeFile}`);
       let uploadResult;
       if (isLargeFile) {
        // Use chunked upload for large files (better for videos)
        // console.log("Using chunked upload...");
        uploadResult = await uploadToAzureBlobChunked(
          finalFileData,
          uploadInfo.uploadUrl,
          (progress) => {
            setUploadProgress(70 + progress * 0.25); // 70-95% range for upload
          }
        );
      } else {
        // Use simple upload for smaller files
        // console.log("Using simple upload...");
        uploadResult = await uploadToAzureBlobSimple(
          finalFileData,
          uploadInfo.uploadUrl,
          (progress) => {
            setUploadProgress(70 + progress * 0.25); // 70-95% range for upload
          }
        );
      }

      // console.log("Upload result:", uploadResult);
      if (!uploadResult.success) {
        // Upload failed
        throw new Error(uploadResult.error || 'Upload failed');
      }

     // Confirm upload automatically
     try {
      // Use the fileName from uploadInfo instead of finalFileData.name
      await chatService.confirmUpload({
        uniqueFileName: uploadInfo.uniqueFileName, // Use the server-generated fileName
      });
      setUploadProgress(100); // Complete the upload process
    } catch (confirmError) {
      // Continue anyway since the file was uploaded to Azure

      setUploadProgress(100); // Still complete the process
    }

    // Set the selected file with Azure URL
    setSelectedFile({
      name: finalFileData.name, // Keep original filename for display
      type: contentType, // Ensure type is always defined
      size: finalFileData.size,
      url: uploadInfo.fileUrl, // Use the file URL from server response
      uploadId: uploadInfo.uniqueFileName, // Server-generated UUID for storage
      originalName: finalFileData.name, // Preserve original name
      compressed: compressedData.compressed, // Track if file was compressed
      originalSize: compressedData.originalSize, // Track original size if compressed
    });

    // Upload completed successfully
    setUploadProgress(100);
    setIsConfirmingUpload(true);
    
    // Clear loading states after a short delay to show completion
    setTimeout(() => {
      setIsConfirmingUpload(false);
    }, 1000);

  } catch (error) {
    // Log detailed error for debugging

    // Show user-friendly error message
    let errorMessage = "Failed to upload file";
    if (error.message.includes("timeout")) {
      errorMessage =
        "Upload timed out. Please check your connection and try again.";
    } else if (error.message.includes("Network request failed")) {
      errorMessage =
        "Network error. Please check your connection and try again.";
    } else if (error.message.includes("Azure upload failed")) {
      errorMessage = "Server error. Please try again later.";
    } else {
      // Show the actual error message for debugging
      errorMessage = `Upload failed: ${error.message}`;
    }

    Alert.alert("Upload Failed", errorMessage, [{ text: "OK" }]);

    // Don't set the file if upload failed
    setSelectedFile(null);
    setIsConfirmingUpload(false);

  } finally {
    setIsSelectingFile(false);
    setUploadProgress(0);
  }
};
