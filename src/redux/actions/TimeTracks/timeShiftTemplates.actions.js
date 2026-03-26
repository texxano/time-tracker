import { timeTracksTypes } from '../../type/TimeTracks/timeTracks.types';
import { timeShiftTemplatesServices } from '../../../services/TimeTracks/timeShiftTemplates.services';
import { NavigationService } from "../../../navigator";

export function createShiftTemplateName(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        timeShiftTemplatesServices.createShiftTemplateName(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data.status));
                        NavigationService.navigate('Time', { locationActive: "0", id: data.id })
                    }
                }
            )
    }
    function request(data) { return { type: timeTracksTypes.TIMETRACKS_REQUEST, data } }
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}

export function updatesShiftTemplate(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        timeShiftTemplatesServices.updatesShiftTemplate(payload)
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

export function createDayInShiftTemplate(id, payload) {
    return dispatch => {
        dispatch(request(id));
        timeShiftTemplatesServices.createDayInShiftTemplate(id, payload)
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

export function deleteDayShiftTemplate(id) {
    return dispatch => {
        ;
        timeShiftTemplatesServices.deleteDayShiftTemplate(id)
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
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}

export function deleteShiftTemplate(id) {
    return dispatch => {
        ;
        timeShiftTemplatesServices.deleteShiftTemplate(id)
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
    function success(data) { return { type: timeTracksTypes.TIMETRACKS_SUCCESS, data } }
    function failure(data) { return { type: timeTracksTypes.TIMETRACKS_FAILURE, data } }
}
