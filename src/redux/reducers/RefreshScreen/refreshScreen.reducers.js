import { userAuthrefreshTypes } from '../../type/RefreshScreen/refreshScreen.types'

export function refreshScreenReducer(state = {}, action) {
    switch (action.type) {
        case userAuthrefreshTypes.REFRESH_SCREEN_SUCCESS:
          return {
            refresh: action.refresh
          };
        default:
          return state
      }
};
