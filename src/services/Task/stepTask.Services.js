import http from '../http'

export const stepTaskServices = {
    createStepTask,
    updateStepTask,
    stepCompleteTask,
    stepRollbackTask,
    deleteStepTask,
};

async function createStepTask(payload) {
    const response = await http.post(`/shotgun/steps`, payload);
    return response;
}

async function updateStepTask(payload) {
    const response = await http.put(`/shotgun/steps`, payload);
    return response;
}

async function stepCompleteTask(payload) {
    const response = await http.put(`/shotgun/steps/complete`, payload);
    return response;
}

async function stepRollbackTask(payload) {
    const response = await http.put(`/shotgun/steps/rollback`, payload);
    return response;
}

async function deleteStepTask(id) {
    const response = await http.delete(`/shotgun/steps/${id}`);
    return response;
}
