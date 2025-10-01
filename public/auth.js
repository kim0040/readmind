const API_URL = '/api'; // Caddy/프록시를 통해 백엔드로 전달되는 상대 경로

// 단순화를 위해 로컬 스토리지에 토큰을 저장한다.
// 운영 환경에서는 httpOnly 쿠키 사용을 권장한다.
const TOKEN_KEY = 'readmind_token';

/**
 * 신규 사용자를 회원가입 처리한다.
 * @param {string} email 사용자 이메일
 * @param {string} password 사용자 비밀번호
 * @param {string} captchaToken reCAPTCHA 토큰(선택)
 * @returns {Promise<any>} 서버 응답 값
 */
export async function signup(email, password, captchaToken) {
    const payload = { email, password };
    if (captchaToken) {
        payload.captchaToken = captchaToken;
    }
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.json();
}

/**
 * 사용자를 로그인 처리한다.
 * @param {string} email 사용자 이메일
 * @param {string} password 사용자 비밀번호
 * @param {string} captchaToken reCAPTCHA 토큰(선택)
 * @returns {Promise<any>} 서버 응답 값
 */
export async function login(email, password, captchaToken) {
    const payload = { email, password };
    if (captchaToken) {
        payload.captchaToken = captchaToken;
    }
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data;
}

/**
 * 저장된 토큰을 제거하여 로그아웃한다.
 */
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * 로컬 스토리지에 저장된 토큰을 반환한다.
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * 현재 사용자가 로그인된 상태인지 확인한다.
 * @returns {boolean}
 */
export function isLoggedIn() {
    const token = getToken();
    if (!token) return false;

    try {
        // 토큰 페이로드를 디코딩해 만료 여부 판단
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch (e) {
        return false;
    }
}

/**
 * 토큰에서 현재 사용자 정보를 추출한다.
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
 * 서버에서 사용자 설정을 조회한다.
 * @returns {Promise<any>}
 */
export async function getSettings() {
    const token = getToken();
    if (!token) return Promise.resolve({}); // 비로그인 상태면 빈 설정 반환

    const response = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        // 토큰이 만료된 경우 자동 로그아웃
        if (response.status === 401) logout();
        throw new Error('설정을 불러오지 못했습니다');
    }
    return response.json();
}

export async function getDocument(id) {
    const token = getToken();
    if (!token) return Promise.reject('로그인이 필요합니다');

    const response = await fetch(`${API_URL}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        if (response.status === 401) logout();
        throw new Error('문서를 불러오지 못했습니다');
    }
    return response.json();
}

export async function createDocument(title, content = '') {
    const token = getToken();
    if (!token) return Promise.reject('로그인이 필요합니다');

    const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || '문서를 생성하지 못했습니다');
    }
    return response.json();
}

export async function updateDocument(id, title, content) {
    const token = getToken();
    if (!token) return Promise.reject('로그인이 필요합니다');

    const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
        throw new Error('문서를 수정하지 못했습니다');
    }
    return response.json();
}

export async function deleteDocument(id) {
    const token = getToken();
    if (!token) return Promise.reject('로그인이 필요합니다');

    const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('문서를 삭제하지 못했습니다');
    }
    return response.json();
}

/**
 * 로그인 사용자의 문서 목록을 조회한다.
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
        throw new Error('문서 목록을 불러오지 못했습니다');
    }
    return response.json();
}

/**
 * 사용자 설정을 서버에 저장한다.
 * @param {object} settings 저장할 설정 값
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
