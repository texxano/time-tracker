import { notificationsTypes } from '../../type/Notifications/notifications.types'

export function notificationsReducer(state = {}, action) {
    switch (action.type) {
        case notificationsTypes.NOTIFICATIONS_REQUEST:
            return {
                notificationsRequest: 'notificationsRequest'
            };
        case notificationsTypes.NOTIFICATIONS_REQUEST_ID:
            return {
                notificationsRequestId: action.data
            };
        case notificationsTypes.NOTIFICATIONS_SUCCESS:
            return {
                data: action.data
            };
        case notificationsTypes.NOTIFICATIONS_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};

export function notificationsCountReducer(state = {}, action) {
    switch (action.type) {
        case notificationsTypes.NOTIFICATIONS_COUNT:
            return {
                count: action.count
            };
        default:
            return state
    }
};
