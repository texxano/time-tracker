import http from '../http'


async function createInvoice(payload) {
    const response = await http.post(`/moneytracker/invoices`, payload);
    return response;
}



async function updateInvoice(payload) {
    const response = await http.put(`/moneytracker/invoices`, payload);
    return response;
}

async function deleteInvoice(id) {
    const response = await http.delete(`/moneytracker/invoices/${id}`);
    return response;
}

async function createPayment(payload) {
    const response = await http.post(`/moneytracker/payments`, payload);
    return response;
}

async function deletePayment(id) {
    const response = await http.delete(`/moneytracker/payments/${id}`);
    return response;
}





export const moneyTrackerServices = {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    createPayment,
    deletePayment,
};
