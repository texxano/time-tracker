import * as FileSystem from 'expo-file-system';

/**
 * Azure Blob Storage upload using fetch (React Native compatible)
 * This avoids Node.js dependencies that aren't available in React Native
 */

/**
 * Upload file to Azure Blob Storage using SAS URL
 * @param {Object} file - File object with uri, name, type, size
 * @param {string} uploadUrl - SAS URL for upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result
 */
export const uploadToAzureBlob = async (file, uploadUrl, onProgress) => {
  try {
    console.log('🚀 Starting Azure upload...');
    
    // Read file content as base64
    const base64Content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to binary
    const binaryString = atob(base64Content);
    const fileBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      fileBytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log(`📁 File size: ${fileBytes.length} bytes`);
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBytes,
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
        'x-ms-blob-content-type': file.type,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    // Simulate progress for better UX
    if (onProgress) {
      for (let progress = 0; progress <= 100; progress += 10) {
        onProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log('✅ Azure upload completed');
    
    return {
      success: true,
      blobUrl: uploadUrl.split('?')[0], // Remove SAS token for clean URL
    };
    
  } catch (error) {
    console.error('❌ Azure upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Chunked upload for large files using fetch
 * @param {Object} file - File object with uri, name, type, size
 * @param {string} uploadUrl - SAS URL for upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result
 */
export const uploadToAzureBlobChunked = async (file, uploadUrl, onProgress) => {
  try {
    console.log('🚀 Starting Azure chunked upload...');
    
    // Read file content as base64
    const base64Content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to binary
    const binaryString = atob(base64Content);
    const fileBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      fileBytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log(`📁 File size: ${fileBytes.length} bytes`);
    
    const chunkSize = 4 * 1024 * 1024; // 4MB chunks
    const totalChunks = Math.ceil(fileBytes.length / chunkSize);
    const blockIds = [];
    
    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileBytes.length);
      const chunkBytes = fileBytes.slice(start, end);
      
      // Generate block ID (must be base64 encoded)
      const blockId = btoa(`block-${i.toString().padStart(6, '0')}`);
      blockIds.push(blockId);
      
      // Upload chunk
      const chunkUrl = `${uploadUrl}&comp=block&blockid=${blockId}`;
      
      await fetch(chunkUrl, {
        method: 'PUT',
        body: chunkBytes,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
      });
      
      // Update progress
      if (onProgress) {
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        onProgress(progress);
      }
    }
    
    // Commit blocks
    const commitUrl = `${uploadUrl}&comp=blocklist`;
    const blockListXml = `<?xml version="1.0" encoding="utf-8"?>
      <BlockList>
        ${blockIds.map(id => `<Latest>${id}</Latest>`).join('')}
      </BlockList>`;
    
    await fetch(commitUrl, {
      method: 'PUT',
      body: blockListXml,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
    
    console.log('✅ Azure chunked upload completed');
    
    return {
      success: true,
      blobUrl: uploadUrl.split('?')[0], // Remove SAS token for clean URL
    };
    
  } catch (error) {
    console.error('❌ Azure chunked upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Simple upload using fetch (fallback method)
 * @param {Object} file - File object with uri, name, type, size
 * @param {string} uploadUrl - SAS URL for upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result
 */
export const uploadToAzureBlobSimple = async (file, uploadUrl, onProgress) => {
  try {
    console.log('🚀 Starting Azure simple upload...');
    
    // Read file content as base64
    const base64Content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to binary
    const binaryString = atob(base64Content);
    const fileBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      fileBytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log(`📁 File size: ${fileBytes.length} bytes`);
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBytes,
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    // Simulate progress for simple upload
    if (onProgress) {
      onProgress(100);
    }
    
    console.log('✅ Azure simple upload completed');
    
    return {
      success: true,
      blobUrl: uploadUrl.split('?')[0], // Remove SAS token for clean URL
    };
    
  } catch (error) {
    console.error('❌ Azure simple upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};