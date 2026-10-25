import { CONFIRMATION_PHRASE, getPagePath, handleFormSubmit, onDomReady } from '../main.js';
import { panelState, updateAuthenticatedVisibility } from '../panel.js';
import { loadAdminPanel, createBlogPost, editBlogPost } from '../panel/admin.js';
import { confirm2FASetup, login, register, requestAccountDeletion, restoreSession, submit2FALogin, updateProfile } from '../panel/auth.js';
import { createLicense, loadLicenses } from '../panel/licenses.js';
import { loadDownloads, loadPublicServers } from '../panel/public.js';
import { loadProfileDetails } from '../panel/user_profile.js';
import { hidePopup } from './modals.js';
import { STATE_STORAGE_KEY } from './storage.js';
import { createNotification } from './toast.js';

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

document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'contact-popup-form') {
        handleFormSubmit(e, async (form, formData) => {
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json' 
                },
                body: json
            });

            const data = await response.json();

            if (response.ok) {
                createNotification('Message sent successfully!');
                hidePopup('contact-popup');
                form.reset();
            } else throw new Error(data.message || 'An error occurred while sending the message.');
        });
    }
    else if (e.target && e.target.id === 'auth-popup-register-form') register(e);
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
    console.log(`%c Niwer's Portfolio - Made with ❤️`, 'background: #000000; color: #d8b4fe; padding: 4px 8px; border-radius: 4px; font-size: 14px;');
    
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

    /* Handle magnet back-to-top button */
    const container = document.querySelector('.back-to-top-container');
    const magnetLink = container ? container.querySelector('.back-to-top') : null;
    if (!container || !magnetLink) return;

    const MAGNET_RADIUS = 90; // radius of attraction in pixels
    const MAGNET_STRENGTH = 0.25; // Strength of the movement (0.1 = light, 0.4 = reactive)

    /* Handle scroll events to show/hide the back-to-top button */
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY || window.pageYOffset
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        
        if (scrollY + windowHeight >= documentHeight - 100) container.classList.remove('hidden');
        else container.classList.add('hidden');
    });

    /* Handle mouse movement for the magnet effect */
    window.addEventListener('mousemove', (e) => {
        const rect = magnetLink.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < MAGNET_RADIUS) {
            container.classList.add('is-attracted');

            const moveX = deltaX * MAGNET_STRENGTH;
            const moveY = deltaY * MAGNET_STRENGTH;
            magnetLink.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        } else {
            container.classList.remove('is-attracted');
            magnetLink.style.transform = 'translate3d(0, 0, 0)';
        }
    });

    /* Handle mouse leaving the window */
    window.addEventListener('mouseleave', () => {
        container.classList.remove('is-attracted');
        magnetLink.style.transform = 'translate3d(0, 0, 0)';
    });
});