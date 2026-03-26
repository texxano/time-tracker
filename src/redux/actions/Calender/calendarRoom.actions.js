import { calendarTypes } from '../../type/Calendar/calendar.types';
import { calendarRoomServices } from '../../../services/Calendar/calendarRoom.services';

export function createCalendarRoom(payload) {
    return dispatch => {
        dispatch(request(payload.tilte));
        calendarRoomServices.createCalendarRoom(payload)
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
    function request(data) { return { type: calendarTypes.CALENDAR_REQUEST, data } }
    function success(data) { return { type: calendarTypes.CALENDAR_SUCCESS, data } }
    function failure(data) { return { type: calendarTypes.CALENDAR_FAILURE, data } }
}
export function updateCalendarRoom(payload) {
    return dispatch => {
        dispatch(request(payload.id));
        calendarRoomServices.updateCalendarRoom(payload)
            .then(
                data => {
                    if (data?.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data));
                    }
                }
            )
    }
    function request(data) { return { type: calendarTypes.CALENDAR_REQUEST, data } }
    function success(data) { return { type: calendarTypes.CALENDAR_SUCCESS, data } }
    function failure(data) { return { type: calendarTypes.CALENDAR_FAILURE, data } }
}

export function deleteByIdCalendarRoom(id) {
    return dispatch => {
        dispatch(request(id));
        calendarRoomServices.deleteByIdCalendarRoom(id)
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
    function request(data) { return { type: calendarTypes.CALENDAR_REQUEST, data } }
    function success(data) { return { type: calendarTypes.CALENDAR_SUCCESS, data } }
    function failure(data) { return { type: calendarTypes.CALENDAR_FAILURE, data } }
}
