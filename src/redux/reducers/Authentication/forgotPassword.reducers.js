import { userAuthTypes } from '../../type/Authentication/userAuth.types';


export function forgotPasswordReducers(state = {}, action) {
    switch (action.type) {
        case userAuthTypes.FORGOT_PASSWORD_REQUEST:
            return {
                request: 'request'
            }
        case userAuthTypes.FORGOT_PASSWORD_SUCCESS:
            return {
                success: "success"
            };
        case userAuthTypes.FORGOT_PASSWORD_FAILURE:
            return {
                title: action.data.title
            };
        default:
            return state
    }
}