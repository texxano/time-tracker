import http from '../http'

export const commentServices = {
    postComment,
    deleteAllComment,
    deleteByIdComment
};
async function postComment(payload) {
    const response = await http.post("/comments", payload);
    return response;
}

async function deleteAllComment(projectId) {
    const response = await http.delete(`/comments?projectId=${projectId}`);
    return response;
}

async function deleteByIdComment(id) {
    const response = await http.delete(`/comments/${id}`);
    return response;
}
