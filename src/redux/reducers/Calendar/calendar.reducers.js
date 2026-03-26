import { calendarTypes } from '../../type/Calendar/calendar.types'

export function calendarReducers(state = {}, action) {
    switch (action.type) {
        case calendarTypes.CALENDAR_REQUEST:
            return {
                request: 'request'
            }
        case calendarTypes.CALENDAR_SUCCESS:
            return {
                data: action.data
            };
        case calendarTypes.CALENDAR_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};