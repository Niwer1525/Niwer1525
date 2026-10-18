/**
 * Core Application State
 */
const state = {
    token: '',
    userToken: localStorage.getItem('photon-user-token') || '',
    refreshToken: localStorage.getItem('photon-refresh-token') || '',
    account: JSON.parse(localStorage.getItem('photon-account')) || null,
    pending2FATicket: '',
    purchaseToken: getTokenFromURL(),
    licenseProducts: [],
    entitlements: [],
};

function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    return token || '';
}

/**
 * Sets the current session state, including account information and tokens, and stores them in localStorage.
 * 
 * @param {*} account - The account information object to store in the session.
 * @param {*} userToken - The user token string to store in the session.
 * @param {*} refreshToken - The refresh token string to store in the session.
 */
function setSession(account = null, userToken = '', refreshToken = '') {
    state.account = account;
    state.userToken = userToken;
    state.refreshToken = refreshToken;

    const setOrRemove = (key, val) => val ? localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val) : localStorage.removeItem(key);
    setOrRemove('photon-account', account);
    setOrRemove('photon-user-token', userToken);
    setOrRemove('photon-refresh-token', refreshToken);
}

/**
 * Clears the current session, removing all tokens and account information from the state and localStorage.
 */
function clearSession() {
    state.token = '';
    state.entitlements = [];
    setSession(null, '', '');
}

/**
 * Updates the visibility of authentication-related UI elements based on the current authentication state.
 * If the user is authenticated, the sign-in button is hidden and the profile and logout buttons are shown.
 * If the user is not authenticated, the sign-in button is shown and the profile and logout buttons are hidden.
 */
function updateAuthVisibility() {
    const isAuthenticated = !!state.userToken && !!state.account;
    const signInBtn = document.getElementById('nav-signin-btn');
    const profileBtn = document.getElementById('nav-profile-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');

    if (signInBtn) signInBtn.style.display = isAuthenticated ? 'none' : 'inline-block';
    if (profileBtn) profileBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
    if (logoutBtn) logoutBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
}

async function api(path, options = {}) {
    const retryable = !path.startsWith('/accounts/auth_account') && path !== '/accounts/refresh' && path !== '/accounts/logout';

    for (let attempt = 0; attempt < (retryable ? 2 : 1); attempt += 1) {
        const headers = new Headers(options.headers || {});
        if (state.token) headers.set('Authorization', `Bearer ${state.token}`);
        if (state.userToken) headers.set('X-Photon-User-Token', state.userToken);

        const method = (options.method || 'GET').toUpperCase();
        if (path.startsWith('/api/admin') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const cookie = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('photon_csrf='));
            if (cookie) headers.set('X-CSRF-Token', decodeURIComponent(cookie.split('=')[1] || ''));
        }

        const isFormData = options.body instanceof FormData;
        const isURLSearch = options.body instanceof URLSearchParams;
        if (options.body && !isFormData && !isURLSearch && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

        const res = await fetch('http://localhost:17070'+path, { credentials: 'same-origin', ...options, headers });
        const contentType = res.headers.get('content-type') || '';
        const payload = contentType.includes('json') ? await res.json() : await res.text();

        if (res.ok) return payload;
        if (attempt === 0 && retryable && (res.status === 401 || res.status === 403)
            && state.refreshToken && await refreshSession()) continue;

        const error = new Error(typeof payload === 'string' ? payload : payload?.message || res.statusText);
        error.status = res.status;
        throw error;
    }
}

async function refreshSession() {
    try {
        const res = await fetch('/accounts/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ refreshToken: state.refreshToken })
        });
        if (!res.ok) throw new Error('Refresh failed');

        const payload = await res.json();
        state.userToken = payload.token || '';
        state.refreshToken = payload.refreshToken || '';
        state.account = payload.account || null;
        localStorage.setItem('photon-refresh-token', state.refreshToken);
        if (state.userToken) localStorage.setItem('photon-user-token', state.userToken);
        else localStorage.removeItem('photon-user-token');
        if (state.account) localStorage.setItem('photon-account', JSON.stringify(state.account));
        return true;
    } catch {
        state.token = '';
        state.userToken = '';
        state.refreshToken = '';
        state.account = null;
        localStorage.removeItem('photon-account');
        localStorage.removeItem('photon-user-token');
        localStorage.removeItem('photon-refresh-token');
        window.location.hash = 'overview';
        document.getElementById('authModal')?.classList.add('open');
        return false;
    }
}