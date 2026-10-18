function clearPurchaseToken() {
    if (state.purchaseToken) {
        state.purchaseToken = '';
        window.history.replaceState({}, '', window.location.pathname);
    }
}

async function syncPurchaseSession(body) {
    if (!state.purchaseToken) return;
    body.set('token', state.purchaseToken);
    await api('/stripe/purchase_session', {
        method: 'POST',
        body: new URLSearchParams({ checkoutSessionId: state.purchaseToken })
    }).catch(() => {});
}

async function restoreSession() {
    if (state.purchaseToken && (state.userToken || state.refreshToken || state.account || state.token)) {
        return logout();
    }
    if (state.account) {
        try {
            state.account = await api('/accounts/me');
            localStorage.setItem('photon-account', JSON.stringify(state.account));
            await loadEntitlements();
        } catch {
            clearSession();
            document.getElementById('authModal')?.classList.add('open');
        }
    }
}

function login(e) {
    return handleFormSubmit(e, async (form, formData) => {
        console.log('Submitting login with body:', body.toString());
        const body = new URLSearchParams(formData);
        await syncPurchaseSession(body);

        const payload = await api('/accounts/auth_account', { method: 'POST', body });
        if (payload.status === '2FA_REQUIRED' && payload.ticket) {
            state.pending2FATicket = payload.ticket;
            document.querySelectorAll('.modal-panel').forEach((p) => p.classList.remove('active'));
            document.getElementById('totpLoginForm')?.classList.add('active');
            document.getElementById('authTabs')?.classList.add('hidden');
            const input = document.getElementById('totpLoginInput');
            if (input) {
                input.value = '';
                setTimeout(() => input.focus(), 150);
            }
            return;
        }
        await handleLoginSuccessPayload(payload);
    });
}

function submit2FALogin(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const payload = await api('/accounts/auth_account/2fa', {
            method: 'POST',
            body: JSON.stringify({ ticket: state.pending2FATicket, code: formData.get('code') })
        });
        state.pending2FATicket = '';
        document.getElementById('authTabs')?.classList.remove('hidden');
        await handleLoginSuccessPayload(payload);
    });
}

function register(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const body = new URLSearchParams(formData);
        await syncPurchaseSession(body);

        const res = await api('/accounts/create_account', { method: 'POST', body });
        setSession(res.account || res, res.token || '', res.refreshToken || '');
        await loadEntitlements();

        clearPurchaseToken();
        createNotification('Account created', 'success');
        closeModals();
        updateAuthVisibility();
    });
}

async function handleLoginSuccessPayload(payload) {
    setSession(payload.account || payload, payload.isAdmin ? '' : (payload.token || ''), payload.refreshToken || '');
    if (!payload.isAdmin) await loadEntitlements();

    createNotification(payload.isAdmin ? 'Signed in as admin' : 'Signed in', 'success');
    clearPurchaseToken();
    closeModals();
    updateAuthVisibility();
}

async function logout() {
    await api('/accounts/logout', { method: 'POST' }).catch(() => {});
    clearSession();
    updateAuthVisibility();
    createNotification('Logged out');
}

function updateProfile(e) {
    return handleFormSubmit(e, async (form, fromData) => {
        const payload = {
            uuid: state.account?.uuid,
            currentPassword: fromData.get('currentPassword'),
            username: fromData.get('username'),
            email: fromData.get('email'),
            ...(fromData.get('newPassword') && { newPassword: fromData.get('newPassword'), confirmPassword: fromData.get('newPassword') }),
            ...(fromData.get('code') && { code: fromData.get('code').trim() })
        };

        const acc = await api('/accounts/update_profile', { method: 'POST', body: JSON.stringify(payload) });
        setSession(acc, state.userToken, state.refreshToken);
        e.target.reset();
        updateAuthVisibility();
        closeModals();
        createNotification('Profile updated', 'success');
    });
}

async function open2FASetup() {
    if (state.account?.totpEnabled) {
        if (!confirm('Two-factor authentication is already active. Do you want to disable it?')) return;
        const code = prompt('Enter a 6-digit code from your authenticator app to disable 2FA:');
        if (!code) return;

        try {
            await api('/accounts/2fa/disable', { method: 'POST', body: JSON.stringify({ code: code.trim() }) });
            createNotification('2FA has been disabled', 'success');
            state.account = await api('/accounts/me');
            localStorage.setItem('photon-account', JSON.stringify(state.account));
            updateAuthVisibility();
        } catch (err) {
            createNotification(err.message, 'error');
        }
        return;
    }

    openModal('totpSetupModal');
    const container = document.getElementById('totpQrContainer');
    const manualKey = document.getElementById('totpManualKey');
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

function confirm2FASetup(e) {
    return handleFormSubmit(e, async (form, formData) => {
        await api('/accounts/2fa/confirm', { method: 'POST', body: JSON.stringify({ code: formData.get('code') }) });
        createNotification('Two-factor authentication enabled!', 'success');
        closeModals();
        e.target.reset();

        state.account = await api('/accounts/me');
        localStorage.setItem('photon-account', JSON.stringify(state.account));
        updateAuthVisibility();
    });
}

async function loadEntitlements() {
    try {
        const entitlements = await api('/accounts/entitlements');
        state.entitlements = Array.isArray(entitlements) ? entitlements : [];
    } catch {
        state.entitlements = [];
    }
}

function requestAccountDeletion(e) {
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
        e.target.reset();
        clearSession();
        updateAuthVisibility();
        navigate('overview');
        createNotification('Account scheduled for deletion. You have been logged out.', 'success');
    });
}