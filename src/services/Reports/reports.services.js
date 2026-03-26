import http from '../http'

export const reportsServices = {
    reportTimeTrackPersonal,
    reportTimeTrackRoot,
    reportTimeTrackUserRoot,
    reportProjectStatus,
    deleteByIdReport,
    downloadReport,
};

async function reportTimeTrackPersonal(payload) {
    const response = await http.post("/timetracker/reports/me", payload);
    return response;
}

async function reportTimeTrackRoot(payload) {
    const response = await http.post("/timetracker/reports/root", payload);
    return response;
}

async function reportTimeTrackUserRoot(payload) {
    const response = await http.post("/timetracker/reports/user", payload);
    return response;
}

async function reportProjectStatus(payload) {
    const response = await http.post("/reports/project/status", payload);
    return response;
}

async function deleteByIdReport(id) {
    const response = await http.delete(`/reports/${id}`);
    return response;
}

async function downloadReport(id) {
    const response = await http.get(`/reports/${id}/download`);
    return response;
}
