import http from '../http'

export const gpsUserConfigServices = {
    gpskUserConfig
};

function gpskUserConfig(payload) {
    return http.post(`/gps/users`, payload)
        .then(function (response) {
            return response;
        })
}
