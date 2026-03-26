import http from '../http'

export const taskServices = {
    createTaskName,
    updateTaskName,
    completeAllTasks,
    deleteTask
};

async function createTaskName(payload) {
    const response = await http.post(`/shotgun/tasks`, payload);
    return response;
}

async function updateTaskName(payload) {
    const response = await http.put(`/shotgun/tasks`, payload);
    return response;
}

async function completeAllTasks(id) {
    const response = await http.put(`/shotgun/tasks/${id}/complete`);
    return response;
}

async function deleteTask(id) {
    const response = await http.delete(`/shotgun/tasks/${id}`);
    return response;
}
