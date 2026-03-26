import http from '../http'



async function createDocumentTaskBook(payload) {
    const response = await http.post(`/doctask/books`, payload);
    return response;
}

async function createDocumentTaskInvoiceBook(payload) {
    const response = await http.post(`/doctask/books/invoices`, payload);
    return response;
}

//add new invoice to book
async function createDocumentTaskBookInvoice(payload) {
    const response = await http.post(`/doctask/books/invoices/entries`, payload);
    return response;
}

async function updateDocumentTaskBookInvoice(payload) {
    const response = await http.put(`/doctask/books/invoices/entries`, payload);
    return response;
}


async function deleteDocumentTaskBookInvoice(id) {
    const response = await http.delete(`/doctask/books/invoices/entries${id}`);
    return response;
}


export const documentTaskBooksServices = {
    createDocumentTaskBook,
    createDocumentTaskBookInvoice,
    updateDocumentTaskBookInvoice,
    deleteDocumentTaskBookInvoice,
    createDocumentTaskInvoiceBook
};



