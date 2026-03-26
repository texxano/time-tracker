import { timeTracksTypes } from '../../type/TimeTracks/timeTracks.types';
import { timeProjectChargeServices } from '../../../services/TimeTracks/timeProjectCharge.services';

export function createUserProjectCharge(payload) {
    return dispatch => {
        dispatch(request(payload.userId));
        timeProjectChargeServices.createUserProjectCharge(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data.status));
                    }
                }
            )
    }
    function request(data) { return { type: timeTracksTypes.TIMETRACKS_REQUEST, data } }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}

export function updateUserProjectCharge(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        timeProjectChargeServices.updateUserProjectCharge(payload)
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
    function request(data) { return { type: timeTracksTypes.TIMETRACKS_REQUEST, data } }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}

export function deleteUserProjectCharge(id) {
    return dispatch => {
        dispatch(request());
        timeProjectChargeServices.deleteUserProjectCharge(id)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data.status));
                    }
                }
            )
    }
    function request(data) { return { type: timeTracksTypes.TIMETRACKS_REQUEST, data } }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}
