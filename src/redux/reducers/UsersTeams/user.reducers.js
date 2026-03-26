import { usersTypes } from '../../type/UsersTeams/user.types'
const prevState = {
}

export function userReducer(state = prevState, action) {
    switch (action.type) {
        case usersTypes.USER_REQUEST:
            return {
                userRequest: 'userRequest'
            };
        case usersTypes.USER_SUCCESS:
            return {
                data: action.data
            };
        case usersTypes.USER_FAILURE:
            return {
                data: action.data,
                title: action.data.title,
            };
        default:
            return state;
    }
};

export function userCountReducer(state = {}, action) {
    switch (action.type) {
        case usersTypes.URER_COUNT:
          return {
            count: action.count
          };
        default:
          return state
      }
};
