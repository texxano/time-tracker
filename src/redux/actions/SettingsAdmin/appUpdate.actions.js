import { appUpdateTypes } from '../../type/SettingsAdmin/appUpdate.types';
import {appUpdateService } from '../../../services/SettingsAdmin/appUpdate.services';

export function postAppUpdate() {
    return dispatch => {
        dispatch(request());
       appUpdateService.postAppUpdate()
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
    function request(data) { return { type: appUpdateTypes.APP_UPDATE_REQUEST, data } }
    function success(data) { return { type: appUpdateTypes.APP_UPDATE_SUCCESS, data } }
    function failure(data) { return { type: appUpdateTypes.APP_UPDATE_FAILURE, data } }
}
