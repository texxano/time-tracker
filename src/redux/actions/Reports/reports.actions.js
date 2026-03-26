import { reportsTypes } from '../../type/Reports/reports.types';
import { reportsServices } from '../../../services/Reports/reports.services';


export function reportTimeTrackPersonal(payload) {
    return dispatch => {
        dispatch(request(payload.fileFormat));
        reportsServices.reportTimeTrackPersonal(payload)
            .then(
                data => {
                    if (data.date) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: reportsTypes.REPORTS_REQUEST, data } }
    function success(data) { return { type: reportsTypes.REPORTS_SUCCESS, data } }
    function failure(data) { return { type: reportsTypes.REPORTS_FAILURE, data } }
}
export function reportTimeTrackRoot(payload) {
    return dispatch => {
        dispatch(request(payload.fileFormat));
        reportsServices.reportTimeTrackRoot(payload)
            .then(
                data => {
                    if (data.date) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: reportsTypes.REPORTS_REQUEST, data } }
    function success(data) { return { type: reportsTypes.REPORTS_SUCCESS, data } }
    function failure(data) { return { type: reportsTypes.REPORTS_FAILURE, data } }
}

export function reportTimeTrackUserRoot(payload) {
    return dispatch => {
        dispatch(request(payload.fileFormat));
        reportsServices.reportTimeTrackUserRoot(payload)
            .then(
                data => {
                    if (data.date) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: reportsTypes.REPORTS_REQUEST, data } }
    function success(data) { return { type: reportsTypes.REPORTS_SUCCESS, data } }
    function failure(data) { return { type: reportsTypes.REPORTS_FAILURE, data } }
}

export function reportProjectStatus(payload) {
    return dispatch => {
        dispatch(request(payload.fileFormat));
        reportsServices.reportProjectStatus(payload)
            .then(
                data => {
                    if (data.date) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: reportsTypes.REPORTS_REQUEST, data } }
    function success(data) { return { type: reportsTypes.REPORTS_SUCCESS, data } }
    function failure(data) { return { type: reportsTypes.REPORTS_FAILURE, data } }
}
export function deleteByIdReport(id) {
    return dispatch => {
        dispatch(request(id));
        reportsServices.deleteByIdReport(id)
            .then(
                data => {
                    if (data.status) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: reportsTypes.REPORTS_REQUEST, data } }
    function success(data) { return { type: reportsTypes.REPORTS_SUCCESS, data } }
    function failure(data) { return { type: reportsTypes.REPORTS_FAILURE, data } }
}
