import http from '../http'

export const timeModuleConfigurationsServices = {
    enableTimeModule,
    disableTimeModule
};

async function enableTimeModule(id) {
    const response = await http.post(`/timetracker/configurations/${id}/enable`);
    return response;
}

async function disableTimeModule(id) {
    const response = await http.post(`/timetracker/configurations/${id}/disable`);
    return response;
}
