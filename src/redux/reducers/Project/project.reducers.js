import { projectsTypes } from '../../type/Project/project.types'

export function getProjectDataReducer(state = {}, action) {
    switch (action.type) {
        case projectsTypes.GET_PROJECT_DATA_REQUEST:
            return {
                getProjectRequest: 'getProjectRequest'
            };
        case projectsTypes.GET_PROJECT_DATA:
            return {
                parentId: action.data.parentId,
                id: action.data.id,
                title: action.data.title,
                loggedUserPermissionCode: action.data.loggedUserPermissionCode
            };
        case projectsTypes.GET_PROJECT_DATA_FAILURE:
            return {
                unauthorized: "unauthorized",
            };
        default:
            return state;
    }
};
const prevState = {
    success: true
}

export function projectReducer(state = prevState, action) {
    switch (action.type) {
        case projectsTypes.PROJECT_REQUEST:
            return {
                projectRequest: 'projectRequest',
                success: false
            };
        case projectsTypes.PROJECT_SUCCESS:
            return {
                success: true
            };
        case projectsTypes.PROJECT_FAILURE:
            return {
                failure: action.data.title,
                success: false
            };
        default:
            return state;
    }
};
export function projectCountReducer(state = {}, action) {
    switch (action.type) {
        case projectsTypes.PROJECT_COUNT:
            return {
                count: action.count
            };
        default:
            return state
    }
};
export function idRootProjectReducer(state = {}, action) {
    switch (action.type) {
        case projectsTypes.ID_ROOT_PROJECT:
            return {
                id: action.id
            };
        default:
            return state
    }
};

export function favoriteProjectReducer(state = {}, action) {
    switch (action.type) {
        case projectsTypes.PROJECT_FAVORITE_REQUEST:
            return {
                projectRequestId: action.data
            };
        case projectsTypes.PROJECT_FAVORITE_SUCCESS:
            return {
                data: action.data
            };
        case projectsTypes.PROJECT_FAVORITE_FAILURE:
            return {
                data: action.data
            };
        default:
            return state;
    }
};