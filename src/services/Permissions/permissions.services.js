import http from '../http'

export const permissionsService = {
    createPermissions,
    updatePermissions,
    deleteAllPermissions,
    deleteByIdPermissions,
    deleteMyPermission
};

async function createPermissions(payload) {
    const response = await http.post("/permissions", payload);
    return response;
}

async function updatePermissions(payload) {
    const response = await http.put("/permissions", payload);
    return response;
}

async function deleteAllPermissions(id) {
    const response = await http.delete(`/permissions?userId=${id}`);
    return response;
}

async function deleteByIdPermissions(id) {
    const response = await http.delete(`/permissions/${id}`);
    return response;
}

async function deleteMyPermission(id, childProjects) {
    const response = await http.delete(`/permissions/me?projectId=${id}&includeChildProjects=${childProjects}`);
    return response;
}
