import { GITHUB_USERNAME, escapeHtml, onDomReady, trimAndMinifyHTML } from './main.js';
import { DEFAULT_LANGUAGE_COLOR, LANGUAGE_COLORS } from './stats.js'

function getLanguageCounts(files) {
    return files.reduce((counts, file) => {
        const language = file.language?.trim() || 'Other';
        counts[language] = (counts[language] || 0) + 1;
        return counts;
    }, {});
}

function renderLanguageSummary(files) {
    const languageCounts = getLanguageCounts(files);
    const sortedLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);

    const progressBar = sortedLanguages.map(([language, count]) => {
        const color = LANGUAGE_COLORS[language] || DEFAULT_LANGUAGE_COLOR;
        const percentage = ((count / files.length) * 100).toFixed(1);
        const fileLabel = count === 1 ? 'file' : 'files';
        return `<div class="gist-language-segment" style="width: ${percentage}%; background-color: ${color};" title="${escapeHtml(language)}: ${count} ${fileLabel}"></div>`;
    }).join('');

    const legend = sortedLanguages.map(([language]) => {
        const color = LANGUAGE_COLORS[language] || DEFAULT_LANGUAGE_COLOR;
        return `<span class="gist-language-item"><span class="language-dot" style="background-color: ${color};"></span>${escapeHtml(language)}</span>`;
    }).join('');

    return {
        progressBar: `<div class="gist-language-bar">${progressBar}</div>`,
        legend: `<div class="gist-language-legend">${legend}</div>`
    };
}

function renderGist(gist) {
    const files = Object.values(gist.files || {});
    const description = gist.description || files[0]?.filename || 'Untitled Gist';
    const date = new Date(gist.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const fileCount = files.length;
    const fileLabel = fileCount === 1 ? 'file' : 'files';
    const { progressBar, legend } = renderLanguageSummary(files);

    return `<article class="gist-card">
        <header><p>${escapeHtml(description)}</p></header>
        ${progressBar}
        ${legend}
        <div class="gist-info">
            <span class="gist-file-count"><i class="fa-solid fa-file"></i> ${fileCount} ${fileLabel}</span>
            <span class="gist-date"><i class="fa-solid fa-calendar"></i> ${date}</span>
        </div>
        <footer>
            <a href="${escapeHtml(gist.html_url)}" target="_blank" rel="noopener noreferrer">View Gist <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
        </footer>
    </article>`;
}

function renderGists(gists, grid, limitInput) {
    const limit = Number.parseInt(limitInput.value, 10) || 10;
    grid.innerHTML = trimAndMinifyHTML(gists.slice(0, limit).map(renderGist).join(''));
}

onDomReady(async () => {
    const grid = document.getElementById('gists-grid');
    const limitInput = document.getElementById('gists-limit');
    if (!grid || !limitInput) return;

    try {
        const GITHUB_GISTS_API = `https://api.github.com/users/${GITHUB_USERNAME}/gists`;
        const RESPONSE = await fetch(GITHUB_GISTS_API);
        if (!RESPONSE.ok) throw new Error(`HTTP error! status: ${RESPONSE.status}`);

        const gists = await RESPONSE.json();
        renderGists(gists, grid, limitInput);
        
        limitInput.addEventListener('change', () => renderGists(gists, grid, limitInput));
        limitInput.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            let currentValue = Number.parseInt(limitInput.value, 10) || 10;
            if (event.deltaY < 0) currentValue = Math.min(currentValue + 1, Number.parseInt(limitInput.max, 10));
            else currentValue = Math.max(currentValue - 1, Number.parseInt(limitInput.min, 10));

            limitInput.value = currentValue;
            renderGists(gists, grid, limitInput);
        });
    } catch (error) {
        console.error('Error fetching gists:', error);
    }
});
