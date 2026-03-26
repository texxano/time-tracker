import { documentsTypes } from '../../type/Project/document.types'

export function documentReducer(state = {}, action) {
    switch (action.type) {
        case documentsTypes.DOCUMENT_REQUEST:
            return {
                documentRequest: 'documentRequest'
            };
        case documentsTypes.DOCUMENT_SUCCESS:
            return {
                data: action.data
            };
        case documentsTypes.DOCUMENT_FAILURE:
            return {
                data: action.data.detail
            };
        default:
            return state;
    }
};

export function documentCountReducer(state = {}, action) {
    switch (action.type) {
        case documentsTypes.DOCUMENT_COUNT:
          return {
            count: action.count
          };
        default:
          return state
      }
};

export function documentSatisticReducer(state = {}, action) {
    switch (action.type) {
        case documentsTypes.DOCUMENT_SATISTIC:
          return {
            data: action.data
          };
        default:
          return state
      }
};
