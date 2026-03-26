import http from '../http'

export const timeUserConfigurationsServices = {
    timeUserSupervisor,
};

async function timeUserSupervisor(payload) {
    const response = await http.post(`/timetracker/users`, payload);
    return response;
}
