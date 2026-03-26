import { calendarTypes } from '../../type/Calendar/calendar.types';
import { calendarService } from '../../../services/Calendar/calendar.services';
import { NavigationService } from "../../../navigator";


export function createCalendarEvent(payload) {
    return dispatch => {
        dispatch(request(payload.tilte));
        calendarService.createCalendarEvent(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));

                    } else {
                        dispatch(success(data));
                        NavigationService.navigate('Calendar', { locationActive: "3", id: data.id, update: false })
                    }
                }
            )
    }
    function request(data) { return { type: calendarTypes.CALENDAR_REQUEST, data } }
    function success(data) { return { type: calendarTypes.CALENDAR_SUCCESS, data } }
    function failure(data) { return { type: calendarTypes.CALENDAR_FAILURE, data } }
}
export function updateCalendarEvent(payload) {
    return dispatch => {
        dispatch(request(payload.id));
        calendarService.updateCalendarEvent(payload)
            .then(
                data => {
                    if (data?.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data));
                        NavigationService.navigate('Calendar', { locationActive: "3", id: data.id, update: false })
                    }
                }
            )
    }
    function request(data) { return { type: calendarTypes.CALENDAR_REQUEST, data } }
    function success(data) { return { type: calendarTypes.CALENDAR_SUCCESS, data } }
    function failure(data) { return { type: calendarTypes.CALENDAR_FAILURE, data } }
}

export function deleteByIdCalendarEvent(id) {
    return dispatch => {
        try {
            dispatch(request(id));
            calendarService.deleteByIdCalendarEvent(id)
                .then(
                    data => {
                        if (data.status <= 299) {
                            dispatch(success(data.status));
                            NavigationService.navigate('Calendar', { locationActive: "0"})
                        } else {
                            dispatch(failure(data));
                        }
                    }
                )
        } catch (error) {
                console.log(error, "error")
        }
      
    }
    function request(data) { return { type: calendarTypes.CALENDAR_REQUEST, data } }
    function success(data) { return { type: calendarTypes.CALENDAR_SUCCESS, data } }
    function failure(data) { return { type: calendarTypes.CALENDAR_FAILURE, data } }
}

export function acceptCalendarEvent(id) {
    return dispatch => {
        dispatch(request(id));
        calendarService.acceptCalendarEvent(id)
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

export function declineCalendarEvent(id) {
    return dispatch => {
        dispatch(request(id));
        calendarService.declineCalendarEvent(id)
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
