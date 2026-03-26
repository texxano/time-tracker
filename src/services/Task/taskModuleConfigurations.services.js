import http from '../http'

export const taskModuleConfigurationsServices = {
    enableTaskModule,
    disableTaskModule
};

async function enableTaskModule(id) {
    const response = await http.post(`/shotgun/configurations/${id}/enable`);
    return response;
}

async function disableTaskModule(id) {
    const response = await http.post(`/shotgun/configurations/${id}/disable`);
    return response;
}
        