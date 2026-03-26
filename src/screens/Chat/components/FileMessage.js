import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import FileUploadService from "../../../services/Chat/fileUploadService";
import { chatService } from "../../../services/Chat/Chat.services";
import MessageContextMenu from "./MessageContextMenu";
import MessageReactions from "./MessageReactions";
import LinkableText from "./LinkableText";
import { modalStyle } from "../../../asset/style/components/modalStyle";
import flex from "../../../asset/style/flex.style";
import { useIntl } from "react-intl";

const { width } = Dimensions.get("window");

const FileMessage = memo(function FileMessage({
  message,
  isOwnMessage,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onScrollToMessage,
  showAvatar,
  avatar,
  senderName,
  initials,
}) {
  const intl = useIntl();
  
  // Force re-render when reactions change
  const reactionsKey = message.reactions
    ? JSON.stringify(message.reactions)
    : "no-reactions";
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenType, setFullScreenType] = useState("image"); // 'image' or 'video'
  const [readUrl, setReadUrl] = useState(null);
  const [isLoadingReadUrl, setIsLoadingReadUrl] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress] = useState(0);

  // Get token from Redux state
  const token = useSelector((state) => state.userToken.token);

  const fileData = message.fileData;
  
  const translations = useMemo(() => ({
    reply: intl.formatMessage({ id: 'chat.message.reply' }),
    edit: intl.formatMessage({ id: 'chat.message.edit' }),
    forward: intl.formatMessage({ id: 'chat.message.forward' }),
    delete: intl.formatMessage({ id: 'chat.message.delete' }),
  }), [intl]);

  // Memoize the image source to prevent unnecessary re-renders
  const imageSource = useMemo(() => {
    return { uri: readUrl || fileData?.url || message.text };
  }, [readUrl, fileData?.url, message.text]);

  // Memoize file type calculation
  const fileType = useMemo(() => {
    if (message.type === "image") {
      return "image";
    } else if (message.type === "video") {
      return "video";
    } else if (fileData && fileData.fileName) {
      return FileUploadService.getFileType(fileData.fileName);
    }
    return "document";
  }, [message.type, fileData?.fileName]);

  // Fetch read URL for all file types
  useEffect(() => {
    const fetchReadUrl = async () => {
      // Only fetch if we have fileData.url and haven't already fetched
      if (fileData?.url && !readUrl && !isLoadingReadUrl) {
        setIsLoadingReadUrl(true);
        try {
          const response = await chatService.getReadUrl(fileData.url);
          setReadUrl(response.url || response.readUrl); // Handle different response formats
        } catch (error) {
          // Keep the original fileData.url as fallback
        } finally {
          setIsLoadingReadUrl(false);
        }
      }
    };

    fetchReadUrl();
  }, [fileData?.url, readUrl, isLoadingReadUrl]);
  // Memoize file size and icon calculations
  const fileSize = useMemo(
    () => (fileData ? FileUploadService.formatFileSize(fileData.fileSize) : ""),
    [fileData?.fileSize]
  );

  const fileIcon = useMemo(
    () => FileUploadService.getFileIcon(fileType),
    [fileType]
  );

  // Memoize icon color calculation
  const iconColor = useMemo(() => {
    switch (fileType) {
      case "pdf":
        return "#ef4444"; // Red
      case "word":
        return "#3b82f6"; // Blue
      case "excel":
        return "#10b981"; // Green
      default:
        return "#64748b"; // Default gray
    }
  }, [fileType]);

  const handleLongPress = useCallback(() => {
    setShowContextMenu(true);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  const handleReact = useCallback(
    (emoji) => {
      if (onReact) {
        onReact(message.id, emoji);
      }
    },
    [onReact, message.id]
  );

  const handleReply = useCallback(() => {
    if (onReply) {
      onReply(message);
    }
  }, [onReply, message]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(message);
    }
  }, [onEdit, message]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      if (message.type === "text") {
        onDelete(message.id, null);
      } else {
        onDelete(message.id, fileData.fileName);
      }
    }
  }, [onDelete, message.type, message.id, fileData.fileName]);

  const handleForward = useCallback(() => {
    if (onForward) {
      onForward(message);
    }
  }, [onForward, message]);

  // Get proper MIME type from file name
  const getMimeTypeFromFileName = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    const mimeTypes = {
      // Documents
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      rtf: "application/rtf",

      // Images
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      webp: "image/webp",
      svg: "image/svg+xml",

      // Videos
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      wmv: "video/x-ms-wmv",
      flv: "video/x-flv",
      webm: "video/webm",

      // Audio
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      m4a: "audio/mp4",

      // Archives
      zip: "application/zip",
      rar: "application/x-rar-compressed",
      "7z": "application/x-7z-compressed",
      tar: "application/x-tar",
      gz: "application/gzip",

      // Code
      js: "application/javascript",
      html: "text/html",
      css: "text/css",
      json: "application/json",
      xml: "application/xml",
    };

    return mimeTypes[extension] || "application/octet-stream";
  };

  // Request Android permissions for file downloads
  const requestAndroidPermissions = async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      return false;
    }
  };

  const downloadDocument = async () => {
    if (!fileData) {
      Alert.alert("File not available", "This file is no longer available");
      return;
    }

    // Request permissions on Android
    const hasPermissions = await requestAndroidPermissions();
    if (!hasPermissions) {
      Alert.alert(
        "Permission Required",
        "Storage permissions are required to download files on Android. Please grant permissions in settings."
      );
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      let downloadUrl = null;
      let urlSource = "";

      // First, try to get download URL using the document ID
      // Extract UUID from fileData.url if available, otherwise use uploadId
      let documentId = fileData.uploadId;

      // If we have a URL, try to extract the UUID from it
      if (fileData.url && fileData.url.includes("/")) {
        const urlParts = fileData.url.split("/");
        const lastPart = urlParts[urlParts.length - 1];
        // Check if it looks like a UUID (contains hyphens and is longer)
        if (lastPart.includes("-") && lastPart.length > 20) {
          documentId = lastPart;
        }
      }

      if (documentId) {
        try {
          const downloadResponse = await chatService.getDownloadUrl(documentId);

          if (downloadResponse && downloadResponse.url) {
            downloadUrl = downloadResponse.url;
            urlSource = "API getDownloadUrl";
          }
        } catch (apiError) {
          // Continue to fallback methods
        }
      }

      // Fallback 1: Try fileData.url
      if (!downloadUrl && fileData.url) {
        downloadUrl = fileData.url;
        urlSource = "fileData.url";
      }
      // Fallback 2: Try readUrl
      else if (!downloadUrl && readUrl) {
        downloadUrl = readUrl;
        urlSource = "readUrl";
      }
      // Fallback 3: Try message.text (if it's a URL)
      else if (
        !downloadUrl &&
        message.text &&
        message.text.startsWith("http")
      ) {
        downloadUrl = message.text;
        urlSource = "message.text";
      }
      // Fallback 4: Try using documentId directly as URL (if it's a valid URL)
      else if (!downloadUrl && documentId && documentId.startsWith("http")) {
        downloadUrl = documentId;
        urlSource = "documentId as URL";
      }

      if (!downloadUrl) {
        throw new Error("No download URL available from any source");
      }

      // Create a unique filename to avoid conflicts
      const timestamp = new Date().getTime();
      const fileName = fileData.fileName;

      // Use different directories based on platform
      let localUri;
      if (Platform.OS === "android") {
        // Use documents directory for Android (more accessible)
        const documentsDir = FileSystem.documentDirectory;
        localUri = `${documentsDir}${fileName}`;

        // For images and videos, try to save to media library for better sharing
        if (fileType === "image" || fileType === "video") {
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
              const asset = await MediaLibrary.createAssetAsync(localUri);
              const album = await MediaLibrary.getAlbumAsync(
                "Texxano Downloads"
              );
              if (album) {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              } else {
                await MediaLibrary.createAlbumAsync(
                  "Texxano Downloads",
                  asset,
                  false
                );
              }
            }
          } catch (mediaError) {
            // Continue with regular download if media library fails
          }
        }
      } else {
        // Use cache directory for iOS
        const cacheDir = FileSystem.cacheDirectory;
        localUri = `${cacheDir}${fileName}`;
      }

      // Download file with authentication headers

      let downloadResult;

      try {
        // Try using FileSystem.downloadAsync first
        downloadResult = await FileSystem.downloadAsync(downloadUrl, localUri, {
          headers: {
            "Content-Type": fileData.fileType || "application/octet-stream",
            Authorization: token ? "Bearer " + token : "",
          },
        });
      } catch (downloadError) {
        // Fallback: Try using http.download for authenticated requests
        try {
          const http = require("../../services/http");
          const response = await http.download(downloadUrl);

          // Save the response data to file
          await FileSystem.writeAsStringAsync(localUri, response.data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          downloadResult = {
            status: 200,
            uri: localUri,
            mimeType: fileData.fileType || "application/octet-stream",
          };
        } catch (httpError) {
          throw downloadError; // Throw original error
        }
      }

      // Check if we got an XML error response (indicates 404 or auth issue)
      if (
        downloadResult.status === 404 ||
        downloadResult.mimeType === "application/xml"
      ) {
        // Try to get a fresh URL from the API if we haven't already
        if (urlSource !== "API getDownloadUrl" && fileData.fileName) {
          try {
            const freshResponse = await chatService.getDownloadUrl(
              fileData.fileName
            );
            if (freshResponse && freshResponse.url) {
              const retryResult = await FileSystem.downloadAsync(
                freshResponse.url,
                localUri,
                {
                  headers: {
                    "Content-Type":
                      fileData.fileType || "application/octet-stream",
                    Authorization: token ? "Bearer " + token : "",
                  },
                }
              );

              if (retryResult.status === 200) {
                downloadResult = retryResult;
              } else {
                throw new Error(
                  `Retry failed with status: ${retryResult.status}`
                );
              }
            } else {
              throw new Error(
                "File URL is not accessible. The file may have been moved or the URL has expired."
              );
            }
          } catch (retryError) {
            throw new Error(
              "File URL is not accessible. The file may have been moved or the URL has expired."
            );
          }
        } else {
          throw new Error(
            "File URL is not accessible. The file may have been moved or the URL has expired."
          );
        }
      }

      if (downloadResult.status !== 200) {
        throw new Error(
          `Download failed with status: ${downloadResult.status}`
        );
      }

      // Check if file was actually downloaded
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        throw new Error("File was not downloaded properly");
      }

      // Show success message with platform-specific options
      if (Platform.OS === "android") {
        Alert.alert(
          "Download Complete",
          `${fileName} has been downloaded to your device.`,
          [
            {
              text: "Share or Save to",
              onPress: async () => {
                try {
                  // Get proper MIME type based on file extension
                  const mimeType = getMimeTypeFromFileName(fileName);

                  // Try to open the file with system apps
                  const isAvailable = await Sharing.isAvailableAsync();
                  if (isAvailable) {
                    await Sharing.shareAsync(localUri, {
                      mimeType: mimeType,
                      dialogTitle: `Share or Save ${fileName}`,
                    });
                  } else {
                    Alert.alert(
                      "Success",
                      "File has been saved to your Downloads folder"
                    );
                  }
                } catch (error) {
                  // Fallback: Try alternative approach
                  try {
                    // Try without MIME type
                    await Sharing.shareAsync(localUri, {
                      dialogTitle: `Share or Save ${fileName}`,
                    });
                  } catch (fallbackError) {
                    // Final fallback: Just show success message
                    Alert.alert(
                      "Success",
                      "File has been saved to your Downloads folder"
                    );
                  }
                }
              },
            },
          ]
        );
      } else {
        // iOS behavior - same as Android for consistency
        Alert.alert(
          "Download Complete",
          `${fileName} has been downloaded to your device.`,
          [
            {
              text: "Share or Save to",
              onPress: async () => {
                try {
                  // Get proper MIME type based on file extension
                  const mimeType = getMimeTypeFromFileName(fileName);

                  // Use sharing to let user choose where to save/share the file
                  await Sharing.shareAsync(localUri, {
                    mimeType: mimeType,
                    dialogTitle: `Share or Save ${fileName}`,
                    UTI: fileData.fileType || "public.data",
                  });
                } catch (error) {
                  Alert.alert("Success", "File has been saved to your device");
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      // Provide more specific error messages
      let errorMessage = "Failed to download the file. ";

      if (error.message.includes("404") || error.message.includes("XML")) {
        errorMessage +=
          "The file URL has expired or is not accessible. This is likely a server-side issue with URL generation.";
      } else if (error.message.includes("URL not accessible")) {
        errorMessage +=
          "The file URL is not accessible. Please try again later.";
      } else if (error.message.includes("No download URL")) {
        errorMessage += "No download URL is available for this file.";
      } else if (error.message.includes("Permission")) {
        errorMessage +=
          "Storage permissions are required. Please grant permissions in your device settings.";
      } else if (
        Platform.OS === "android" &&
        error.message.includes("ENOENT")
      ) {
        errorMessage +=
          "Could not access the download directory. Please check your device storage.";
      } else {
        errorMessage += "Please check your internet connection and try again.";
      }

      Alert.alert("Download Failed", errorMessage, [
        {
          text: "OK",
          style: "default",
        },
        ...(Platform.OS === "android"
          ? [
              {
                text: "Check Permissions",
                onPress: () => {
                  // This will open the app settings where user can grant permissions
                  Alert.alert(
                    "Grant Permissions",
                    "Please go to Settings > Apps > Texxano > Permissions and enable Storage permissions.",
                    [{ text: "OK" }]
                  );
                },
              },
            ]
          : []),
      ]);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleFilePress = async () => {
    // Don't trigger file press if context menu is visible
    if (showContextMenu) {
      return;
    }

    // For documents, download the file
    if (
      fileType === "document" ||
      fileType === "pdf" ||
      fileType === "word" ||
      fileType === "excel"
    ) {
      await downloadDocument();
      return;
    }

    // For other file types, use the existing share functionality
    if (!fileData) {
      Alert.alert("File not available", "This file is no longer available");
      return;
    }

    try {
      // Check if file can be shared
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Use different directories based on platform
        let localUri;
        if (Platform.OS === "android") {
          const documentsDir = FileSystem.documentDirectory;
          localUri = `${documentsDir}${fileData.fileName}`;
        } else {
          const cacheDir = FileSystem.cacheDirectory;
          localUri = `${cacheDir}${fileData.fileName}`;
        }

        // Check if file already exists
        const fileInfo = await FileSystem.getInfoAsync(localUri);

        if (!fileInfo.exists) {
          // Use read URL if available, otherwise fallback to original URL
          const downloadUrl = readUrl || fileData.url;

          // Download file with proper headers for Android
          const downloadResult = await FileSystem.downloadAsync(
            downloadUrl,
            localUri,
            Platform.OS === "android"
              ? {
                  headers: {
                    Authorization: token ? "Bearer " + token : "",
                  },
                }
              : {}
          );

          if (downloadResult.status !== 200) {
            throw new Error("Failed to download file");
          }
        }

        // Share file with proper MIME type
        const mimeType = getMimeTypeFromFileName(fileData.fileName);
        await Sharing.shareAsync(localUri, {
          mimeType: mimeType,
          dialogTitle: `Share ${fileData.fileName}`,
        });
      } else {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to share file. Please try downloading it instead."
      );
    }
  };

  const handleImagePress = () => {
    // Don't trigger image press if context menu is visible
    if (showContextMenu) {
      return;
    }
    setFullScreenType("image");
    setShowFullScreen(true);
  };

  const handleVideoPress = () => {
    // Don't trigger video press if context menu is visible
    if (showContextMenu) {
      return;
    }
    setFullScreenType("video");
    setShowFullScreen(true);
  };

  const renderFileContent = () => {
    // If no file data but message type indicates file, show placeholder
    if (!fileData) {
      return (
        <View style={styles.documentContainer}>
          <View style={styles.documentIcon}>
            <Ionicons name={fileIcon} size={32} color={iconColor} />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.fileName} numberOfLines={2}>
              {message.type} file
            </Text>
            <Text style={styles.fileSize}>File not available</Text>
          </View>
        </View>
      );
    }

    switch (fileType) {
      case "image":
        return (
          <View style={styles.imageWrapper}>
            {/* Download button for sender's messages - left side */}
            {isOwnMessage && (
              <TouchableOpacity
                style={styles.downloadButtonOutside}
                onPress={downloadDocument}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Ionicons name="download-outline" size={18} color="#64748b" />
                )}
              </TouchableOpacity>
            )}

            <Pressable
              onPress={handleImagePress}
              onLongPress={handleLongPress}
              delayLongPress={500}
              style={styles.imageContainer}
            >
              {(isLoadingReadUrl || isImageLoading) && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              )}
              <Image
                source={imageSource}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setIsImageLoading(true)}
                onLoad={() => {
                  setIsImageLoading(false);
                  setImageError(false);
                }}
                onError={() => {
                  setImageError(true);
                  setIsImageLoading(false);
                }}
              />
              {imageError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="image-outline" size={24} color="#64748b" />
                  <Text style={styles.errorText}>Image failed to load</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                      setImageError(false);
                      setIsImageLoading(true);
                    }}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Pressable>

            {/* Download button for other user's messages - right side */}
            {!isOwnMessage && (
              <TouchableOpacity
                style={styles.downloadButtonOutside}
                onPress={downloadDocument}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Ionicons name="download-outline" size={18} color="#64748b" />
                )}
              </TouchableOpacity>
            )}
          </View>
        );

      case "video":
        return (
          <View style={styles.videoWrapper}>
            {/* Download button for sender's messages - left side */}
            {isOwnMessage && (
              <TouchableOpacity
                style={styles.downloadButtonOutside}
                onPress={downloadDocument}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Ionicons name="download-outline" size={18} color="#64748b" />
                )}
              </TouchableOpacity>
            )}

            <Pressable
              onPress={handleVideoPress}
              onLongPress={handleLongPress}
              delayLongPress={500}
              style={styles.videoContainer}
            >
              {(isLoadingReadUrl || isVideoLoading) && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              )}
              <Video
                source={{ uri: readUrl || fileData?.url || message.text }}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                onLoadStart={() => setIsVideoLoading(true)}
                onLoad={() => {
                  setIsVideoLoading(false);
                  setVideoError(false);
                }}
                onError={() => {
                  setVideoError(true);
                  setIsVideoLoading(false);
                }}
              />
              <View style={styles.videoPlayOverlay}>
                <Ionicons name="play-circle" size={48} color="#ffffff" />
              </View>
              {videoError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="videocam-outline" size={24} color="#64748b" />
                  <Text style={styles.errorText}>Video failed to load</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                      setVideoError(false);
                      setIsVideoLoading(true);
                    }}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Pressable>

            {/* Download button for other user's messages - right side */}
            {!isOwnMessage && (
              <TouchableOpacity
                style={styles.downloadButtonOutside}
                onPress={downloadDocument}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Ionicons name="download-outline" size={18} color="#64748b" />
                )}
              </TouchableOpacity>
            )}
          </View>
        );

      default:
        return (
          <Pressable
            onPress={handleFilePress}
            onLongPress={handleLongPress}
            delayLongPress={500}
            style={styles.documentContainer}
          >
            <View style={styles.documentIcon}>
              <Ionicons name={fileIcon} size={32} color={iconColor} />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.fileName} numberOfLines={2}>
                {fileData.fileName}
              </Text>

              {isLoadingReadUrl && (
                <ActivityIndicator size="small" color="#3b82f6" />
              )}

              {isDownloading && (
                <View style={styles.downloadProgressContainer}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={styles.downloadText}>Downloading...</Text>
                </View>
              )}
            </View>
            <Ionicons
              name={isDownloading ? "hourglass-outline" : "download-outline"}
              size={20}
              color={isDownloading ? "#3b82f6" : "#64748b"}
            />
          </Pressable>
        );
    }
  };
  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View style={styles.messageRow}>
        {/* Avatar for other messages */}
        {showAvatar &&
          !isOwnMessage &&
          (avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: "#2563eb",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              {initials ? (
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}
                >
                  {initials}
                </Text>
              ) : null}
            </View>
          ))}

        <View style={styles.messageContent}>
          {/* Reply Indicator */}
          {message.replyTo && (
            <TouchableOpacity
              style={styles.replyIndicator}
              onPress={() => {
                if (onScrollToMessage) {
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

          {renderFileContent()}

          {message.text &&
            message.type !== "image" &&
            message.type !== "video" &&
            message.type !== "document" && (
              <LinkableText
                style={[
                  styles.messageText,
                  isOwnMessage ? styles.ownText : styles.otherText,
                ]}
              >
                {message.text}
              </LinkableText>
            )}

          {/* Message Reactions */}
          <MessageReactions
            key={`reactions-${message.id}-${reactionsKey}`}
            reactions={message.reactions}
            onReactionPress={(emoji) => {
              if (onReact) {
                onReact(message.id, emoji);
              }
            }}
            isOwnMessage={isOwnMessage}
          />

          <Text
            style={[
              styles.timestamp,
              isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
              {width: 100},
            ]}
          >
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : message.createdAt
              ? new Date(message.createdAt.toDate()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
            {message.isEdited && (
              <Text style={styles.editedIndicator}> • edited</Text>
            )}
          </Text>
        </View>
      </View>

      {/* Full Screen Modal */}
      <Modal
        visible={showFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullScreen(false)}
        >
          <View style={[modalStyle.centeredView, flex.d_flex_center]}>
          <TouchableOpacity
            style={styles.fullScreenCloseButton}
            onPress={() => setShowFullScreen(false)}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
            <View style={[modalStyle.modalView, styles.fullScreenContainer]}>
        

          {fullScreenType === "image" ? (
            <Image
              source={imageSource}
              style={styles.fullScreenImage}
              resizeMode="cover"
            />
          ) : fullScreenType === "video" ? (
            <Video
              source={imageSource}
              style={styles.fullScreenVideo}
              useNativeControls
              resizeMode="contain"
            />
          ) : null}
            </View>
          </View>
        </Modal>

      {/* Context Menu */}
      <MessageContextMenu
        visible={showContextMenu}
        onClose={handleContextMenuClose}
        onReact={handleReact}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onForward={onForward ? handleForward : undefined}
        translations={translations}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: width * 0.75,
    paddingHorizontal: 8,
  },
  ownMessage: {
    alignSelf: "flex-end",
    marginRight: 41,  

  },
  otherMessage: {
    alignSelf: "flex-start",
  },

  imageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: width * 0.8,
  },
  image: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 16,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },

  fullScreenContainer: {
    width: "90%",
    height: "80%",
    backgroundColor: "#000000",

    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    margin: 0,
    borderRadius: 8,
  },
    fullScreenImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      borderRadius: 8,
    },
  fullScreenVideo: {
    width: width,
    height: "100%",
    resizeMode: "contain",
  },
  fullScreenCloseButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 40 : 5,
    right: Platform.OS === "ios" ? 10 : 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    padding: 0,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  fullScreenShareButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    padding: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  videoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: width * 0.8,
  },
  videoContainer: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  video: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 12,
  },
  videoPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
  },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: width * 0.8,
  },
  documentIcon: {
    marginRight: 12,
  },
  documentInfo: {
    width: width * 0.5,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#64748b",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  errorContainer: {
    width: width * 0.8,
    height: width * 0.6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  errorText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#3b82f6",
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  messageText: {
    fontSize: 15,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  ownText: {
    color: "#ffffff",
  },
  otherText: {
    color: "#1e293b",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    paddingHorizontal: 4,
    color: "#64748b",
    backgroundColor: "transparent",
    zIndex: 1,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherTimestamp: {
    color: "#64748b",
  },
  editedIndicator: {
    fontSize: 10,
    color: "#64748b",
    marginLeft: 4,
  },
  downloadProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  downloadText: {
    fontSize: 12,
    color: "#3b82f6",
    marginLeft: 6,
    fontWeight: "500",
  },
  downloadButton: {
    position: "absolute",
    top: "50%",
    left: 8,
    transform: [{ translateY: -20 }],
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  downloadButtonOutside: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  replyText: {
    fontSize: 12,
    color: "#3b82f6",
    marginLeft: 4,
    fontWeight: "500",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: "#2563eb",
  },
  messageRow: {
    flexDirection: "row",
    alignItems:  "flex-end",
  },
  // messageContent: {
  //   flex: 1,
  // },
});

export default FileMessage;
