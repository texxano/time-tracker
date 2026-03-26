import { commentTypes } from '../../type/Project/comment.types';
import { commentServices } from '../../../services/Project/comment.services';


export function postComment(payload) {
    return dispatch => {
        dispatch(request(payload.content));
        commentServices.postComment(payload)
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
    function request(data) { return { type: commentTypes.COMMENT_POST_REQUEST, data } }
    function success(data) { return { type: commentTypes.COMMENT_SUCCESS, data } }
    function failure(data) { return { type: commentTypes.COMMENT_FAILURE, data } }
}
export function deleteAllComment(projectId) {
    return dispatch => {
        dispatch(request(projectId));
        commentServices.deleteAllComment(projectId)
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
    function request(data) { return { type: commentTypes.COMMENT_DELETE_ALL_REQUEST, data } }
    function success(data) { return { type: commentTypes.COMMENT_SUCCESS, data } }
    function failure(data) { return { type: commentTypes.COMMENT_FAILURE, data } }
}

export function deleteByIdComment(id) {
    return dispatch => {
        dispatch(request(id));
        commentServices.deleteByIdComment(id)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: commentTypes.COMMENT_DELETE_REQUEST, data } }
    function success(data) { return { type: commentTypes.COMMENT_SUCCESS, data } }
    function failure(data) { return { type: commentTypes.COMMENT_FAILURE, data } }
}

export const commentCount = count => ({ type: commentTypes.COMMENT_COUNT, count: count });
