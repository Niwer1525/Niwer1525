/* 
    Get data from Github Actions generated JSON files and display them in the stats section.
    E.G : https://raw.githubusercontent.com/Niwer1525/Niwer1525/main/github_full_stats.json
*/

/* WakaTime chart variables */
const DEFAULT_LANGUAGE_COLOR = '#cccccc';
const LANGUAGES_COLORS = {
    'JSON': '#292929',
    'Shell': '#89e051',
    'Markdown': '#083fa1',
    'SQL': '#e38c00',
    
    'Groovy': '#e69f56',
    'Java': '#b07219',
    'GLSL': '#5686a5',

    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'JavaScript': '#f1e05a',
    'PHP': '#4F5D95',
    
    'Python': '#3572A5',
    'Rust': '#dea584'
};

const WAKA_FILTERS_STORAGE_KEY = 'waka-visible-languages';
let wakaChartInstance = null;
let wakaLanguagesCache = [];

/* On document loaded */
document.addEventListener('DOMContentLoaded', () => {
    /* Get wakatime time */
    getWakatimeData().then(data => {
        getElementByIdAndSetContent('coding-time', `${data.totalHours}h`);
        getElementByIdAndSetContent('coding-time-start-date', `${data.startYear}`);
    });

    /* Get github stats */
    getGitHubStats().then(stats => {
        getElementByIdAndSetContent('total-commits', stats.commits);
        getElementByIdAndSetContent('contributions', stats.contributions);
        // getElementByIdAndSetContent('streak', 0);
        getElementByIdAndSetContent('total-issues', stats.issues);
        getElementByIdAndSetContent('total-prs', stats.prs);
        getElementByIdAndSetContent('total-stars', stats.stars);
    });

    /* Render wakatime languages chart */
    renderWakaChart();
});

/**
 * Get GitHub statistics for the specified user.
 * We are using github actions to generate a JSON file with the stats, which we can then fetch here.
 * @returns {Promise<Object>} The GitHub statistics for the user.
 */
async function getGitHubStats() {
    try {
        const RESPONSE = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/main/github_full_stats.json`);
        const RESULT = await RESPONSE.json();
        const YEARS = Object.values(RESULT.years); // Years have key as year and value as an object with contributions, commits, prs, issues

        const allTimeContributions = YEARS.reduce((total, yearData) => total + (yearData.total_combined || 0), 0);
        const lifetimeCommits = YEARS.reduce((total, yearData) => total + (yearData.commits || 0), 0);
        const lifetimePRs = YEARS.reduce((total, yearData) => total + (yearData.pull_requests || 0), 0);
        const lifetimeIssues = YEARS.reduce((total, yearData) => total + (yearData.issues || 0), 0);
        const TOTAL_STARS = RESULT.all_time_stars || 0;

        return {
            contributions: allTimeContributions,
            commits: lifetimeCommits,
            prs: lifetimePRs,
            issues: lifetimeIssues,
            stars: TOTAL_STARS
        };
    } catch (error) {
        console.error("Could not load stats:", error);
        return null;
    }
}

async function getWakatimeData() {
    try {
        const RESPONSE = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/main/wakatime.json`);
        if (!RESPONSE.ok) throw new Error('Could not fetch WakaTime data');
        
        const DATA = await RESPONSE.json();
        const TOTAL_SECONDS = DATA.data.total_seconds;
        const TOTAL_HOURS = Math.floor(TOTAL_SECONDS / 3600);

        return { totalHours: TOTAL_HOURS, startYear: new Date(DATA.data.range.start).getFullYear() };
    } catch (error) { console.error('Error loading WakaTime data:', error); }
}

async function renderWakaChart() {
    try {
        const RESPONSE = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/main/wakatime-chart.json`);
        if (!RESPONSE.ok) throw new Error('Could not fetch WakaTime chart data');

        const RESULT = await RESPONSE.json();
        wakaLanguagesCache = RESULT.data.languages || [];

        ensureWakaLanguageFiltersUI(wakaLanguagesCache);
        renderFilteredWakaChart();
    } catch (error) { console.error("Error loading WakaTime chart data:", error); }
}

function getStoredVisibleLanguages(allLanguages = wakaLanguagesCache) {
    try {
        const stored = JSON.parse(localStorage.getItem(WAKA_FILTERS_STORAGE_KEY) || 'null');
        if (Array.isArray(stored)) return new Set(stored);
    } catch (_) {}
    return new Set((allLanguages || []).map(language => language.name));
}

function setStoredVisibleLanguages(visibleLanguagesSet) {
    localStorage.setItem(WAKA_FILTERS_STORAGE_KEY, JSON.stringify(Array.from(visibleLanguagesSet)));
}

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
        if(!LANGUAGES_COLORS[language.name]) return ''; // Skip languages that don't have a defined color to avoid confusion with the "Other" category

        const IS_SELECTED = VISIBLE_LANGUAGES.has(language.name);
        const COLOR = LANGUAGES_COLORS[language.name] || DEFAULT_LANGUAGE_COLOR;

        /* Generate the language button */
        let html = `
            <button type="button" class="waka-filter-chip ${IS_SELECTED ? '' : 'is-unselected'}" data-language="${escapeHtml(language.name)}" aria-pressed="${IS_SELECTED ? 'true' : 'false'}" title="Toggle ${escapeHtml(language.name)}">
                <span class="waka-filter-dot" style="background:${escapeHtml(COLOR)}"></span>
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

function getFilteredWakaLanguages() {
    const SELECTED_LANGUAGES = getStoredVisibleLanguages(wakaLanguagesCache);
    const VISIBLE_LANGUAGES = wakaLanguagesCache.filter(language => SELECTED_LANGUAGES.has(language.name) && LANGUAGES_COLORS[language.name]); // Only include languages that are selected and have a defined color
    const OTHER_PERCENT = VISIBLE_LANGUAGES.filter(language => language.percent < 1).reduce((accumulator, current) => accumulator + current.percent, 0);

    /* Compute all "other" languages */
    if (OTHER_PERCENT > 0) VISIBLE_LANGUAGES.push({ name: 'Not shown', percent: OTHER_PERCENT });

    return VISIBLE_LANGUAGES;
}

function renderFilteredWakaChart() {
    const CANVAS = document.getElementById('waka-chart');
    if (!CANVAS) return;

    const CONTEXT = CANVAS.getContext('2d');
    if (!CONTEXT) return;

    const LANGUAGES = getFilteredWakaLanguages();
    const TEXT_PRIMARY = getCSSVar('--text-primary');
    const TEXT_SECONDARY = getCSSVar('--text-secondary');
    const BORDER_COLOR = getCSSVar('--border-color');

    if (wakaChartInstance) wakaChartInstance.destroy(); // Destroy previous chart instance before creating a new one to avoid memory leaks and ensure proper re-rendering
    wakaChartInstance = new Chart(CONTEXT, {
        type: 'doughnut',
        data: {
            labels: LANGUAGES.map(language => language.name),
            datasets: [{
                data: LANGUAGES.map(language => language.percent),
                backgroundColor: LANGUAGES.map(language => LANGUAGES_COLORS[language.name] || DEFAULT_LANGUAGE_COLOR),
                hoursData: LANGUAGES.map(language => language.text || ''),
                borderColor: BORDER_COLOR,
                borderWidth: 1,
                cutout : 200,
                radius: '90%',
                hoverOffset: 60
            }]
        },
        options: {
            animation: { duration: 250 },
            plugins: {
                legend: { display: false }, // We have our own legend in the filters, so we hide the default one
                tooltip: {
                    backgroundColor: getCSSVar('--surface-color'),
                    titleColor: TEXT_PRIMARY,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyColor: TEXT_SECONDARY,
                    borderColor: BORDER_COLOR,
                    borderWidth: 1,
                    callbacks: {
                        label: (item) => { 
                            const HOURS = item.dataset.hoursData?.[item.dataIndex] ?? 0;
                            return `${item.label}: ${HOURS} (${item.raw.toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });
}