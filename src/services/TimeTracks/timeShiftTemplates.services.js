import http from '../http'

export const timeShiftTemplatesServices = {
    createShiftTemplateName,
    updatesShiftTemplate,
    createDayInShiftTemplate,
    deleteDayShiftTemplate,
    deleteShiftTemplate
};
async function createShiftTemplateName(payload) {
    const response = await http.post(`/timetracker/templates`, payload);
    return response;
}

async function updatesShiftTemplate(payload) {
    const response = await http.put(`/timetracker/templates`, payload);
    return response;
}

async function createDayInShiftTemplate(id, payload) {
    const response = await http.post(`/timetracker/templates/${id}/day`, payload);
    return response;
}

async function deleteDayShiftTemplate(id) {
    const response = await http.delete(`/timetracker/templates/day/${id}`);
    return response;
}

async function deleteShiftTemplate(id) {
    const response = await http.delete(`/timetracker/templates/${id}`);
    return response;
}
