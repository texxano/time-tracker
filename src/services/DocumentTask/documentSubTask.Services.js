import http from '../http'

export const documentSubTaskServices = {
    createDocumentSubTask,
    updateDocumentSubTask,
    completeDocumentSubTask,
    rollbackDocumentSubTask,
    deleteDocumentSubTask,
};

async function createDocumentSubTask(payload) {
    const response = await http.post(`/doctask/sub`, payload);
    return response;
}

async function updateDocumentSubTask(payload) {
    const response = await http.put(`/doctask/sub`, payload);
    return response;
}

async function completeDocumentSubTask(payload) {
    const response = await http.put(`/doctask/sub/complete`, payload);
    return response;
}

async function rollbackDocumentSubTask(payload) {
    const response = await http.put(`/doctask/sub/rollback`, payload);
    return response;
}

async function deleteDocumentSubTask(id) {
    const response = await http.delete(`/doctask/sub/${id}`);
    return response;
}
