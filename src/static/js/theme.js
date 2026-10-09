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

/**
 * Retrieves the stored theme preference from localStorage.
 * 
 * @returns {string} The stored theme mode ('system', 'dark', or 'light').
 * @author Niwer
 */
function getStoredThemePreference() {
    const VALUE = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    return THEME_MODES.includes(VALUE) ? VALUE : 'system';
}

/**
 * Resolves the theme mode based on the system preference.
 * 
 * @param {*} mode The theme mode to resolve ('system', 'dark', or 'light').
 * @returns {string} The resolved theme ('dark' or 'light').
 * @author Niwer
 */
function getResolvedTheme(mode) {
    if (mode === 'system') return SYSTEM_THEME_QUERY.matches ? 'dark' : 'light';
    return mode;
}

/**
 * Applies the specified theme to the document.
 * 
 * @param {*} mode The theme mode to apply ('system', 'dark', or 'light').
 * @author Niwer
 */
function applyTheme(mode = getStoredThemePreference()) {
    const RESOLVED = getResolvedTheme(mode);
    document.documentElement.setAttribute('data-theme', RESOLVED);
    updateThemeToggleUI(mode, RESOLVED);
    renderWakaChart();
}

/**
 * Updates the UI for the theme toggle based on the current theme mode and resolved theme.
 * 
 * @param {*} mode The current theme mode ('system', 'dark', or 'light').
 * @param {*} resolved The resolved theme based on system preference ('dark' or 'light').
 * @author Niwer
 */
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

/**
 * Cycles through the theme modes and applies the next mode.
 * 
 * @author Niwer
 */
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