import { jobsTypes } from '../../type/SettingsAdmin/jobs.types'

export function jobsReducer(state = {}, action) {
    switch (action.type) {
        case jobsTypes.JOBS_REQUEST:
            return {
                jobsRequest: 'jobsRequest'
            };
        case jobsTypes.JOBS_SUCCESS:
            return {
                data: action.data
            };
        case jobsTypes.JOBS_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
}