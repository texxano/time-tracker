import { BASE_URL_API } from "../utils/settings";
import { store } from "../redux/store/store";
import { refreshTokenAction } from "../redux/actions/Authentication/userAuth.actions";

// Configuration constants
const TOKEN_REFRESH_TIMEOUT = 15000; // 15 seconds
const MAX_RETRY_ATTEMPTS = 1;

/**
 * Get the current authentication token from Redux store
 * @returns {string} Current JWT token
 */
export function token() {
  const state = store.getState();
  return state.userToken.token;
}

/**
 * Check if response indicates token authentication issues
 * @param {Response} response - Fetch response object
 * @returns {boolean} True if token error
 */
const isTokenError = (response) => {
  return response.status === 401 || response.status === 403;
};

/**
 * Parse response based on content type
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} Parsed response data
 */
const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType === "text/plain" || contentType === null) {
    return response;
  }
  return await response.json();
};

/**
 * Create error message from response
 * @param {Response} response - Fetch response object
 * @returns {Promise<string>} Error message
 */
const createErrorMessage = async (response) => {
  const errorText = await response.text();
  return `HTTP ${response.status}: ${errorText || response.statusText}`;
};

// Global state for token refresh
let isRefreshing = false;
let refreshPromise = null;

/**
 * Handle token refresh with concurrency protection
 * @returns {Promise<string>} New token
 */
const handleTokenRefresh = async () => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    console.log("🔄 Token refresh already in progress, waiting...");
    return refreshPromise;
  }

  const state = store.getState();
  const refreshToken = state.userToken.refreshToken;
  const userId = state.userDataRole.userId;

  console.log("🔄 Starting token refresh...", { 
    hasRefreshToken: !!refreshToken, 
    hasUserId: !!userId 
  });

  if (!refreshToken || !userId) {
    console.log("❌ Missing refresh token or user ID");
    throw new Error("No refresh token available");
  }

  isRefreshing = true;

  try {
    refreshPromise = new Promise((resolve, reject) => {
      const unsubscribe = store.subscribe(() => {
        const currentState = store.getState();
        const currentToken = currentState.userToken.token;
        const currentRefreshToken = currentState.userToken.refreshToken;

        // Check if the token has been updated
        if (currentToken !== state.userToken.token || currentRefreshToken !== refreshToken) {
          unsubscribe();
          isRefreshing = false;
          refreshPromise = null;
          resolve(currentState.userToken.token);
        }
      });

      // Dispatch the refresh action
      store.dispatch(refreshTokenAction(refreshToken, userId));

      // Set timeout for refresh operation
      setTimeout(() => {
        unsubscribe();
        isRefreshing = false;
        refreshPromise = null;
        reject(new Error("Token refresh timeout"));
      }, TOKEN_REFRESH_TIMEOUT);
    });

    return await refreshPromise;
  } catch (error) {
    isRefreshing = false;
    refreshPromise = null;
    throw error;
  }
};

/**
 * Make HTTP request with automatic token refresh
 * @param {string} path - API endpoint path
 * @param {Object} options - Fetch options
 * @param {number} retryCount - Number of retries attempted
 * @returns {Promise<Response>} Fetch response
 */
const makeRequest = async (path, options = {}, retryCount = 0) => {
  const currentToken = token();
  if (!currentToken) {
    throw new Error("No token available");
  }

  const response = await fetch(`${BASE_URL_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
      ...options.headers,
    },
  });

  // Handle token errors with retry
  if (isTokenError(response) && retryCount < MAX_RETRY_ATTEMPTS) {
    console.log("🔄 Token error detected, attempting refresh...");
    try {
      const newToken = await handleTokenRefresh();
      if (newToken) {
        console.log("✅ Token refreshed successfully, retrying request...");
        // Retry with new token
        return makeRequest(path, options, retryCount + 1);
      }
    } catch (refreshError) {
      console.log("❌ Token refresh failed:", refreshError.message);
      throw new Error("Authentication failed - token refresh error");
    }
  }

  // Handle other HTTP errors
  if (!response.ok) {
    const errorMessage = await createErrorMessage(response);
    throw new Error(errorMessage);
  }

  return response;
};

/**
 * Make HTTP GET request
 * @param {string} path - API endpoint path
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 */
async function get(path, options = {}) {
  const response = await makeRequest(path, { method: "GET", ...options });
  return parseResponse(response);
}

/**
 * Make HTTP POST request
 * @param {string} path - API endpoint path
 * @param {any} payload - Request payload
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 */
async function post(path, payload, options = {}) {
  const response = await makeRequest(path, {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
  return parseResponse(response);
}

/**
 * Make HTTP PUT request
 * @param {string} path - API endpoint path
 * @param {any} payload - Request payload
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 */
async function put(path, payload, options = {}) {
  const response = await makeRequest(path, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...options,
  });
  return parseResponse(response);
}

/**
 * Make HTTP DELETE request
 * @param {string} path - API endpoint path
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response data
 */
async function del(path, options = {}) {
  const response = await makeRequest(path, { method: "DELETE", ...options });
  return parseResponse(response);
}

/**
 * Download file from API
 * @param {string} path - API endpoint path
 * @param {string} filename - Filename for download
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response for file download
 */
async function download(path, filename, options = {}) {
  const response = await makeRequest(path, {
    method: "GET",
    ...options,
  });
  return response;
}

/**
 * HTTP service object with all methods
 */
const http = {
  get,
  post,
  put,
  delete: del,
  download,
};

export default http;