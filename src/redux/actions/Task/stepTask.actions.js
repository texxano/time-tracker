import { tasksTypes } from '../../type/Task/tasks.types';
import { stepTaskServices } from '../../../services/Task/stepTask.Services';



export function createStepTask(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        stepTaskServices.createStepTask(payload)
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
    function request(data) { return { type: tasksTypes.TASK_REQUEST, data } }
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
export function updateStepTask(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        stepTaskServices.updateStepTask(payload)
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
    function request(data) { return { type: tasksTypes.TASK_REQUEST, data } }
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
export function stepCompleteTask(payload) {
    return dispatch => {
        dispatch(request(payload.id));
        stepTaskServices.stepCompleteTask(payload)
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
    function request(data) { return { type: tasksTypes.TASK_REQUEST, data } }
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
export function stepRollbackTask(payload) {
    return dispatch => {
        dispatch(request(payload.id));
        stepTaskServices.stepRollbackTask(payload)
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
    function request(data) { return { type: tasksTypes.TASK_REQUEST, data } }
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
export function deleteStepTask(id) {
    return dispatch => {
        dispatch(request(id));
        stepTaskServices.stepRollbackTask(id)
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
    function request(data) { return { type: tasksTypes.TASK_REQUEST, data } }
    function success(data) { return { type: tasksTypes.TASK_SUCCESS, data } }
    function failure(data) { return { type: tasksTypes.TASK_FAILURE, data } }
}
