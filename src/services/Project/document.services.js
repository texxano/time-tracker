import http from '../http'

export const documentService = {
    postDocument,
    deleteByIdDocument,
    deleteAllDocument,
    updateNameDocument
};
async function postDocument(payload) {
    const response = await http.post("/documents", payload);
    return response;
}

async function deleteByIdDocument(id) {
    const response = await http.delete(`/documents/${id}`);
    return response;
}

async function deleteAllDocument(projectId) {
    const response = await http.delete(`/documents?projectId=${projectId}`);
    return response;
}

async function updateNameDocument(payload) {
    const response = await http.put("/documents", payload);
    return response;
}
