import { teamsTypes } from '../../type/UsersTeams/teams.types';
import { teamsServices } from '../../../services/UsersTeams/teams.services';

export function createTeams(dataBody) {
    return dispatch => {
        dispatch(request(dataBody.name));
        teamsServices.createTeams(dataBody)
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
    function request(data) { return { type: teamsTypes.TEAMS_REQUEST, data } }
    function success(data) { return { type: teamsTypes.TEAMS_SUCCESS, data } }
    function failure(data) { return { type: teamsTypes.TEAMS_FAILURE, data } }
}
export function deleteTeams(id) {
    return dispatch => {
        dispatch(request(id));
        teamsServices.deleteTeams(id)
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
    function request(data) { return { type: teamsTypes.TEAMS_REQUEST, data } }
    function success(data) { return { type: teamsTypes.TEAMS_SUCCESS, data } }
    function failure(data) { return { type: teamsTypes.TEAMS_FAILURE, data } }
}

export function createLead(userId, teamId) {
    return dispatch => {
        dispatch(request(userId));
        teamsServices.createLead(userId, teamId)
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
    function request(data) { return { type: teamsTypes.TEAMS_REQUEST, data } }
    function success(data) { return { type: teamsTypes.TEAMS_SUCCESS, data } }
    function failure(data) { return { type: teamsTypes.TEAMS_FAILURE, data } }
}
export function createMember(teamId, userId) {
    return dispatch => {
        dispatch(request(userId));
        teamsServices.createMember(teamId, userId)
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
    function request(data) { return { type: teamsTypes.TEAMS_REQUEST, data } }
    function success(data) { return { type: teamsTypes.TEAMS_SUCCESS, data } }
    function failure(data) { return { type: teamsTypes.TEAMS_FAILURE, data } }
}
export function deleteMember(dataBody) {
    return dispatch => {
        dispatch(request(dataBody.id));
        teamsServices.deleteMember(dataBody)
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
    function request(data) { return { type: teamsTypes.TEAMS_REQUEST, data } }
    function success(data) { return { type: teamsTypes.TEAMS_SUCCESS, data } }
    function failure(data) { return { type: teamsTypes.TEAMS_FAILURE, data } }
}
