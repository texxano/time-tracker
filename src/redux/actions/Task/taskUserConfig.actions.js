import { tasksTypes } from '../../type/Task/tasks.types';
import {taskUserConfigServices } from '../../../services/Task/taskUserConfig.services';

export function taskUserConfig(payload) {
    return dispatch => {
        taskUserConfigServices.taskUserConfig(payload)
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
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
