import { documentsTypes } from '../../type/Project/document.types';
import { documentService } from '../../../services/Project/document.services';


export function postDocument(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        documentService.postDocument(payload)
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
    function request(data) { return { type: documentsTypes.DOCUMENT_REQUEST, data } }
    function success(data) { return { type: documentsTypes.DOCUMENT_SUCCESS, data } }
    function failure(data) { return { type: documentsTypes.DOCUMENT_FAILURE, data } }
}

export function deleteByIdDocument(id) {
    return dispatch => {
        dispatch(request(id));
        documentService.deleteByIdDocument(id)
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
    function request(data) { return { type: documentsTypes.DOCUMENT_REQUEST, data } }
    function success(data) { return { type: documentsTypes.DOCUMENT_SUCCESS, data } }
    function failure(data) { return { type: documentsTypes.DOCUMENT_FAILURE, data } }
}
export function deleteAllDocument(projectId) {
    return dispatch => {
        dispatch(request(projectId));
        documentService.deleteAllDocument(projectId)
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
    function request(data) { return { type: documentsTypes.DOCUMENT_REQUEST, data } }
    function success(data) { return { type: documentsTypes.DOCUMENT_SUCCESS, data } }
    function failure(data) { return { type: documentsTypes.DOCUMENT_FAILURE, data } }
}
export function updateNameDocument(payload) {
    return dispatch => {
        dispatch(request(payload.name));
        documentService.updateNameDocument(payload)
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
    function request(data) { return { type: documentsTypes.DOCUMENT_REQUEST, data } }
    function success(data) { return { type: documentsTypes.DOCUMENT_SUCCESS, data } }
    function failure(data) { return { type: documentsTypes.DOCUMENT_FAILURE, data } }
}

export const documentCount = count => ({ type: documentsTypes.DOCUMENT_COUNT, count: count });
export const documentSatistic = data => ({ type: documentsTypes.DOCUMENT_SATISTIC, data: data });
