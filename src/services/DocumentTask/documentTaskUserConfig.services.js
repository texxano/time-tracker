import http from '../http'

export const documentTaskUserConfigServices = {
    documentTaskUserConfig
};

async function documentTaskUserConfig(payload) {
    const response = await http.post(`/doctask/users`, payload);
    return response;
}
