import { documentTasksTypes } from '../../type/DocumentTask/documentTasks.types';
import { documentTaskUserConfigServices } from '../../../services/DocumentTask/documentTaskUserConfig.services';

export function taskUserConfig(payload) {
    return dispatch => {
        documentTaskUserConfigServices.documentTaskUserConfig(payload)
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
    function success(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_SUCCESS, data } }
    function failure(data) { return { type: documentTasksTypes.DOCUMENT_TASKS_FAILURE, data } }
}
