import http from '../http'

export const timeTracksServices = {
    startTimeTrack,
    stopTimeTrack,
    createManualTimeTrack,
    updateTimeTrack,
    startTimeTrackForProject,
    deleteAllTimeTrack,
    deleteByIdTimeTrack,
    cloneTimeTrack,
    getTracksByUserId
};
async function startTimeTrack(companyLocationId) {
    // Start with query params (backend expects query params, not JSON body)
    const params = new URLSearchParams();
    params.append('startedFromMobileApp', 'true');
    if (companyLocationId) {
        params.append('companyLocationId', companyLocationId);
    }
             const payload = {
        projectId: null,
        description: null,

      };
    const response = await http.post(`/timetracker/tracks/start?${params.toString()}`, payload);
    return response;
}

async function stopTimeTrack(companyLocationId = null) {
    // Stop with query params (backend expects query params, not JSON body)
    const params = new URLSearchParams();
    params.append('startedFromMobileApp', 'false');
    if (companyLocationId) {
        params.append('companyLocationId', companyLocationId);
    }
             const payload = {
        projectId: null,
        description: null,

      };
    const response = await http.post(`/timetracker/tracks/stop?${params.toString()}`, payload);
    return response;
}

async function createManualTimeTrack(payload) {
    const response = await http.post("/timetracker/tracks", payload)
    return response;
}

async function updateTimeTrack(payload) {
    const response = await http.put("/timetracker/tracks", payload)
    return response;
}

async function startTimeTrackForProject(payload) {
    // Start with query params (backend expects query params, not JSON body)
    const params = new URLSearchParams();
    params.append('startedFromMobileApp', 'true');
    if (payload?.companyLocationId) {
        params.append('companyLocationId', payload.companyLocationId);
    }
    const response = await http.post(`/timetracker/tracks/start?${params.toString()}`, payload);
    return response;
}

async function deleteAllTimeTrack() {
    const response = await http.delete(`/timetracker/tracks`);
    return response;
}

async function deleteByIdTimeTrack(id) {
    const response = await http.delete(`/timetracker/tracks/${id}`);
    return response;
}

async function cloneTimeTrack(payload) {
    const response = await http.post("/timetracker/tracks/clone", payload)
    return response;
}

async function getTracksByUserId(userId, from, to) {
    const params = new URLSearchParams();
    if (from) params.append('From', from);
    if (to) params.append('To', to);
    const query = params.toString();
    const response = await http.get(`/timetracker/tracks/user/${userId}${query ? `?${query}` : ''}`);
    return response;
}
