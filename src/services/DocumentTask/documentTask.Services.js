import http from '../http'

export const documentTaskServices = {
    createDocumentTask,
    updateDocumentTask,
    completeAllDocumentSubTasks,
    deleteDocumentTask,
    moveDocumentTask,
    createDocumentTaskBaseNumbers,
    createDocumentTaskBaseNumbersSub,
    createRequesters,
    updateRequesters
};

async function createDocumentTask(payload) {
    const response = await http.post(`/doctask/tasks`, payload);
    return response;
}

async function updateDocumentTask(payload) {
    const response = await http.put(`/doctask/tasks`, payload);
    return response;
}

async function completeAllDocumentSubTasks(id, payload) {
    const response = await http.put(`/doctask/tasks/${id}/complete`, payload);
    return response;
}

async function deleteDocumentTask(id) {
    const response = await http.delete(`/doctask/tasks/${id}`);
    return response;
}

async function moveDocumentTask(payload) {
    const response = await http.put(`/doctask/tasks/move`, payload);
    return response;
}

async function createDocumentTaskBaseNumbers(payload) {
    const response = await http.post(`/doctask/tasks/numbers`, payload);
    return response;
}

async function createDocumentTaskBaseNumbersSub(payload) {
    const response = await http.post(`/doctask/tasks/numbers/sub`, payload);
    return response;
}

async function createRequesters(payload) {
    const response = await http.post(`/doctask/tasks/requesters`, payload);
    return response;
}

async function updateRequesters(payload) {
    const response = await http.put(`/doctask/tasks/requesters`, payload);
    return response;
}
