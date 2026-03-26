import { notificationsTypes } from '../../type/Notifications/notifications.types';
import { notificationsService } from '../../../services/Notifications/notifications.services';

export const notificationsCount = count => ({ type: notificationsTypes.NOTIFICATIONS_COUNT, count: count });

export function deleteByIdNotifications(id) {

    return dispatch => {
        dispatch(request(id));
        notificationsService.deleteByIdNotifications(id)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: notificationsTypes.NOTIFICATIONS_REQUEST_ID, data } }
    function success(data) { return { type: notificationsTypes.NOTIFICATIONS_SUCCESS, data } }
    function failure(data) { return { type: notificationsTypes.NOTIFICATIONS_FAILURE, data } }
}

export function deleteAllNotifications() {
    return dispatch => {
        dispatch(request());
        notificationsService.deleteAllNotifications()
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: notificationsTypes.NOTIFICATIONS_REQUEST, data } }
    function success(data) { return { type: notificationsTypes.NOTIFICATIONS_SUCCESS, data } }
    function failure(data) { return { type: notificationsTypes.NOTIFICATIONS_FAILURE, data } }
}
