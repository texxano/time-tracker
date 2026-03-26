import { jobsTypes } from '../../type/SettingsAdmin/jobs.types';
import { jobsService } from '../../../services/SettingsAdmin/jobs.services';

export function startJobs() {
    return dispatch => {
        dispatch(request());
        jobsService.startJobs()
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
    function request(data) { return { type: jobsTypes.JOBS_REQUEST, data } }
    function success(data) { return { type: jobsTypes.JOBS_SUCCESS, data } }
    function failure(data) { return { type: jobsTypes.JOBS_FAILURE, data } }
}
