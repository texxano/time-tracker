import { userAuthTypes } from '../../type/Authentication/userAuth.types';


const prevState = {}

export function userToken(state = prevState, action) {
    switch (action.type) {
        case userAuthTypes.TOKEN_LOGIN_SUCCESS:
            return {
                tokenExpiration: action.dataSuccess.tokenExpirationEpoch,
                token: action.dataSuccess.token,
                refreshToken: action.dataSuccess.refreshToken,
            };
        case userAuthTypes.TOKEN_REFRESH_SUCCESS:
            return {
                tokenExpiration: action.dataSuccess.tokenExpirationEpoch,
                token: action.dataSuccess.token,
                refreshToken: action.dataSuccess.refreshToken,
            }
        case userAuthTypes.LOGOUT:
            return {};
        default:
            return state
    }
}