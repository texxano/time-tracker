import http from '../http'

export const timeShiftUserServices = {
    createUserTimeShift,
    applyUserTimeShift,
    deleteAllUserShifts,
    deleteByIdUserShift
};

function createUserTimeShift(payload) {
    return http.post(`/timetracker/shifts`, payload)
        .then(function (response) {
            return response;
        })
}
function applyUserTimeShift(payload) {
    return http.post(`/timetracker/shifts/apply`, payload)
        .then(function (response) {
            return response;
        })
}
function deleteAllUserShifts(id) {
    return http.delete(`/timetracker/shifts/user/${id}`)
        .then(function (response) {
            return response;
        })
}

function deleteByIdUserShift(id) {
    return http.delete(`/timetracker/shifts/${id}`)
        .then(function (response) {
            return response;
        })
}
