
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import React from 'react';
import { WebView } from 'react-native-webview';

import reportsServices from "../../services/Reports/reports.services";

export async function downloadReport(id, name, fileFormat) {
    try {
        const response = await reportsServices.downloadReport(id);

        const blob = await response.blob();

        let result;
        if (fileFormat === 3) {
            const reader = new FileReader();
            reader.onload = () => {
                const htmlText = reader.result;
                result = htmlText;
            };
            reader.onerror = (error) => {
                console.error('Error reading HTML blob:', error);
                throw error;
            };
            reader.readAsText(blob, 'utf-8');
        }
        // Display or save the result based on fileFormat
        if (fileFormat === 3 && result) {
            // Display HTML content in WebView
            return <WebView source={{ html: result }} />;
        } else {
            // Save other file types to device's media library
            await MediaLibrary.saveToLibraryAsync(result);
            alert('File downloaded successfully!');
        }
    } catch (error) {
        console.error("Download failed:", error);
        alert("Download failed. Please try again.");
    }
}
