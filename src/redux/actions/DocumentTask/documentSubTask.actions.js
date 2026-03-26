import { documentTasksTypes } from '../../type/DocumentTask/documentTasks.types';
import { documentSubTaskServices } from '../../../services/DocumentTask/documentSubTask.Services';

export function createDocumentSubTask(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        documentSubTaskServices.createDocumentSubTask(payload)
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
    function request(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data } }
    function success(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data } }
    function failure(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data } }
}

export function updateDocumentSubTask(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        documentSubTaskServices.updateDocumentSubTask(payload)
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
    function request(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data } }
    function success(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data } }
    function failure(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data } }
}

export function completeDocumentSubTask(payload) {
    return dispatch => {
        dispatch(request(payload.id));
        documentSubTaskServices.completeDocumentSubTask(payload)
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
    function request(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data } }
    function success(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data } }
    function failure(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data } }
}

export function rollbackDocumentSubTask(payload) {
    return dispatch => {
        dispatch(request(payload.id));
        documentSubTaskServices.rollbackDocumentSubTask(payload)
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
    function request(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data } }
    function success(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data } }
    function failure(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data } }
}

export function deleteDocumentSubTask(id) {
    return dispatch => {
        dispatch(request(id));
        documentSubTaskServices.deleteDocumentSubTask(id)
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
    function request(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_REQUEST, data } }
    function success(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data } }
    function failure(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data } }
}
