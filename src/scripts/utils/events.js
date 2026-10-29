import { CONFIRMATION_PHRASE, getPagePath, onDomReady } from '../main.js';
import { panelState, updateAuthenticatedVisibility } from '../panel.js';
import { addPostSource, createBlogPost, editBlogPost, loadAdminPanel, removePostSource } from '../panel/admin.js';
import { confirm2FASetup, login, register, requestAccountDeletion, restoreSession, submit2FALogin, updateProfile } from '../panel/auth.js';
import { createLicense, loadLicenses } from '../panel/licenses.js';
import { loadDownloads, loadPublicServers } from '../panel/public.js';
import { loadProfileDetails } from '../panel/user_profile.js';
import { STATE_STORAGE_KEY } from './storage.js';

/* Handle storage events */
window.addEventListener('storage', (event) => {
    if (event.key === STATE_STORAGE_KEY && event.newValue) {
        try {
            const updated = JSON.parse(event.newValue);
            Object.assign(panelState, updated);
            updateAuthenticatedVisibility();
        } catch {
            // ignore malformed storage payloads
        }
    }
});

/* Prevent CTRL+S (Saving) & CTRL+P (Printing) */
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'p')) e.preventDefault();
});

document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'delete-phrase-input') {
        const deleteBtn = document.getElementById('btn-submit-delete');
        if (deleteBtn) deleteBtn.disabled = e.target.value !== CONFIRMATION_PHRASE;
    }
    /* Handle TOTP code input (Removing spaces & non-numeric characters) */
    if(e.target && e.target.classList.contains('totp-code')) e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
});

document.addEventListener('click', function(e) {
    const addSourceButton = e.target.closest('[data-sources-container]');
    if (addSourceButton) addPostSource(addSourceButton.dataset.sourcesContainer);
    else if (e.target.closest('.remove-post-source')) removePostSource(e.target.closest('.remove-post-source'));
});

document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'auth-popup-register-form') register(e);
    else if (e.target && e.target.id === 'auth-popup-login-form') login(e);
    else if (e.target && e.target.id === 'totp-login-form') submit2FALogin(e);
    else if (e.target && e.target.id === 'totp-setup-popup-form') confirm2FASetup(e);
    else if (e.target && e.target.id === 'edit-profile-popup-form') updateProfile(e);
    else if (e.target && e.target.id === 'delete-account-popup-form') requestAccountDeletion(e);
    else if (e.target && e.target.id === 'create-license-popup-form') createLicense(e);
    else if (e.target && e.target.id === 'create-post-popup-form') createBlogPost(e);
    else if (e.target && e.target.id === 'edit-post-popup-form') editBlogPost(e);
});

/* On document loaded */
onDomReady(async () => {    
    /* Handle specific loading action depending on the current path */
    const currentPath = getPagePath();
    console.debug(`Current path: ${currentPath}`);

    /* If we're on the panel page or a sub page of it */
    if(currentPath.startsWith('/panel')) {
        await restoreSession(); // Validate and restore session tokens
        switch (currentPath) {
            case '/panel':
                if (panelState.purchaseToken && !panelState.account)
                    document.getElementById('purchase-alert')?.classList.remove('hidden'); // Purchase token detected. The user is not logged in. Show the purchase alert
                
                await loadPublicServers();
                break;
            case '/panel/downloads':
                await loadDownloads();
                break;
            case '/panel/licenses':
                await loadLicenses();
                break;
            case '/panel/admin':
                await loadAdminPanel();
                break;
            case '/panel/profile':
                await loadProfileDetails();
                break;
            default: break;
        }
    }
});