import http from '../http'

export const calendarService = {
    createCalendarEvent,
    updateCalendarEvent,
    deleteByIdCalendarEvent,
    acceptCalendarEvent,
    declineCalendarEvent
};

async function createCalendarEvent(payload) {
    const response = await http.post("/calendarm/events", payload);
    return response;
}

async function updateCalendarEvent(payload) {
    const response = await http.put("/calendarm/events", payload);
    return response;
}

async function deleteByIdCalendarEvent(id) {
    const response = await http.delete(`/calendarm/events/${id}`);
    return response;
}

async function acceptCalendarEvent(id) {
    const response = await http.post(`/calendarm/events/${id}/accept`, null);
    return response;
}

async function declineCalendarEvent(id) {
    const response = await http.post(`/calendarm/events/${id}/decline`, null);
    return response;
}
