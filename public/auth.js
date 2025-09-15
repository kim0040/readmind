const API_URL = '/api'; // Using a relative URL, which Caddy will proxy to the backend

// Store the token in localStorage for simplicity.
// A more secure approach for production might use httpOnly cookies.
const TOKEN_KEY = 'readmind_token';

/**
 * Signs up a new user.
 * @param {string} email
 * @param {string} password
 * @param {string} captchaToken
 * @returns {Promise<any>} The response from the server.
 */
export async function signup(email, password, captchaToken) {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken }),
    });
    return response.json();
}

/**
 * Logs in a user.
 * @param {string} email
 * @param {string} password
 * @param {string} captchaToken
 * @returns {Promise<any>} The response from the server.
 */
export async function login(email, password, captchaToken) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken }),
    });
    const data = await response.json();
    if (response.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data;
}

/**
 * Logs out the current user by removing the token.
 */
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Gets the auth token from localStorage.
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Checks if a user is currently logged in.
 * @returns {boolean}
 */
export function isLoggedIn() {
    const token = getToken();
    if (!token) return false;

    try {
        // Decode the token to check for expiry
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch (e) {
        return false;
    }
}

/**
 * Gets the current user's info from the token.
 * @returns {{id: number, email: string}|null}
 */
export function getCurrentUser() {
    const token = getToken();
    if (!token || !isLoggedIn()) {
        return null;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user;
    } catch (e) {
        return null;
    }
}

/**
 * Fetches the user's settings from the server.
 * @returns {Promise<any>}
 */
export async function getSettings() {
    const token = getToken();
    if (!token) return Promise.resolve({}); // Return empty settings if not logged in

    const response = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        // If token is invalid, log out the user
        if (response.status === 401) logout();
        throw new Error('Could not fetch settings');
    }
    return response.json();
}

export async function getDocument(id) {
    const token = getToken();
    if (!token) return Promise.reject('Not logged in');

    const response = await fetch(`${API_URL}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        if (response.status === 401) logout();
        throw new Error('Could not fetch document');
    }
    return response.json();
}

export async function createDocument(title, content = '') {
    const token = getToken();
    if (!token) return Promise.reject('Not logged in');

    const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Could not create document');
    }
    return response.json();
}

export async function updateDocument(id, title, content) {
    const token = getToken();
    if (!token) return Promise.reject('Not logged in');

    const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
        throw new Error('Could not update document');
    }
    return response.json();
}

export async function deleteDocument(id) {
    const token = getToken();
    if (!token) return Promise.reject('Not logged in');

    const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Could not delete document');
    }
    return response.json();
}

/**
 * Fetches the list of documents for the logged-in user.
 * @returns {Promise<any>}
 */
export async function getDocuments() {
    const token = getToken();
    if (!token) return Promise.resolve([]);

    const response = await fetch(`${API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        if (response.status === 401) logout();
        throw new Error('Could not fetch documents');
    }
    return response.json();
}

/**
 * Saves the user's settings to the server.
 * @param {object} settings
 * @returns {Promise<any>}
 */
export async function saveSettings(settings) {
    const token = getToken();
    if (!token) return Promise.resolve(); // Do nothing if not logged in

    const response = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Token expired, try to refresh
            try {
                await refreshToken();
                // Retry with new token
                const newToken = getToken();
                const retryResponse = await fetch(`${API_URL}/settings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${newToken}`,
                    },
                    body: JSON.stringify({ settings }),
                });
                if (!retryResponse.ok) throw new Error('Could not save settings after token refresh');
                return await retryResponse.json();
            } catch (refreshError) {
                // Refresh failed, redirect to login
                logout();
                throw new Error('Session expired. Please login again.');
            }
        }
        throw new Error('Could not save settings');
    }
    return response.json();
}

export async function refreshToken() {
    const token = getToken();
    if (!token) throw new Error('No token available');

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.token;
}
