import { userAuthTypes } from '../../type/Authentication/userAuth.types';


const prevState = {
  loggedIn: false,
}

export function authentication(state = prevState, action) {
  switch (action.type) {
    case userAuthTypes.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        request: false,
      };
    case userAuthTypes.LOGIN_FAILURE:
      return {
        loggedIn: false,
        request: false,
        title: action.data.title
      };
    case userAuthTypes.LOGOUT:
      return {
        loggedIn: false,
        request: false,
      };
    case userAuthTypes.LOGIN_REQUEST:
      return {
        loggedIn: false,
        request: true
      }
    default:
      return state
  }
}

export function requestRefreshToken(state = {}, action) {
  switch (action.type) {

    case userAuthTypes.TOKEN_REFRESH_REQUEST:
      return {
        requestRefreshToken: 'requestRefreshToken',
      }
    case userAuthTypes.STOP_TOKEN_REFRESH_REQUEST:
      return {};
    default:
      return state
  }
}
export function rememberLogin(state = {}, action) {
  switch (action.type) {

    case userAuthTypes.REMEMBER_LOGIN:
      return {
        username: action.data.username,
        password: action.data.password,
        remember: true
      } 
      case userAuthTypes.NOT_REMEMBER_LOGIN:
      return {
        username: '',
        password: '',
        remember: false
      }
    default:
      return state
  }
}