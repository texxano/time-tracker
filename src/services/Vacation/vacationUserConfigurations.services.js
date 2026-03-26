import http from '../http'

export const vacationUserConfigurationsServices = {
    vacationUserConfigurations
};

async function vacationUserConfigurations(payload) {
    const response = await http.post(`/vacations/users`, payload);
    return response;
}
