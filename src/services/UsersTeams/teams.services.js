import http from '../http'

export const teamsServices = {
    createTeams,
    deleteTeams,
    createLead,
    createMember,
    deleteMember
};

function createTeams(dataBody) {
    return http.post("/teams", dataBody)
        .then(function (response) {
            return response;
        })
}

function deleteTeams(id) {
    return http.delete(`/teams/${id}`)
        .then(function (response) {
            return response;
        })
}

function createLead(dataBody) {
    return http.post(`/teams/${dataBody.teamId}/lead/${dataBody.userId}`)
        .then(function (response) {
            return response;
        })
}

function createMember(teamId, userId) {
    return http.post(`/teams/${teamId}/member/${userId}`)
        .then(function (response) {
            return response;
        })
}

function deleteMember(dataBody) {
    return http.delete(`/teams/${dataBody.teamId}/member/${dataBody.id}`)
        .then(function (response) {
            return response;
        })
}
