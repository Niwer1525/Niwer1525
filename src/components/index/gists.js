import { translate, escapeHtml, LANGUAGE_COLORS } from '../../utils.js';

function renderLanguageSummary(files) {
    const languageCounts = files.reduce((counts, file) => {
        const language = file.language?.trim() || 'Other';
        counts[language] = (counts[language] || 0) + 1;
        return counts;
    }, {});
    const languages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);
    const totalFiles = files.length || 1;

    const progressBar = languages.map(([language, count]) => `
        <div class="gist-language-segment" style="width: ${(count / totalFiles * 100).toFixed(1)}%; background-color: ${LANGUAGE_COLORS[language] || '#cccccc'};" title="${escapeHtml(language)}: ${count} ${count === 1 ? 'file' : 'files'}"></div>
    `).join('');
    const legend = languages.map(([language]) => `
        <span class="gist-language-item">
            <span class="language-dot" style="background-color: ${LANGUAGE_COLORS[language] || '#cccccc'};"></span>
            ${escapeHtml(language)}
        </span>
    `).join('');

    return {
        progressBar: `<div class="gist-language-bar">${progressBar}</div>`,
        legend: `<div class="gist-language-legend">${legend}</div>`
    };
}

function renderGist(gist) {
    const files = Object.values(gist.files || {});
    const description = gist.description || 'Untitled Gist';
    const date = new Date(gist.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const fileCount = files.length;
    const { progressBar, legend } = renderLanguageSummary(files);

    return `
        <article class="gist-card">
            <header><p>${escapeHtml(description)}</p></header>
            ${progressBar}
            ${legend}
            <div class="gist-info">
                <span class="gist-file-count"><i class="fa-solid fa-file"></i> ${fileCount} ${fileCount === 1 ? 'file' : 'files'}</span>
                <span class="gist-date"><i class="fa-solid fa-calendar"></i> ${date}</span>
            </div>
            <footer>
                <a href="${escapeHtml(gist.htmlUrl)}" target="_blank" rel="noopener noreferrer">View Gist <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </footer>
        </article>
    `;
}

export function gists(langDict, statistics) {
  const GISTS = statistics?.gh_gists || [];

  return `
        <section id="gists">
            <h2>Gists</h2>
            <div id="gists-grid" class="articles-grid">${GISTS.map(renderGist).join('')}</div>
            <a class="button" href="https://gist.niwer.dev" target="_blank" rel="noopener noreferrer">${translate(langDict, 'explore.gists')}</a>
        </section>    
    `;
}