import { tasksTypes } from '../../type/Task/tasks.types'

export function tasksReducer(state = {}, action) {
    switch (action.type) {
        case tasksTypes.TASK_REQUEST:
            return {
                taskRequest: 'taskRequest'
            };
        case tasksTypes.TASK_SUCCESS:
            return {
                data: action.data,
            };
        case tasksTypes.TASK_FAILURE:
            return {
                datefailure: action.data,
            };
        default:
            return state;
    }
};

export function taskCountReducer(state = {}, action) {
    switch (action.type) {
        case tasksTypes.TASK_COUNT:
          return {
            count: action.count
          };
        default:
          return state
      }
};
