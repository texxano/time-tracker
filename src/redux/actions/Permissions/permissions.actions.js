import { permissionsTypes } from '../../type/Permissions/permissions.types';
import { permissionsService } from '../../../services/Permissions/permissions.services';


export function createPermissions(payload) {
    return dispatch => {
        permissionsService.createPermissions(payload)
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
    function success(data) { return { type: permissionsTypes.PERMISSIONS_SUCCESS, data } }
    function failure(data) { return { type: permissionsTypes.PERMISSIONS_FAILURE, data } }
}
export function updatePermissions(payload) {
    return dispatch => {
        permissionsService.updatePermissions(payload)
            .then(
                data => {
                    if (data?.status) {
                        dispatch(failure(data));
                    } else {
                        dispatch(success(data));
                    }
                }
            )
    }
    function success(data) { return { type: permissionsTypes.PERMISSIONS_SUCCESS, data } }
    function failure(data) { return { type: permissionsTypes.PERMISSIONS_FAILURE, data } }
}
export function deleteAllPermissions(id) {
    return dispatch => {
        permissionsService.deleteAllPermissions(id)
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
    function success(data) { return { type: permissionsTypes.PERMISSIONS_SUCCESS, data } }
    function failure(data) { return { type: permissionsTypes.PERMISSIONS_FAILURE, data } }
}

export function deleteByIdPermissions(id) {
    return dispatch => {
        permissionsService.deleteByIdPermissions(id)
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
    function success(data) { return { type: permissionsTypes.PERMISSIONS_SUCCESS, data } }
    function failure(data) { return { type: permissionsTypes.PERMISSIONS_FAILURE, data } }
}

export function deleteMyPermission(id, childProjects) {
    return dispatch => {
        permissionsService.deleteMyPermission(id, childProjects)
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
    function success(data) { return { type: permissionsTypes.PERMISSIONS_SUCCESS, data } }
    function failure(data) { return { type: permissionsTypes.PERMISSIONS_FAILURE, data } }
}
