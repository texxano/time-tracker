import { calendarTypes } from '../../type/Calendar/calendar.types';

import {calendarUserConfigServices } from '../../../services/Calendar/calendarUserConfig.services';

export function calendarUserConfig(payload) {
    return dispatch => {
        calendarUserConfigServices.calendarUserConfig(payload)
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
    function success(data) { return { type: calendarTypes.CALENDAR_SUCCESS, data } }
    function failure(data) { return { type: calendarTypes.CALENDAR_FAILURE, data } }
}
