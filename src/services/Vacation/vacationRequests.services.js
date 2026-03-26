import http from '../http'

export const vacationRequestsServices = {
    requestsVacationDays,
    requestsVacationHours,
    requestsVacationSick,
    approveRequestVacation,
    denyRequestVacation,
    cancelRequestVacation,
    checkAvailability,
    closeSickLeave

};

async function closeSickLeave(dataBody) {
    return http.put(`/vacations/requests/sick/close`, dataBody)
        .then(function (response) {
            return response;
        })
}

async function checkAvailability(payload) {
    const response = await http.post(`/vacations/requests/check-availability`, payload);
    return response;
}

async function requestsVacationDays(payload) {
    try {
        const response = await http.post(`/vacations/requests/days`, payload);
        return response;
    } catch (error) {
        console.log("error requestsVacationDays", error);
        return error;
    }
}


async function requestsVacationHours(payload) {
    try {
        const response = await http.post(`/vacations/requests/hours`, payload);
        return response;
    } catch (error) {
        console.log("error requestsVacationHours", error);
        return error;
    }
}

async function requestsVacationSick(payload) {
    const response = await http.post(`/vacations/requests/sick`, payload);
    return response;
}

async function approveRequestVacation(payload) {
    const response = await http.post(`/vacations/requests/approve`, payload);
    return response;
}

async function denyRequestVacation(payload) {
    const response = await http.post(`/vacations/requests/deny`, payload);
    return response;
}

async function cancelRequestVacation(id) {
    const response = await http.delete(`/vacations/requests/personal/${id}`);
    return response;
}
