import http from '../http'

export const documentTaskFile = {
    uploadDocumentTaskFile,
    reuploadDocumentTaskFile,
    markDocumentTaskFile,
    deleteDocumentTaskFile,
};

async function uploadDocumentTaskFile(payload) {
    const response = await http.post(`/doctask/docs/upload`, payload);
    return response;
}
async function reuploadDocumentTaskFile(payload) {
    const response = await http.put(`/doctask/docs/reupload`, payload);
    return response;
}
async function markDocumentTaskFile(id, docPurpose) {
    const response = await http.put(`/doctask/docs/${id}/mark?docPurpose=${docPurpose}`);
    return response;
}

async function deleteDocumentTaskFile(id) {
    const response = await http.delete(`/doctask/docs/${id}`);
    return response;
}
