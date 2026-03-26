import { openAiTypes } from '../../type/OpenAi/openAi.types';
import { openAiUserConfigServices } from '../../../services/OpenAi/openAiUserConfig.services';

export function openAiUserConfig(payload) {
    return dispatch => {
        openAiUserConfigServices.openAiUserConfig(payload)
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
    function success(data) { return { type: openAiTypes.OPEN_AI_SUCCESS, data } }
    function failure(data) { return { type: openAiTypes.OPEN_AI_FAILURE, data } }
}
export function clean(data) {
    return dispatch => {
        dispatch(success(data));
    }
    function success(data) { return { type: openAiTypes.OPEN_AI_SUCCESS, data } }
}
