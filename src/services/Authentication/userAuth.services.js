import http from '../http'
import { BASE_URL_API } from '../../utils/settings'

export const userAuthService = {
    login,
    loginGoogle,
    logout,
    logoutAll,
    refreshTokenService,
    forgotPassword
};

function login(payload) {
   

    return fetch(`${BASE_URL_API}/authentications/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(async response => {
      
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
    
            return data;
        } else {
            const text = await response.text();
      
            return { status: true, message: text };
        }
    })
    .catch(function (error) {

        throw error;
    });
}

function loginGoogle(payload, clientId) {
    return fetch(`${BASE_URL_API}/authentications/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ClientId': clientId
        },
        body: JSON.stringify(payload)
    })
        .then(async response => {
            const contentType = response.headers.get("content-type");
            if (contentType === "text/plain" || contentType === null) {
                return response
            } else {
                return response.json()
            }
        })
        .then(data => {
            return data;
        });
}


function logout(payload) {
    return http.post("/authentications/logout", payload)
        .then(function (response) {
            return response;
        })
}

function logoutAll() {
    return http.post("/authentications/logout/all")
        .then(function (response) {
            return response;
        })
}

function refreshTokenService(refreshToken, userId) {

    
    const payload = {
        'token': refreshToken,
        'userId': userId,
    }
    


    return http.post("/authentications/login/refresh", payload)
        .then(function (response) {
    
            return response;
        })
        .catch(function (error) {
     
            throw error;
        })
}
function forgotPassword(email) {
    const payload = {
        'email': email,
    }
    return fetch(`${BASE_URL_API}/authentications/forgotpassword`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(async response => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            const text = await response.text();
            return { status: true, message: text };
        }
    })
    .then(function (response) {
        return response;
    })
}
