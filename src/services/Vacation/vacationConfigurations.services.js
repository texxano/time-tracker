import http from '../http'

export const vacationConfigurationsServices = {
    updateConfigurationVacation,
    enableVacationModule,
    disableVacationModule
};

async function updateConfigurationVacation(payload) {
    const response = await http.put("/vacations/configurations", payload);
    return response;
}

async function enableVacationModule(id) {
    const response = await http.post(`/vacations/configurations/${id}/enable`);
    return response;
}

async function disableVacationModule(id) {
    const response = await http.post(`/vacations/configurations/${id}/disable`);
    return response;
}
           