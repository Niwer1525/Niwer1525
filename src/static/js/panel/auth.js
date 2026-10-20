import { handleFormSubmit } from '../main.js';
import { api, clearSession, panelState, setSession, updateAuthenticatedVisibility } from '../panel.js';
import { closeModals, showPopup, showPopupAndSwitchTab } from '../utils/modals.js';
import { createNotification } from '../utils/toast.js';

function clearPurchaseToken() {
    if (panelState.purchaseToken) {
        panelState.purchaseToken = '';
        window.history.replaceState({}, '', window.location.pathname);
    }
}

async function syncPurchaseSession(body) {
    if (!panelState.purchaseToken) return;
    body.set('token', panelState.purchaseToken);
    await api('/stripe/purchase_session', {
        method: 'POST',
        body: new URLSearchParams({ checkoutSessionId: panelState.purchaseToken })
    }).catch(() => {});
}

export async function restoreSession() {
    if (panelState.purchaseToken && (panelState.userToken || panelState.refreshToken || panelState.account || panelState.token)) {
        return logout(true);
    }
    
    if (panelState.account) {
        try {
            const res = await api('/accounts/me');
            panelState.account = res?.account || res?.user || res;
            await loadEntitlements();
        } catch (err) {
            console.warn('Could not restore session from /accounts/me:', err);
            if (err.status === 401 || err.status === 403) {
                clearSession();
                showPopupAndSwitchTab('auth-modal', 'login');
            }
        }
    }
    updateAuthenticatedVisibility();
}

export function login(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const body = new URLSearchParams(formData);
        await syncPurchaseSession(body);
        
        const payload = await api('/accounts/auth_account', { method: 'POST', body });
        if (payload.status === '2FA_REQUIRED' && payload.ticket) {
            console.log('Login payload:', payload);
            panelState.pending2FATicket = payload.ticket;
            document.getElementById('auth-popup-login-form')?.classList.add('hidden');
            document.getElementById('totp-login-form')?.classList.remove('hidden');
            document.querySelectorAll('.modal-tabs')?.forEach((t) => t.classList.add('hidden'));
            return;
        }
        await handleLoginSuccessPayload(payload);
    });
}

export function submit2FALogin(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const payload = await api('/accounts/auth_account/2fa', {
            method: 'POST',
            body: JSON.stringify({ ticket: panelState.pending2FATicket, code: formData.get('code') })
        });
        panelState.pending2FATicket = '';
        document.getElementById('authTabs')?.classList.remove('hidden');
        await handleLoginSuccessPayload(payload);
    });
}

export function register(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const body = new URLSearchParams(formData);
        await syncPurchaseSession(body);

        const res = await api('/accounts/create_account', { method: 'POST', body });
        setSession(res.account || res, res.token || '', res.refreshToken || '');
        await loadEntitlements();

        clearPurchaseToken();
        createNotification('Account created', 'success');
        closeModals();
        updateAuthenticatedVisibility();
    });
}

async function handleLoginSuccessPayload(payload) {
    const token = payload.isAdmin ? '' : (payload.token || '');
    setSession(payload.account || payload, token, payload.refreshToken || '');
    await loadEntitlements();

    createNotification(payload.isAdmin ? 'Signed in as admin' : 'Signed in', 'success');
    clearPurchaseToken();
    closeModals();
    updateAuthenticatedVisibility();
}

async function logout(skipConfirmation = false) {
    if (!skipConfirmation && !confirm('Are you sure you want to log out?')) return;
    await api('/accounts/logout', { method: 'POST' }).catch(() => {});
    clearSession();
    updateAuthenticatedVisibility();
    createNotification('Logged out');
    setTimeout(() => window.location.href = '/panel', 500);
}
window.logout = logout;

export function updateProfile(e) {
    return handleFormSubmit(e, async (form, fromData) => {
        const payload = {
            uuid: panelState.account?.uuid,
            currentPassword: fromData.get('currentPassword'),
            username: fromData.get('username'),
            email: fromData.get('email'),
            ...(fromData.get('newPassword') && { newPassword: fromData.get('newPassword'), confirmPassword: fromData.get('newPassword') }),
            ...(fromData.get('code') && { code: fromData.get('code').trim() })
        };

        const acc = await api('/accounts/update_profile', { method: 'POST', body: JSON.stringify(payload) });
        setSession(acc, panelState.userToken, panelState.refreshToken);
        form.reset();
        updateAuthenticatedVisibility();
        closeModals();
        createNotification('Profile updated', 'success');
    });
}

async function open2FASetup() {
    /* Disable 2FA if it's already enabled */
    if (panelState.account?.totpEnabled) {
        if (!confirm('Two-factor authentication is already active. Do you want to disable it?')) return;
        const code = prompt('Enter a 6-digit code from your authenticator app to disable 2FA:');
        if (!code) return;

        try {
            await api('/accounts/2fa/disable', { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
            createNotification('2FA has been disabled', 'success');
            panelState.account = await api('/accounts/me');
            localStorage.setItem('photon-account', JSON.stringify(panelState.account));
            updateAuthenticatedVisibility();
        } catch (err) {
            createNotification(err.message, 'error');
        }
        return;
    }

    /* Setup 2FA */
    showPopup('totp-setup-popup');
    const container = document.getElementById('totp-qr-container');
    const manualKey = document.getElementById('totp-manual-key');
    if (container) container.innerHTML = '<i class="fa-solid fa-spinner fa-spin fa-2x text-secondary"></i>';
    if (manualKey) manualKey.value = '';

    try {
        const data = await api('/accounts/2fa/setup');
        if (container) container.innerHTML = `<img src="${data.qrCode}" alt="2FA QR Code" style="width: 180px; height: 180px; border-radius: 12px; background: white; padding: 8px;">`;
        if (manualKey) manualKey.value = data.manualKey;
    } catch (err) {
        if (container) container.innerHTML = `<p class="text-danger text-sm">Failed to load QR code</p>`;
        createNotification(err.message, 'error');
    }
}
window.open2FASetup = open2FASetup;

export function confirm2FASetup(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const data = await api('/accounts/2fa/confirm', { method: 'POST', body: JSON.stringify({ code: formData.get('code') }) });
        console.log('2FA setup confirmed:', data);

        createNotification('Two-factor authentication enabled!', 'success');
        closeModals();
        form.reset();

        panelState.account = await api('/accounts/me');
        localStorage.setItem('photon-account', JSON.stringify(panelState.account));
        updateAuthenticatedVisibility();

        showPopup('recovery-codes-popup');
        const x = document.getElementById('recovery-codes-textarea')
        if(x) x.value = (data.recovery_codes || []).join('\n');
    });
}

async function loadEntitlements() {
    try {
        const entitlements = await api('/accounts/entitlements');
        panelState.entitlements = Array.isArray(entitlements) ? entitlements : [];
    } catch {
        panelState.entitlements = [];
    }
}

export function requestAccountDeletion(e) {
    return handleFormSubmit(e, async (form, formData) => {
        await api('/accounts/delete_account', {
            method: 'DELETE',
            body: JSON.stringify({
                password: formData.get('password'),
                confirmationPhrase: formData.get('confirmationPhrase'),
                code: formData.get('code')?.trim() || null
            })
        });

        closeModals();
        logout(true);
        form.reset();
        clearSession();
        updateAuthenticatedVisibility();
        createNotification('Account scheduled for deletion. You have been logged out.', 'success');
    });
}