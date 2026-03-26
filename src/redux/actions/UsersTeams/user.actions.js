import { usersTypes } from '../../type/UsersTeams/user.types';
import { userAuthTypes } from '../../type/Authentication/userAuth.types';
import { userService } from '../../../services/UsersTeams/user.services';
import { translation } from '../Translations/translation.action'
import { NavigationService } from "../../../navigator";

export function createUser(payload) {
    return dispatch => {
        dispatch(request(payload.firstName));
        userService.createUser(payload)
            .then(
                data => {
                    console.log('📊 createUser API response:', data);
                    if (data.status) {
                        console.log('❌ createUser failed with status:', data);
                        dispatch(failure(data));
                    } else {
                        console.log('✅ createUser succeeded:', data);
                        dispatch(success(data));
                    }
                }
            )
            .catch(error => {
                console.error('❌ createUser API Error:', error);
                dispatch(failure({ status: true, message: error.message || 'Network error occurred' }));
            })
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}
export function deleteUser(id) {
    return dispatch => {
        dispatch(request(id));
        userService.deleteUser(id)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}

export function updateUserProfile(payload, password) {
    return dispatch => {
        dispatch(request(payload.firstName));
        userService.updateProfile(payload)
            .then(
                data => {

                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        if (password) {
                            dispatch(updatePassword(data.id, password, false));
                        }
                        dispatch(success(data));
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}
export function updateMyProfile(id, firstName, lastName, phoneNumber, email, language, enableTracking, countryCode) {
    const payload = { id, firstName, lastName, phoneNumber, email, language, enableTracking, countryCode }
    return dispatch => {
        dispatch(request(firstName));
        userService.updateProfile(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(translation(data.language));
                        dispatch(success(data));
                        dispatch(successData(data));
                        if (newPassword) {
                            NavigationService.navigate('Profile');
                        }
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function successData(data) { return { type: userAuthTypes.USER_DATA_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}
export function updateLanguage(language) {
    const payload = { language }
    return dispatch => {
        dispatch(request(language));
        userService.updateLanguage(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(translation(language));
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}

export function updatePassword(id, newPassword, My) {
    const payload = { id, newPassword }
    return dispatch => {
        dispatch(request(id));
        userService.updatePassword(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data));
                        if (My) {
                            dispatch(successData(data));
                        }

                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function successData(data) { return { type: userAuthTypes.USER_DATA_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}
export function updateNotifications(payload) {
    return dispatch => {
        dispatch(request(payload.id));
        userService.updateNotifications(payload)
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
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function successData(data) { return { type: userAuthTypes.USER_DATA_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}
export function lockUser(id) {
    return dispatch => {
        dispatch(request(id));
        userService.lockUser(id)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}

export function unlockUser(id) {
    return dispatch => {
        dispatch(request(id));
        userService.unlockUser(id)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}

export function lockAllUser(rootId) {
    return dispatch => {
        dispatch(request(rootId));
        userService.lockAllUser(rootId)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}

export function unlockAllUser(id) {
    return dispatch => {
        dispatch(request(id));
        userService.unlockAllUser(id)
            .then(
                data => {
                    if (data.status <= 299) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: usersTypes.USER_REQUEST, data } }
    function success(data) { return { type: usersTypes.USER_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}

export const userCount = count => ({ type: usersTypes.URER_COUNT, count: count });



export function getMe() {
    return dispatch => {

        userService.getMe()
            .then(
                data => {
                    if (data.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(translation(data.language));
                        dispatch(successData(data));
                    }
                }
            )
            .catch(error => {
                // Silent fail if no token - user is not logged in
                if (error?.message?.includes('No token')) {
                    console.log('User not logged in yet');
                } else {
                    console.error('Failed to fetch user data:', error);
                }
            });
    }
    function successData(data) { return { type: userAuthTypes.USER_DATA_SUCCESS, data } }
    function failure(data) { return { type: usersTypes.USER_FAILURE, data } }
}