import { timeTracksTypes } from '../../type/TimeTracks/timeTracks.types';
import { timeModuleConfigurationsServices } from '../../../services/TimeTracks/timeModuleConfigurations.services';

export function enableTimeModule(id) {
    return dispatch => {
        timeModuleConfigurationsServices.enableTimeModule(id)
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
export function disableTimeModule(id) {
    return dispatch => {;
        timeModuleConfigurationsServices.disableTimeModule(id)
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
