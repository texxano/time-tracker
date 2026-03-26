import http from '../http'

export const projectService = {
    getProject,
    createRootProject,
    createProject,
    updateProject,
    addlogoRootProject,
    deleteProject,
    removeLogoRootProject,
    addFavoriteProject,
    removeFavoriteProject,
    moveProject
};
async function getProject(projectId) {
    const response = await http.get(`/projects/${projectId}`);
    return response;
}

async function createRootProject(payload) {
    const response = await http.post("/projects/root", payload);
    return response;
}

async function createProject(payload) {
    const response = await http.post("/projects", payload);
    return response;
}

async function updateProject(payload) {
    const response = await http.put("/projects", payload);
    return response;
}

async function deleteProject(id) {
    const response = await http.delete(`/projects/${id}`);
    return response;
}

async function addFavoriteProject(id) {
    const response = await http.post(`/projects/${id}/favorite`, id);
    return response;
}

async function addlogoRootProject(name, base64Content, rootId) {
    const data = {
        'name': name,
        'base64Content': base64Content,
        'rootId': rootId
    };
    const response = await http.post("/projects/addlogo", data);
    return response;
}

async function removeLogoRootProject(rootId) {
    const response = await http.delete(`/projects/${rootId}/removelogo`);
    return response;
}

async function removeFavoriteProject(id) {
    const response = await http.post(`/projects/${id}/unfavorite`, id);
    return response;
}

async function moveProject(payload) {
    const response = await http.put("/projects/move", payload);
    return response;
}
