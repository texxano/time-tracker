import { BASE_URL_API } from '../../utils/settings';
import { token } from '../http';

export class FileUploadService {

  static getFileType(fileName) {
    if (!fileName) return 'unknown';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
      return 'image';
    }
    
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
      return 'video';
    }
    
    if (['pdf'].includes(extension) || ['PDF'].includes(extension)) {
      return 'pdf';
    }
    
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return 'document';
    }
    
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return 'spreadsheet';
    }
    
    if (['ppt', 'pptx'].includes(extension)) {
      return 'presentation';
    }
    
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'archive';
    }
    
    return 'unknown';
  }
  static getFileIcon(fileType) {
    switch (fileType) {
      case 'image':
        return 'image-outline';
      case 'video':
        return 'videocam-outline';
      case 'pdf':
        return 'document-text-outline';
      case 'word':
        return 'document-text-outline';
      case 'excel':
        return 'grid-outline';
      case 'csv':
        return 'grid-outline';
      case 'document':
        return 'document-text-outline';
      case 'presentation':
        return 'easel-outline';
      default:
        return 'document-outline';
    }
  }
  static async uploadFile(fileData, chatId) {
    try {
      
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: fileData.uri,
        name: fileData.name,
        type: fileData.type,
      });
      formData.append('chatId', chatId);

      // Get current token
      const currentToken = token();
      if (!currentToken) {
        throw new Error('No authentication token available');
      }

      // Upload to server
      const response = await fetch(`${BASE_URL_API}/chat/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      return {
        url: result.fileUrl,
        fileName: fileData.name,
        fileSize: fileData.size,
        fileType: fileData.type,
        uploadId: result.uploadId,
      };
    } catch (error) {
      throw error;
    }
  }

  static async uploadToAzure(file, containerName, onProgress) {
    // Placeholder for Azure upload
    // In a real app, you would implement Azure Blob Storage upload
    return this.uploadFile(file, onProgress);
  }

  static validateFile(file) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/*',
      'video/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' };
    }

    const isAllowedType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

 
}

export default FileUploadService; 