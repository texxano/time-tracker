import { openAiTypes } from '../../type/OpenAi/openAi.types'

export function openAiReducer(state = {}, action) {
    switch (action.type) {
        case openAiTypes.OPEN_AI_REQUEST:
            return {
                openAiRequest: 'openAiRequest'
            };
        case openAiTypes.OPEN_AI_SUCCESS:
            return {
                data: action.data
            };
        case openAiTypes.OPEN_AI_FAILURE:
            return {
                failure: action.data.title
            };
        default:
            return state;
    }
};
