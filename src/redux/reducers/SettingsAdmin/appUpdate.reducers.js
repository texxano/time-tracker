import { appUpdateTypes } from '../../type/SettingsAdmin/appUpdate.types'

export function appUpdateReducer(state = {}, action) {
    switch (action.type) {
        case appUpdateTypes.APP_UPDATE_REQUEST:
            return {
                updateRequest: 'updateRequest'
            };
        case appUpdateTypes.APP_UPDATE_SUCCESS:
            return {
                data: action.data
            };
        case appUpdateTypes.APP_UPDATE_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};