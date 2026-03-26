import { tasksTypes } from '../../type/Task/tasks.types';
import { taskModuleConfigurationsServices } from '../../../services/Task/taskModuleConfigurations.services';

export function enableTaskModule(id) {
    return dispatch => {
        taskModuleConfigurationsServices.enableTaskModule(id)
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
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
export function disableTaskModule(id) {
    return dispatch => {
        ;
        taskModuleConfigurationsServices.disableTaskModule(id)
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
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
