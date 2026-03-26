import http from '../http'

export const appUpdateService = {
    postAppUpdate
};

async function postAppUpdate() {
    const response = await http.post("/notifications/applicationupdate", null);
    return response;
}
