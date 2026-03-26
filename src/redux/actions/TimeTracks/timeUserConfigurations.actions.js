import { timeTracksTypes } from '../../type/TimeTracks/timeTracks.types';
import { timeUserConfigurationsServices } from '../../../services/TimeTracks/timeUserConfigurations.services';

export function timeUserSupervisor(payload) {
    return dispatch => {
        dispatch(request(payload.userId));
        timeUserConfigurationsServices.timeUserSupervisor(payload)
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
