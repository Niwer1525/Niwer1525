import { getValueWithFallback } from '../utils.js';

function createStatCard(langDict, id, label) {
  return `
    <div class="github-card">
        <span id="${id}">0</span>
        <p>${getValueWithFallback(langDict, `github_stats.${id}`, label)}</p>
    </div>
  `;
}

export function stats(langDict) {
  return `
    <section id="stats">
        <h2>${getValueWithFallback(langDict, "title.github_stats", "Statistics")}</h2>
        <div class="github-stats-grid">
            <!-- Hours spent -->
            <div class="large-card-container">
                <a class="github-card large-card" href="https://wakatime.com/Niwer" target="_blank" rel="noopener noreferrer">
                    <span id="coding_time">0h</span>
                    <p>${getValueWithFallback(langDict, 'github_stats.coding_time', 'Coding Time <span id="coding_time_start_date">Since 2023</span>s')}</p>
                    <i class="top-right-external-link fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </div>

            <!-- Other stats -->
            ${createStatCard(langDict, 'contributions', 'Contributions')}
            ${createStatCard(langDict, 'total_issues', 'Total Issues')}
            ${createStatCard(langDict, 'total_prs', 'Total PRs')}
            ${createStatCard(langDict, 'total_stars', 'Total Stars')}
        </div>
        <div class="chart-container">
            <div id="waka-language-filters" class="waka-language-filters"></div>
            <canvas id="waka-chart"></canvas>
        </div>
    </section>
    `;
}