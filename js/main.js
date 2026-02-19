/* Environement variables */
const IS_DEV_ENV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const WEBSITE_URL = IS_DEV_ENV ? './' : 'https://niwer1525.github.io/Niwer1525/';

/* Theme variables */
const THEME_STORAGE_KEY = 'theme-preference';
const THEME_MODES = ['system', 'dark', 'light'];
const SYSTEM_THEME_QUERY = window.matchMedia('(prefers-color-scheme: dark)');

function getStoredThemePreference() {
    const VALUE = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    return THEME_MODES.includes(VALUE) ? VALUE : 'system';
}

function getResolvedTheme(mode) {
    if (mode === 'system') return SYSTEM_THEME_QUERY.matches ? 'dark' : 'light';
    return mode;
}

function applyTheme(mode = getStoredThemePreference()) {
    const RESOLVED = getResolvedTheme(mode);
    document.documentElement.setAttribute('data-theme', RESOLVED);
    updateThemeToggleUI(mode, RESOLVED);
}

function updateThemeToggleUI(mode, resolved) {
    const LABEL = document.getElementById('theme-toggle-label');
    const ICON = document.querySelector('#theme-toggle i');
    if (!LABEL || !ICON) return;

    LABEL.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);

    ICON.className = 'fa-solid';
    if (mode === 'system') ICON.classList.add('fa-circle-half-stroke');
    else if (resolved === 'dark') ICON.classList.add('fa-moon');
    else ICON.classList.add('fa-sun');
}

function cycleThemeMode() {
    const CURRENT = getStoredThemePreference();
    const CURRENT_INDEX = THEME_MODES.indexOf(CURRENT);
    const NEXT = THEME_MODES[(CURRENT_INDEX + 1) % THEME_MODES.length];
    localStorage.setItem(THEME_STORAGE_KEY, NEXT);
    applyTheme(NEXT);
    createNotification(`Theme: ${NEXT}`);
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();

    const THEME_TOGGLE = document.getElementById('theme-toggle');
    if (THEME_TOGGLE) THEME_TOGGLE.addEventListener('click', cycleThemeMode);
});

SYSTEM_THEME_QUERY.addEventListener('change', () => {
    if (getStoredThemePreference() === 'system') applyTheme('system');
});

function copyDiscordId() {
    navigator.clipboard.writeText('niwerbis').then(() => createNotification('Discord ID copied to clipboard!'));
}

/**
 * Creates a temporary notification at the bottom of the screen.
 * @param {string} message - The message to display in the notification.
 */
function createNotification(message) {
    let notifications = document.querySelectorAll('.notification');
    let offset = 20 + notifications.length * 60; // 20px base, 60px per notification
    let msg = document.createElement('div');
    msg.textContent = message;
    msg.className = 'notification';
    msg.style.top = 'auto';
    msg.style.bottom = `${offset}px`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

/* Prevent CTRL+S (Saving) & CTRL+P (Printing) */
window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') e.preventDefault();
    if (e.ctrlKey && e.key === 'p') e.preventDefault();
});

const popup = () => document.getElementById("contact-popup");

function showContactPopup() { popup().style.display = "flex"; }

function hideContactPopup() { popup().style.display = "none"; }

function isContactPopupVisible() { return popup().style.display === "flex"; }

document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'contact-form') {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: json
        })
        .then(async response => {
            let json = await response.json();
            if (response.status == 200) createNotification('Message sent successfully!');
            else createNotification(json.message || 'An error occurred while sending the message.');
        })
        .catch(error => createNotification('An error occurred while sending the message.'))
        .then(() => form.reset());
    }
});