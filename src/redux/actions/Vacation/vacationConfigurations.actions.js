import { vacationTypes } from '../../type/Vacation/vacation.types';
import {vacationConfigurationsServices } from '../../../services/Vacation/vacationConfigurations.services';


export function updateConfigurationVacation(payload) {
    return dispatch => {
        dispatch(request(payload.rootId));
        vacationConfigurationsServices.updateConfigurationVacation(payload)
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
    function request(data) { return { type: vacationTypes.VACATION_REQUEST, data } }
    function success(data) { return { type: vacationTypes.VACATION_SUCCESS, data } }
    function failure(data) { return { type: vacationTypes.VACATION_FAILURE, data } }
}

export function enableVacationModule(id) {
    return dispatch => {
        dispatch(request(id));
        vacationConfigurationsServices.enableVacationModule(id)
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
    function request(data) { return { type: vacationTypes.VACATION_REQUEST, data } }
    function success(data) { return { type: vacationTypes.VACATION_SUCCESS, data } }
    function failure(data) { return { type: vacationTypes.VACATION_FAILURE, data } }
}
export function disableVacationModule(id) {
    return dispatch => {
        dispatch(request(id));
        vacationConfigurationsServices.disableVacationModule(id)
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
    function request(data) { return { type: vacationTypes.VACATION_REQUEST, data } }
    function success(data) { return { type: vacationTypes.VACATION_SUCCESS, data } }
    function failure(data) { return { type: vacationTypes.VACATION_FAILURE, data } }
}
