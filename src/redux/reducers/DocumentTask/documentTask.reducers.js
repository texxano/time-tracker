import { documentTasksTypes } from "../../type/DocumentTask/documentTasks.types";

export function documentTaskReducer(
  state = {
    iosCameraStart: false,
  },
  action
) {
  switch (action.type) {
    case documentTasksTypes.DOCUMENT_TASKS_REQUEST:
      return {
        documentTasksRequest: "documentTasksRequest",
      };
    case documentTasksTypes.DOCUMENT_TASKS_SUCCESS:
      return {
        data: action.data,
      };
    case documentTasksTypes.DOCUMENT_TASKS_FAILURE:
      return {
        datefailure: action.data,
      };
    case documentTasksTypes.DOCUMENT_TASKS_RESET:
      return state;

    case documentTasksTypes.DOCUMENT__TASK_IOS_CAMERA_START:
      return {
        ...state,
        iosCameraStart: true,
      };
    case documentTasksTypes.DOCUMENT__TASK_IOS_CAMERA_END:
      return {
        ...state,
        iosCameraStart: false,
      };
    default:
      return state;
  }
}

export function documentTaskCountReducer(state = {}, action) {
  switch (action.type) {
    case documentTasksTypes.DOCUMENT_TASKS_COUNT:
      return {
        count: action.count,
      };
    default:
      return state;
  }
}
