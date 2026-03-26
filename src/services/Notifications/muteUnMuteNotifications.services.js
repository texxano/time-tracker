import http from '../http'

export const muteUnmuteNotificationsService = {
    muteNotificationsByProject,
    unMuteNotificationsByProject
};

async function muteNotificationsByProject(id) {
    const response = await http.post(`/notifications/${id}/mute`, null);
    return response;
}

async function unMuteNotificationsByProject(id) {
    const response = await http.post(`/notifications/${id}/unmute`, null);
    return response;
}
