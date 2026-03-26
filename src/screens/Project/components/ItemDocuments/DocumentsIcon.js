import React from 'react'
import { StyleSheet, View } from 'react-native';
import { Ionicons, EvilIcons, AntDesign, MaterialIcons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';

const DocumentsIcon = ({ url }) => {
    const parts = url?.split(".");
    const fileType = parts?.pop();
    switch (fileType.toLowerCase()) {
        case "svg": case "svgz": case "jpg": case "png": case "gif": case "webp": case "tiff": case "raw": case "bmp": case "jpeg": case "jif": case "jfif": case "jfi": case "jpe":
            return (<View style={styles.icon}><EvilIcons name="image" size={24} color="#6c757d" /></View>);

        case "pdf":
            return (<View style={styles.icon}><AntDesign name="pdffile1" size={24} color="#6c757d" /></View>);

        case "doc": case "docx": case "dot": case "docm": case "dotm": case "dotx": case "htm": case "html": case "rtf": case "txt": case "xml": case "json": case "csv": case "xls": case "xlsb": case "xlsm": case "js": case "jsx": case "ts": case "tsx":
            return (<View style={styles.icon}><Ionicons name="document-attach-outline" size={24} color="#6c757d" /></View>);

        case "ppt": case "pptx":
            return (<View style={styles.icon}><AntDesign name="pptfile1" size={24} color="#6c757d" /></View>);

        case "mp4": case "mkv": case "m4v": case "avi": case "flv": case "mov":
            return (<View style={styles.icon}><MaterialCommunityIcons name="file-video-outline" size={24} color="#6c757d" /></View>);
        case "rar": case "zip": case "7z": case "gz": case "tar": case "z":
            return (<View style={styles.icon}><Octicons name="file-zip" size={24} color="#6c757d" /></View>);

        case "exe":
            return (<View style={styles.icon}><MaterialIcons name="settings-applications" size={24} color="#6c757d" /></View>);
        default:
            return (<View style={styles.icon}><AntDesign name="filetext1" size={24} color="#6c757d" /></View>);
    }
}
const styles = StyleSheet.create({
    icon: {
        borderWidth: 1,
        borderColor: "#6c757d",
        borderRadius: 8,
        padding: 7,
        marginRight: -8,
        flexDirection: "row",
        alignItems: "center",

    }
});
export default DocumentsIcon
