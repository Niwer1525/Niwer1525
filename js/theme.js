/* Theme variables */
const THEME_STORAGE_KEY = 'theme-preference';
const THEME_MODES = ['system', 'dark', 'light'];
const SYSTEM_THEME_QUERY = window.matchMedia('(prefers-color-scheme: dark)');


/* On document loaded */
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();

    const THEME_TOGGLE = document.getElementById('theme-toggle');
    if (THEME_TOGGLE) THEME_TOGGLE.addEventListener('click', cycleThemeMode);
});

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
    renderWakaChart();
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

SYSTEM_THEME_QUERY.addEventListener('change', () => {
    if (getStoredThemePreference() === 'system') applyTheme('system');
});