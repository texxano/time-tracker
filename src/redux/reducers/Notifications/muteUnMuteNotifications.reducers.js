import { muteUnmuteNotificationsTypes } from '../../type/Notifications/muteUnMuteNotifications.types'

export function muteUnMuteNotificationsReducer(state = {}, action) {
    switch (action.type) {
        case muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_REQUEST_ID:
            return {
                muteUnmuteNotificationsRequestId: action.data
            };
        case muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_SUCCESS:
            return {
                data: action.data
            };
        case muteUnmuteNotificationsTypes.MUTE_UNMUTE_NOTIFICATIONS_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};
