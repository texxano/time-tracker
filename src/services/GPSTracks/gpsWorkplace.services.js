import http from '../http'

export const gpsWorkplaceServices = {
    createGpsWorkplace,
    updateGpsWorkplace,
    deleteGpsWorkplace,
    getEmployeeWorkplaces,
    getAllWorkplaces
};

function createGpsWorkplace(dataBody) {
    return http.post(`/gps/locations`, dataBody)
        .then(function (response) {
            return response;
        })
}

function updateGpsWorkplace(dataBody) {
    return http.put(`/gps/locations`, dataBody)
        .then(function (response) {
            return response;
        })
}


function deleteGpsWorkplace(id) {
    return http.delete(`/gps/locations/${id}`)
        .then(function (response) {
            return response;
        })
}

/**
 * Get all workplaces/locations assigned to current employee
 * Returns array of locations where employee can register
 */
function getEmployeeWorkplaces() {
    return http.get(`/gps/locations/employee`)
        .then(function (response) {
            return response;
        })
}

/**
 * Get all workplaces/locations (admin)
 */
function getAllWorkplaces() {
    return http.get(`/gps/locations`)
        .then(function (response) {
            return response;
        })
}
