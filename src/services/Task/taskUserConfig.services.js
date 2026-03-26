import http from '../http'

export const taskUserConfigServices = {
    taskUserConfig
};

async function taskUserConfig(payload) {
    const response = await http.post(`/shotgun/users`, payload);
    return response;
}
