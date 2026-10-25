import { loadState, saveState, clearState } from './utils/storage.js';
import { apiRequest } from './utils/api.js';

/**
 * Core Application State
 */
const defaultPanelState = {
    token: '',
    userToken: '',
    refreshToken: '',
    account: null,
    pending2FATicket: '',
    purchaseToken: getTokenFromURL(),
    licenseProducts: [],
    entitlements: [],
};

/**
 * A Proxy object that wraps the panel state, allowing for automatic saving to localStorage whenever a property is set.
 * This ensures that the application state persists across page reloads and sessions.
 */
export const panelState = new Proxy(loadState(defaultPanelState), {
    set(target, prop, value) {
        target[prop] = value;
        saveState(target);
        return true;
    }
});

function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    return token || '';
}

/**
 * Sets the current session state, including account information and tokens, and stores them in localStorage.
 * 
 * @param {*} account - The account information object to store in the session.
 * @param {*} token - The authentication token string to store in the session.
 * @param {*} refreshToken - The refresh token string to store in the session.
 */
export function setSession(account = null, token = '', refreshToken = '') {
    panelState.account = account;
    panelState.token = token; // Sets Authorization: Bearer
    panelState.userToken = token; // Sets X-Photon-User-Token (if used interchangeably)
    panelState.refreshToken = refreshToken;
}
/**
 * Clears session and removes saved state
 */
export function clearSession() {
    panelState.token = '';
    panelState.userToken = '';
    panelState.refreshToken = '';
    panelState.account = null;
    panelState.entitlements = [];
    panelState.licenseProducts = [];
    panelState.pending2FATicket = '';
    clearState();
}

/**
 * Updates the visibility of UI elements based on the user's authentication status and entitlements.
 * This function checks if the user is authenticated and has the necessary entitlements to access certain features.
 * It toggles the visibility of elements with specific classes based on these conditions.
 * 
 * Elements with the following classes are affected:
 * - .auth-required: Visible only to authenticated users.
 * - .buyer-required: Visible only to users with subscriptions or entitlements.
 * - .admin-required: Visible only to admin users.
 */
export function updateAuthenticatedVisibility() {
    const isAuthenticated = !!panelState.account;
    const signInBtn = document.getElementById('nav-signin-btn');
    const profileBtn = document.getElementById('nav-profile-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');

    /* Sign-in/Out buttons */
    if (signInBtn) signInBtn.style.display = isAuthenticated ? 'none' : 'inline-block';
    if (profileBtn) profileBtn.style.display = isAuthenticated ? 'inline-block' : 'none';
    if (logoutBtn) logoutBtn.style.display = isAuthenticated ? 'inline-block' : 'none';

    /* 2FA */
    const has2FA = Boolean(panelState.account?.totpEnabled);
    const logicnCode = document.getElementById('totp-login-code');
    if(logicnCode) {
        logicnCode.classList.toggle('hidden', !has2FA);
        logicnCode.querySelectorAll('input').forEach((input) => input.disabled = !has2FA);
    }

    /* Access control */
    const isAdmin = !!panelState.token || panelState.account?.administrator;
    const isUser = !!panelState.userToken || !!panelState.account;
    const isBuyer = isUser && panelState.entitlements.length > 0;
    document.querySelectorAll('.auth-required').forEach((el) => el.classList.toggle('hidden', !isUser));
    document.querySelectorAll('.buyer-required').forEach((el) => el.classList.toggle('hidden', !isBuyer && !isAdmin)); // Buyers and Admins can access buyer-required features
    document.querySelectorAll('.admin-required').forEach((el) => el.classList.toggle('hidden', !isAdmin));
}

export async function api(path, options = {}) {
    const retryable = !path.startsWith('/accounts/auth_account') && path !== '/accounts/refresh' && path !== '/accounts/logout';

    for (let attempt = 0; attempt < (retryable ? 2 : 1); attempt += 1) {
        const headers = new Headers(options.headers || {});
        if (panelState.token) headers.set('Authorization', `Bearer ${panelState.token}`);
        if (panelState.userToken) headers.set('X-Photon-User-Token', panelState.userToken);

        const method = (options.method || 'GET').toUpperCase();
        if (path.startsWith('/admin') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const cookie = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('photon_csrf='));
            if (cookie) headers.set('X-CSRF-Token', decodeURIComponent(cookie.split('=')[1] || ''));
        }

        const isFormData = options.body instanceof FormData;
        const isURLSearch = options.body instanceof URLSearchParams;
        if (options.body && !isFormData && !isURLSearch && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

        try {
            return await apiRequest(path, { ...options, headers });
        } catch (error) {
            if (attempt === 0 && retryable && (error.status === 401 || error.status === 403)
            && panelState.refreshToken && await refreshSession()) continue;

            console.error('API request failed:', error, { path, options, status: error.status });
            throw error;
        }
    }
}

export async function refreshSession() {
    if (!panelState.refreshToken) return false;

    try {
        const payload = await apiRequest('/accounts/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: panelState.refreshToken })
        });
        const newToken = payload.token || '';
        
        // Update both token formats
        panelState.token = newToken;
        panelState.userToken = newToken;
        if (payload.refreshToken) panelState.refreshToken = payload.refreshToken;
        if (payload.account) panelState.account = payload.account;
        
        return true;
    } catch (err) {
        console.error('Session refresh failed:', err);
        clearSession();
        updateAuthenticatedVisibility();
        return false;
    }
}