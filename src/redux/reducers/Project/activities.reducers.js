import { activitiesTypes } from '../../type/Project/activities.types'

export function activitiesCountReducer(state = {}, action) {
    switch (action.type) {
        case activitiesTypes.ACTIVITIES_COUNT:
          return {
            count: action.count
          };
        default:
          return state
      }
};