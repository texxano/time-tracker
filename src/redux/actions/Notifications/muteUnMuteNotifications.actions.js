import { muteUnmuteNotificationsTypes } from '../../type/Notifications/muteUnMuteNotifications.types';
import { muteUnmuteNotificationsService } from '../../../services/Notifications/muteUnMuteNotifications.services';


export function muteNotificationsByProject(id) {
    return dispatch => {
        dispatch(request(id));
        muteUnmuteNotificationsService.muteNotificationsByProject(id)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data));
                    }
                }
            )
    }
    function request(data) { return { type: muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_REQUEST_ID, data } }
    function success(data) { return { type: muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_SUCCESS,data } }
    function failure(data) { return { type: muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_FAILURE, data } }
}

export function unMuteNotificationsByProject(id) {
    return dispatch => {
        dispatch(request(id));
        muteUnmuteNotificationsService.unMuteNotificationsByProject(id)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data));
                    }
                }
            )
    }
    function request(data) { return { type: muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_REQUEST_ID, data } }
    function success(data) { return { type: muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_SUCCESS,data } }
    function failure(data) { return { type: muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_FAILURE, data } }
}