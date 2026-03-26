import http from '../http'

export const notificationsService = {
    deleteByIdNotifications,
    deleteAllNotifications,
};

async function deleteByIdNotifications(id) {
    const response = await http.delete(`/notifications/${id}`);
    return response;
}

async function deleteAllNotifications() {
    const response = await http.delete(`/notifications`);
    return response;
}
