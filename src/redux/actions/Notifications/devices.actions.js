import { devicesTypes } from '../../type/Notifications/devices.types';
import { devicesService } from '../../../services/Notifications/devices.services';

export function postDataDevice(payload) {
    return dispatch => {
        devicesService.postDataDevice(payload)
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
    function success(data) { return { type: devicesTypes.DEVICES_SUCCESS_ID, data } }
    function failure(data) { return { type: devicesTypes.DEVICES_FAILURE, data } }
}

export function deleteByIdDevice(id) {
    return dispatch => {
        dispatch(request(id));
        devicesService.deleteByIdDevice(id)
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
    function request(data) { return { type: devicesTypes.DEVICES_REQUEST, data } }
    function success(data) { return { type: devicesTypes.DEVICES_SUCCESS, data } }
    function failure(data) { return { type: devicesTypes.DEVICES_FAILURE, data } }
}
export function deleteAllDevice() {
    return dispatch => {
        dispatch(request());
        devicesService.deleteAllDevice()
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
    function request(data) { return { type: devicesTypes.DEVICES_REQUEST, data } }
    function success(data) { return { type: devicesTypes.DEVICES_SUCCESS, data } }
    function failure(data) { return { type: devicesTypes.DEVICES_FAILURE, data } }
}

export function updateReceiveNotificationsDevice(payload) {
    return dispatch => {
        dispatch(request(id));
        devicesService.updateReceiveNotificationsDevice(payload)
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
    function request(data) { return { type: devicesTypes.DEVICES_UPDATE_REQUEST, data } }
    function success(data) { return { type: devicesTypes.DEVICES_SUCCESS, data } }
    function failure(data) { return { type: devicesTypes.DEVICES_FAILURE, data } }
}
