import http from '../http'

export const calendarUserConfigServices = {
    calendarUserConfig
};

function calendarUserConfig(payload) {
    return http.post(`/calendarm/users`, payload)
        .then(function (response) {
            return response;
        })
}
