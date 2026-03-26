import http from '../http'

export const openAiUserConfigServices = {
    openAiUserConfig
};
function openAiUserConfig(payload) {
    return http.post(`/openai/users`, payload)
        .then(function (response) {
            return response;
        })
}
