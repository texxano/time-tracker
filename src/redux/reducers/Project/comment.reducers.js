import { commentTypes } from '../../type/Project/comment.types'

export function commentReducer(state = {}, action) {
    switch (action.type) {
        case commentTypes.COMMENT_POST_REQUEST:
            return {
                commentPostRequest: 'commentPostRequest'
            };
        case commentTypes.COMMENT_DELETE_REQUEST:
            return {
                commentDeleteRequest: 'commentDeleteRequest'
            };
        case commentTypes.COMMENT_DELETE_ALL_REQUEST:
            return {
                commentAllDeleteRequest: 'commentAllDeleteRequest'
            };
        case commentTypes.COMMENT_SUCCESS:
            return {
                data: action.data
            };
        case commentTypes.COMMENT_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};

export function commentCountReducer(state = {}, action) {
    switch (action.type) {
        case commentTypes.COMMENT_COUNT:
            return {
                count: action.count
            };
        default:
            return state
    }
};