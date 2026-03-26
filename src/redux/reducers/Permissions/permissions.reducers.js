import { permissionsTypes } from '../../type/Permissions/permissions.types'
const prevState = {
}

export function permissionsReducers(state = prevState, action) {
    switch (action.type) {
        case permissionsTypes.PERMISSIONS_SUCCESS:
            return {
                data: action.data
            };
        case permissionsTypes.PERMISSIONS_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};