import http from '../http'

export const userService = {
    createUser,
    deleteUser,
    updateProfile,
    updateLanguage,
    updatePassword,
    updateNotifications,
    lockUser,
    unlockUser,
    lockAllUser,
    unlockAllUser,
    getMe,
    getModuleEnable
};

async function createUser(payload) {
    const response = await http.post("/users", payload);
    return response;
}

async function deleteUser(id) {
    const response = await http.delete(`/users/${id}`);
    return response;
}

async function updateProfile(payload) {
    const response = await http.put("/users/profile", payload);
    return response;
}

async function updateLanguage(payload) {
    const response = await http.put("/users/language", payload);
    return response;
}

async function updatePassword(payload) {
    const response = await http.put("/users/password", payload);
    return response;
}

async function updateNotifications(payload) {
    const response = await http.put("/notifications/preferences", payload);
    return response;
}

async function lockUser(id) {
    const response = await http.post(`/users/${id}/lock`, null);
    return response;
}

async function unlockUser(id) {
    const response = await http.post(`/users/${id}/unlock`, null);
    return response;
}

async function lockAllUser(rootId) {
    const response = await http.post(`/users/${rootId}/lockall`, null);
    return response;
}

async function unlockAllUser(rootId) {
    const response = await http.post(`/users/${rootId}/unlockall`, null);
    return response;
}

async function getMe() {
    const response = await http.get("/users/me");
    return response;
}

async function getModuleEnable() {
    const response = await http.get("/modules");
    return response;
}
