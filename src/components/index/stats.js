import { translate, escapeHtml, LANGUAGE_COLORS } from '../../utils.js';

function renderWakaFilters(languages) {
    return languages
        .filter(language => LANGUAGE_COLORS[language.name])
        .sort((a, b) => b.percent - a.percent)
        .map(language => `
            <button type="button" class="waka-filter-chip" data-language="${escapeHtml(language.name)}" aria-pressed="true" title="Toggle ${escapeHtml(language.name)}">
                <span class="language-dot" style="background:${escapeHtml(LANGUAGE_COLORS[language.name])}"></span>
                ${escapeHtml(language.name)}
            </button>
        `).join('');
}

function createStatCard(langDict, id, statistics) {
    const VALUE = statistics[id] ?? 0;

    return `
        <div class="badge-card github-card">
            <span id="${id}">${VALUE}</span>
            <p>${translate(langDict, `github_stats.${id}`)}</p>
        </div>
    `;
}

export async function stats(langDict, statistics) {
    const WAKA_GLOBAL_DATA = statistics.wakatime_global_stats?.data || {};
    const GITHUB_STATS = statistics.gh_stats?.data || statistics.gh_stats || {};
    const GITHUB_YEARS = Object.values(GITHUB_STATS.years || {});
    const WAKA_START_YEAR = WAKA_GLOBAL_DATA.range?.start ? new Date(WAKA_GLOBAL_DATA.range.start).getFullYear() : 2023;
    const CODING_HOURS = Math.floor(Number(WAKA_GLOBAL_DATA.total_seconds || 0) / 3600);
    const NORMALIZED_GITHUB_STATS = {
        contributions: GITHUB_YEARS.reduce((total, year) => total + (year.total_combined || 0), 0),
        total_issues: GITHUB_YEARS.reduce((total, year) => total + (year.issues || 0), 0),
        total_prs: GITHUB_YEARS.reduce((total, year) => total + (year.pull_requests || 0), 0),
        total_stars: GITHUB_STATS.all_time_stars || 0
    };
    const WAKA_LANGUAGES = statistics.wakatime_individual_stats?.data?.languages || [];
    const WAKA_DATA_JSON = JSON.stringify(WAKA_LANGUAGES).replace(/</g, '\\u003c');

    return `
        <section id="stats">
            <h2>${translate(langDict, "title.github_stats")}</h2>
            <div class="flex-center-wrap">
                <!-- Hours spent -->
                <div class="large-card-container">
                    <a class="badge-card github-card large-card" href="https://wakatime.com/Niwer" target="_blank" rel="noopener noreferrer">
                        <span id="coding_time">
                        ${CODING_HOURS}h
                        </span>
                        <p>${translate(langDict, 'github_stats.coding_time', `Coding Time Since <span id="coding_time_start_date">${WAKA_START_YEAR}</span>`)}</p>
                        <i class="top-right-external-link fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>

                <!-- Other stats -->
                ${createStatCard(langDict, 'contributions', NORMALIZED_GITHUB_STATS)}
                ${createStatCard(langDict, 'total_issues', NORMALIZED_GITHUB_STATS)}
                ${createStatCard(langDict, 'total_prs', NORMALIZED_GITHUB_STATS)}
                ${createStatCard(langDict, 'total_stars', NORMALIZED_GITHUB_STATS)}
            </div>
            <div class="chart-container">
                <div id="waka-language-filters" class="waka-language-filters">${renderWakaFilters(WAKA_LANGUAGES)}</div>
                <canvas id="waka-chart"></canvas>
                <script id="waka-data" type="application/json">${WAKA_DATA_JSON}</script>
            </div>
        </section>
    `;
}