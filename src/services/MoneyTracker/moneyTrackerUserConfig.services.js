import http from '../http'

export const moneyTrackerUserConfigServices = {
    moneyTrackerUserConfig
};

async function moneyTrackerUserConfig(payload) {
    const response = await http.post(`/moneytracker/users`, payload);
    return response;
}
