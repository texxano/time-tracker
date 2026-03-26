import http from '../http'

export const documentTaskSectorsServices = {
    createDocumentTasksSectors,
    updateDocumentTasksSupervizor,
    deleteDocumentTasksSectors
};


async function createDocumentTasksSectors(payload) {
    const response = await http.post(`/doctask/sectors`, payload);
    return response;
}

async function updateDocumentTasksSupervizor(payload) {
    const response = await http.put(`/doctask/sectors`, payload);
    return response;
}

async function deleteDocumentTasksSectors(id) {
    const response = await http.put(`/doctask/sectors/${id}/delete`);
    return response;
}
