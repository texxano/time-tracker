import { tasksTypes } from '../../type/Task/tasks.types';
import { taskServices } from '../../../services/Task/task.Services';


export function createTaskName(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        taskServices.createTaskName(payload)
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

export function updateTaskName(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        taskServices.updateTaskName(payload)
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

export function completeAllTasks(id) {
    return dispatch => {
        dispatch(request(id));
        taskServices.completeAllTasks(id)
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

export function deleteTask(id) {
    return dispatch => {
        dispatch(request(id));
        taskServices.deleteTask(id)
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

export const taskCount = count => ({ type: tasksTypes.TASK_COUNT, count: count });
