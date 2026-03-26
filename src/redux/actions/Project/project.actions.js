import { projectsTypes } from '../../type/Project/project.types';
import { projectService } from '../../../services/Project/project.services';
import { NavigationService } from "../../../navigator";


import { documentCount, documentSatistic } from './document.actions'
import { commentCount } from './comment.actions'
import { activitiesCount } from './activities.actions'
import { userCount } from '../UsersTeams/user.actions'

export function getProject(projectId, navigateFrom, refreshNr) {
    return dispatch => {
        dispatch(request(projectId));
        if (!refreshNr) {
            dispatch(projectCount())
            dispatch(documentCount())
            dispatch(commentCount())
            dispatch(userCount())
            dispatch(activitiesCount())
        }
        projectService.getProject(projectId)
            .then(
                async data => {
                    if (data.traceId) {
                        dispatch(projectCount(0))
                        dispatch(documentCount(0))
                        dispatch(commentCount(0))
                        dispatch(userCount(0))
                        dispatch(activitiesCount(0))
                        dispatch(failure(data));
                    } else {
                        await Promise.all([
                            dispatch(projectCount(data.subProjectsNumber)),
                            dispatch(documentCount(data.documentsNumber)),
                            dispatch(commentCount(data.commentsNumber)),
                            dispatch(activitiesCount(data.activitiesNumber)),
                            dispatch(userCount(data.rootUsersNumber)),
                            dispatch(success(data))
                        ])
                        let dataDoc = {
                            id: data.id,
                            percentageCompleted: data.percentageCompleted,
                            parentId: data.parentId,
                            size: data.size,
                            sizeIncludingSubs: data.sizeIncludingSubs,
                            capacity: data.capacity,
                            completedSubProjects: data.completedSubProjects,
                            subProjectsNumber: data.subProjectsNumber,
                            documentsNumber: data.documentsNumber,
                            documentsNumberIncludingSubs: data.documentsNumberIncludingSubs,
                        }
                        dispatch(documentSatistic(dataDoc))

                        if (navigateFrom) {
                            dispatch(idRootProject(projectId))
                        }
                    }
                }
            )
            .catch(() => {
                dispatch(projectCount(0))
                dispatch(documentCount(0))
                dispatch(commentCount(0))
                dispatch(userCount(0))
                dispatch(activitiesCount(0))
                dispatch(failure());
            })
    }
    function request(data) { return { type: projectsTypes.GET_PROJECT_DATA_REQUEST, data } }
    function success(data) { return { type: projectsTypes.GET_PROJECT_DATA, data } }
    function failure(data) { return { type: projectsTypes.GET_PROJECT_DATA_FAILURE, data } }


}

export function createRootProject(payload) {
    return dispatch => {
        dispatch(request(payload.title));
        projectService.createRootProject(payload)
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
    function request(data) { return { type: projectsTypes.PROJECT_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAILURE, data } }
}
export function createProject(payload, addUsers) {
    return dispatch => {
        dispatch(request(payload.title));
        projectService.createProject(payload)
            .then(
                data => {
                    if (data.id) {
                        dispatch(success(data.id));
                        if (payload.onlyThesePermissions || addUsers) {
                            NavigationService.navigate('UsersPermissions', {
                                projectId: data.id,
                                parentId: payload.parentId,
                                permissionCode: 3,
                                projectName: payload.title,
                                navigateFrom: "Project"
                            })
                        }
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: projectsTypes.PROJECT_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAILURE, data } }
}
export function updateProject(payload) {
    return dispatch => {
        dispatch(request(payload.title));
        projectService.updateProject(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: projectsTypes.PROJECT_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAILURE, data } }
}

export function deleteProject(id) {
    return dispatch => {
        dispatch(request(id));
        projectService.deleteProject(id)
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
    function request(data) { return { type: projectsTypes.PROJECT_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAILURE, data } }
}
export function addlogoRootProject(name, base64Content, rootId) {
    return dispatch => {
        dispatch(request(name));
        projectService.addlogoRootProject(name, base64Content, rootId)
            .then(
                data => {
                    if (data.status) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: projectsTypes.PROJECT_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAILURE, data } }
}

export function removeLogoRootProject(rootId) {
    return dispatch => {
        dispatch(request(rootId));
        projectService.removeLogoRootProject(rootId)
            .then(
                data => {
                    if (data.status) {
                        dispatch(success(data));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: projectsTypes.PROJECT_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAILURE, data } }
}

export function addFavoriteProject(id) {
    return dispatch => {
        dispatch(request(id));
        projectService.addFavoriteProject(id)
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
    function request(data) { return { type: projectsTypes.PROJECT_FAVORITE_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_FAVORITE_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAVORITE_FAILURE, data } }
}

export function removeFavoriteProject(id) {
    return dispatch => {
        dispatch(request(id));
        projectService.removeFavoriteProject(id)
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
    function request(data) { return { type: projectsTypes.PROJECT_FAVORITE_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_FAVORITE_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAVORITE_FAILURE, data } }
}

export function moveProject(payload) {
    return dispatch => {
        dispatch(request(payload.projectId));
        projectService.moveProject(payload)
            .then(
                data => {
                    if (data.status) {
                        dispatch(success(data.status));
                    } else {
                        dispatch(failure(data));
                    }
                }
            )
    }
    function request(data) { return { type: projectsTypes.PROJECT_REQUEST, data } }
    function success(data) { return { type: projectsTypes.PROJECT_SUCCESS, data } }
    function failure(data) { return { type: projectsTypes.PROJECT_FAILURE, data } }
}

export const projectCount = count => ({ type: projectsTypes.PROJECT_COUNT, count: count });

export const idRootProject = id => ({ type: projectsTypes.ID_ROOT_PROJECT, id: id });
