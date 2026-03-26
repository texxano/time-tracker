import http from '../http'

export const jobsService = {
    startJobs,
    stopJobs
};

async function startJobs() {
    const response = await http.post("/jobs/start", null);
    return response;
}

async function stopJobs() {
    const response = await http.post("/jobs/stop", null);
    return response;
}
