import http from "../http";
import { BASE_URL_API } from "../../utils/settings";

async function AddProfileImage(payload) {
    try {
       
        const response = await http.post(`/users/addlogo`, payload);
       
        return response;
    } catch (error) {
           
        throw error; // Re-throw the error so the action can handle it
    }
}

async function getUploadUrl(fileName) {
    try {
        const response = await http.get(`/documents/generate-upload-url?fileName=${fileName}`);
        return response;
    } catch (error) {
        throw error;    
    }
}



async function confirmUpload(payload) {
    try {
        const response = await http.post(`/documents/confirm-upload`, payload);
        return response;
    } catch (error) {
        throw error;
    }
}

async function getReadUrl(fileName) {
    try {
        const response = await http.get(`/documents/read-url?fileUrl=${fileName}`);
        return response;
    } catch (error) {
        throw error;
    }
}

async function deleteDocument(body) {
    try {
        const response = await http.delete(`/documents/delete`, { body });
        return response;
    } catch (error) {
        throw error;
    }
}

async function getDownloadUrl(fileName) {
    try {
        // The API endpoint directly serves the file, so return the URL
        const downloadUrl = `${BASE_URL_API}/documents/download?fileName=${encodeURIComponent(fileName)}`;
        return { url: downloadUrl };
    } catch (error) {
        return null;
    }
}

async function sendNotification(body) {
    try {
        const response = await http.post(`/chats/notify`, body);
        return response;
    } catch (error) {
        throw error;
    }
}

export const chatService = {
    AddProfileImage,
    confirmUpload,
    getUploadUrl,
    getReadUrl,
    deleteDocument,
    getDownloadUrl,
    sendNotification
}
