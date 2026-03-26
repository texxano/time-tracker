import http from '../http'

export const calendarRoomServices = {
    createCalendarRoom,
    updateCalendarRoom,
    deleteByIdCalendarRoom,
};

async function createCalendarRoom(payload) {
    const response = await http.post("/calendarm/rooms", payload);
    return response;
}

async function updateCalendarRoom(payload) {
    const response = await http.put("/calendarm/rooms", payload);
    return response;
}

async function deleteByIdCalendarRoom(id) {
    const response = await http.delete(`/calendarm/rooms/${id}`);
    return response;
}
