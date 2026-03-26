import http from '../http'

export const devicesService = {
    postDataDevice,
    deleteByIdDevice,
    deleteAllDevice,
    updateReceiveNotificationsDevice,
    getDevices
};
async function postDataDevice(payload) {
    const response = await http.post("/devices/expo", payload);
    return response;
}

async function deleteByIdDevice(id) {
    const response = await http.delete(`/devices/${id}`);
    return response;
}

async function deleteAllDevice() {
    const response = await http.delete("/devices");
    return response;
}

async function updateReceiveNotificationsDevice(payload) {
    const response = await http.put("/devices", payload);
    return response;
}

async function getDevices() {
    const response = await http.get("/devices");
    return response;
}
