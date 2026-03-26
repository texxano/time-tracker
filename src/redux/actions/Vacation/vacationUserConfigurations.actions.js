import { vacationTypes } from '../../type/Vacation/vacation.types';
import {vacationUserConfigurationsServices } from '../../../services/Vacation/vacationUserConfigurations.services';

export function userApproverVacation(payload) {
    return dispatch => {
        dispatch(request(payload.userId));
        vacationUserConfigurationsServices.vacationUserConfigurations(payload)
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
    function request(data) { return { type: vacationTypes.VACATION_REQUEST, data } }
    function success(data) { return { type: vacationTypes.VACATION_SUCCESS, data } }
    function failure(data) { return { type: vacationTypes.VACATION_FAILURE, data } }
}
