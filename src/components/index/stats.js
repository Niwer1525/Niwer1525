import { translate } from '../../utils.js';

function createStatCard(langDict, id) {
  return `
    <div class="badge-card github-card">
        <span id="${id}">0</span>
        <p>${translate(langDict, `github_stats.${id}`)}</p>
    </div>
  `;
}

export function stats(langDict) {
  return `
    <section id="stats">
        <h2>${translate(langDict, "title.github_stats")}</h2>
        <div class="flex-center-wrap">
            <!-- Hours spent -->
            <div class="large-card-container">
                <a class="badge-card github-card large-card" href="https://wakatime.com/Niwer" target="_blank" rel="noopener noreferrer">
                    <span id="coding_time">0h</span>
                    <p>${translate(langDict, 'github_stats.coding_time', 'Coding Time <span id="coding_time_start_date">Since 2023</span>s')}</p>
                    <i class="top-right-external-link fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </div>

            <!-- Other stats -->
            ${createStatCard(langDict, 'contributions')}
            ${createStatCard(langDict, 'total_issues')}
            ${createStatCard(langDict, 'total_prs')}
            ${createStatCard(langDict, 'total_stars')}
        </div>
        <div class="chart-container">
            <div id="waka-language-filters" class="waka-language-filters"></div>
            <canvas id="waka-chart"></canvas>
        </div>
    </section>
    `;
}