import http from '../http'

export const timeProjectChargeServices = {
    createUserProjectCharge,
    updateUserProjectCharge,
    deleteUserProjectCharge
};

function createUserProjectCharge(dataBody) {
    return http.post(`/timetracker/users/charges`, dataBody)
        .then(function (response) {
            return response;
        })
}

function updateUserProjectCharge(dataBody) {
    return http.put(`/timetracker/users/charges`, dataBody)
        .then(function (response) {
            return response;
        })
}


function deleteUserProjectCharge(id) {
    return http.delete(`/timetracker/users/charges/${id}`)
        .then(function (response) {
            return response;
        })
}
