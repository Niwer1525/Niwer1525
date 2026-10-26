import Chart from 'chart.js/auto';
import { escapeHtml, trimAndMinifyHTML, getCSSVar, onDomReady } from './main.js';

/* WakaTime chart variables */
export const DEFAULT_LANGUAGE_COLOR = '#cccccc';
export const LANGUAGE_COLORS = {
    'JSON': '#292929',
    'Shell': '#89e051',
    'Markdown': '#083fa1',
    'SQL': '#e38c00',
    
    'Groovy': '#e69f56',
    'Java': '#b07219',
    'C#': '#178600',
    'GLSL': '#5686a5',

    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'JavaScript': '#f1e05a',
    'TypeScript': '#2076bb',
    'PHP': '#4F5D95',
    
    'Python': '#3572A5',
    'Rust': '#dea584'
};

const WAKA_FILTERS_STORAGE_KEY = 'waka-visible-languages';
let wakaLanguagesCache = [];
let wakaChartInstance = null;

/* On document loaded */
onDomReady(() => {
    if (!document.getElementById('stats')) return;
    renderWakaChart();
});

document.addEventListener('themechange', () => {
    renderWakaChart();
});

/**
 * Reads build-embedded WakaTime data and refreshes the Chart.js doughnut when the theme or language selection changes.
 * 
 * @author Niwer
 */
export async function renderWakaChart() {
    const DATA = document.getElementById('waka-data');
    if (!DATA) return;
    try {
        wakaLanguagesCache = JSON.parse(DATA.textContent);
        ensureWakaLanguageFiltersUI(wakaLanguagesCache);
        renderFilteredWakaChart();
    } catch (error) { console.error('Error loading embedded WakaTime data:', error); }
}

/**
 * Retrieves the set of visible programming languages from localStorage.
 * 
 * @param {*} allLanguages - The list of all available programming languages.
 * @returns {Set<string>} The set of visible programming languages.
 * @author Niwer
 */
function getStoredVisibleLanguages(allLanguages = wakaLanguagesCache) {
    try {
        const stored = JSON.parse(localStorage.getItem(WAKA_FILTERS_STORAGE_KEY) || 'null');
        if (Array.isArray(stored)) return new Set(stored);
    } catch (_) {}
    return new Set((allLanguages || []).map(language => language.name));
}

/**
 * Stores the set of visible programming languages in localStorage.
 * 
 * @param {*} visibleLanguagesSet  - The set of visible programming languages to be stored in localStorage.
 * @author Niwer
 */
function setStoredVisibleLanguages(visibleLanguagesSet) {
    localStorage.setItem(WAKA_FILTERS_STORAGE_KEY, JSON.stringify(Array.from(visibleLanguagesSet)));
}

/**
 * Ensures that the UI for WakaTime language filters is properly set up and reflects the current state of visible languages.
 * This function generates filter buttons for each programming language based on the provided list of languages, and attaches click event listeners to toggle the visibility of each language in the chart.
 * The state of visible languages is stored in localStorage to persist user preferences across sessions.
 * 
 * @author Niwer
 */
function ensureWakaLanguageFiltersUI(languages) {
    const CHART = document.getElementById('waka-chart');
    if (!CHART) return;

    const CONTAINER = CHART.closest('.chart-container');
    if (!CONTAINER) return;

    const FILTERS = document.getElementById('waka-language-filters');
    if (!FILTERS) return;

    const VISIBLE_LANGUAGES = getStoredVisibleLanguages(languages);
    const STORED_LANGUAGES = [...languages].sort((a, b) => b.percent - a.percent);

    FILTERS.innerHTML = STORED_LANGUAGES.map(language => {
        if(!LANGUAGE_COLORS[language.name]) return ''; // Skip languages that don't have a defined color to avoid confusion with the "Other" category

        const IS_SELECTED = VISIBLE_LANGUAGES.has(language.name);
        const COLOR = LANGUAGE_COLORS[language.name] || DEFAULT_LANGUAGE_COLOR;

        /* Generate the language button */
        let html = `
            <button type="button" class="waka-filter-chip ${IS_SELECTED ? '' : 'is-unselected'}" data-language="${escapeHtml(language.name)}" aria-pressed="${IS_SELECTED ? 'true' : 'false'}" title="Toggle ${escapeHtml(language.name)}">
                <span class="language-dot" style="background:${escapeHtml(COLOR)}"></span>
                ${escapeHtml(language.name)}
            </button>
        `;
        return trimAndMinifyHTML(html);
    }).join('');
    
    FILTERS.onclick = (event) => {
        const BUTTON = event.target.closest('.waka-filter-chip');
        if (!BUTTON) return;

        const LANGUAGE = BUTTON.dataset.language;
        const UPDATE_VISIBLE_LANGUAGES = getStoredVisibleLanguages(wakaLanguagesCache);

        if (UPDATE_VISIBLE_LANGUAGES.has(LANGUAGE)) UPDATE_VISIBLE_LANGUAGES.delete(LANGUAGE);
        else UPDATE_VISIBLE_LANGUAGES.add(LANGUAGE);

        setStoredVisibleLanguages(UPDATE_VISIBLE_LANGUAGES);
        ensureWakaLanguageFiltersUI(wakaLanguagesCache); // Re-render filters to update their state
        renderFilteredWakaChart(); // Re-render chart with new filters
    };
}

/**
 * Retrieves the list of programming languages to be displayed in the WakaTime chart based on the user's filter selections, and calculates the percentage of time spent on "Other" languages that do not have a defined color.
 * 
 * @returns {Array<{ name: string, percent: number }>} The list of programming languages to be displayed in the chart, including an "Other" category if applicable.
 * @author Niwer
 */
function getFilteredWakaLanguages() {
    const SELECTED_LANGUAGES = getStoredVisibleLanguages(wakaLanguagesCache);
    const VISIBLE_LANGUAGES = wakaLanguagesCache.filter(language => SELECTED_LANGUAGES.has(language.name) && LANGUAGE_COLORS[language.name]); // Only include languages that are selected and have a defined color

    /* Compute all "other" languages */
    const OTHER_PERCENT = wakaLanguagesCache.filter(language => !LANGUAGE_COLORS[language.name] && SELECTED_LANGUAGES.has(language.name)).reduce((accumulator, current) => accumulator + current.percent, 0);
    if (OTHER_PERCENT > 0) VISIBLE_LANGUAGES.push({ name: 'Not shown / Other', percent: OTHER_PERCENT });

    return VISIBLE_LANGUAGES;
}

/**
 * Renders the WakaTime chart based on the currently selected programming languages and their usage percentages.
 * The chart is displayed as a Chart.js doughnut with custom colors for each language.
 * 
 * @author Niwer
 */
function renderFilteredWakaChart() {
    const LANGUAGES = getFilteredWakaLanguages();
    const CANVAS = document.getElementById('waka-chart');
    if (!CANVAS) return;
    const CONTEXT = CANVAS.getContext('2d');
    if (!CONTEXT) return;

    if (wakaChartInstance) wakaChartInstance.destroy();
    wakaChartInstance = new Chart(CONTEXT, {
        type: 'doughnut',
        data: {
            labels: LANGUAGES.map(language => language.name),
            datasets: [{
                data: LANGUAGES.map(language => language.percent),
                backgroundColor: LANGUAGES.map(language => LANGUAGE_COLORS[language.name] || DEFAULT_LANGUAGE_COLOR),
                hoursData: LANGUAGES.map(language => language.digital || ''),
                borderWidth: 0,
                cutout: '70%',
                radius: '90%',
                hoverOffset: (context) => {
                    const CHART_WIDTH = context?.chart?.width || 0;
                    return Math.max(10, Math.min(36, Math.round(CHART_WIDTH * 0.06)));
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 250 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: getCSSVar('--surface-color'),
                    titleColor: getCSSVar('--text-primary'),
                    bodyColor: getCSSVar('--text-secondary'),
                    callbacks: {
                        label: item => `${item.label}: ${item.dataset.hoursData[item.dataIndex]} (${item.raw.toFixed(1)}%)`
                    }
                }
            }
        }
    });
}