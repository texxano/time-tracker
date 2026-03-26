import { BASE_URL_API } from './settings'
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import http from '../services/http';

export default async function downloadFile(id, name, type, docPurpose) {
    const fileSystemDownloadsDir = FileSystem.documentDirectory + "downloads";
    
    const downloadUrl = `/documents/${id}/download`;
    const downloadReportsUrl = `/reports/${id}/download`;
    const downloadDocTaskUrl = `/doctask/docs/${id}/download`;

    const downloadDir = `${fileSystemDownloadsDir}/${name.replace(/ /g, "_")}`;

    try {
        // Ensure that downloadDir exists
        const downloadDirInfo = await FileSystem.getInfoAsync(downloadDir);
        if (!downloadDirInfo.exists) {
            await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
        }

        // Delete all cached files in fileSystemDownloadsDir
        const files = await FileSystem.readDirectoryAsync(fileSystemDownloadsDir);
        for (const file of files) {
            try {
                const fileToDelete = `${fileSystemDownloadsDir}/${file}`;
                const fileInfo = await FileSystem.getInfoAsync(fileToDelete);
                if (!fileInfo.isDirectory) {
                    await FileSystem.deleteAsync(fileToDelete);
                }
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }

        // Determine the correct download URL based on type
        let downloadPath;
        switch (type) {
            case 0:
                downloadPath = downloadUrl;
                break;
            case 1:
                downloadPath = downloadReportsUrl;
                break;
            case 2:
                downloadPath = downloadDocTaskUrl;
                break;
            default:
                throw new Error('Invalid download type');
        }

        // Get the current token for authentication
        const state = http.token ? { userToken: { token: http.token() } } : require('../redux/store/store').store.getState();
        const authToken = state.userToken.token;

        if (!authToken) {
            throw new Error('No authentication token available');
        }

        // Create the full download URL
        const fullDownloadUrl = `${BASE_URL_API}${downloadPath}`;

        // Create a download resumable with proper authentication
        const downloadResumable = FileSystem.createDownloadResumable(
            fullDownloadUrl,
            `${downloadDir}/${name.replace(/ /g, "_")}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                }
            },
        );

        // Note: For document task downloads (type 2), we should NOT set a body
        // The docPurpose parameter might contain the document type/purpose info
        // Only set body for specific types that require it
        if (typeof docPurpose === 'number' && docPurpose > -1 && type !== 2) {
            downloadResumable.body = JSON.stringify(docPurpose);
        }

        const result = await downloadResumable.downloadAsync();
        const { uri } = result;
        
        // Check file size to ensure download was successful
        const fileInfo = await FileSystem.getInfoAsync(uri);
        
        if (!fileInfo.exists) {
            throw new Error('Downloaded file does not exist');
        }
        
        if (fileInfo.size === 0) {
            throw new Error('Downloaded file is empty (0 bytes). This may indicate an authentication or API error.');
        }

        // Determine MIME type based on file extension
        const getFileMimeType = (filename) => {
            const extension = filename.split('.').pop().toLowerCase();
            const mimeTypes = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'ppt': 'application/vnd.ms-powerpoint',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'txt': 'text/plain',
                'zip': 'application/zip',
                'rar': 'application/x-rar-compressed',
            };
            return mimeTypes[extension] || 'application/octet-stream';
        };

        const mimeType = getFileMimeType(name);

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            try {
                await Sharing.shareAsync(uri, { 
                    dialogTitle: name,
                    mimeType: mimeType, // Specify MIME type for Android
                    UTI: mimeType // Also set UTI for consistency
                });
                
                // Note: Sharing.shareAsync doesn't reliably indicate if user cancelled
                // The function completes successfully even if user cancels
                // Therefore, we don't show any success message - the share sheet itself provides feedback
                // Users will know the file was shared if they selected an app
            } catch (shareError) {
                // Don't show any message - file is downloaded but share failed/cancelled
            }
        } else {
            
            // Show success message only when sharing is not available
            Alert.alert(
                'Download Successful',
                `${name} has been downloaded successfully.`,
                [{ text: 'OK' }]
            );
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error; // Re-throw to allow calling code to handle errors
    }
}
