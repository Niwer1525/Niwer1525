document.addEventListener('DOMContentLoaded', async () => {
    try {
        const GITHUB_GISTS_API = `https://api.github.com/users/${GITHUB_USERNAME}/gists`;
        const RESPONSE = await fetch(GITHUB_GISTS_API);
        if (!RESPONSE.ok) throw new Error(`HTTP error! status: ${RESPONSE.status}`);

        let GISTS = await RESPONSE.json();
        const GISTS_LIMIT_INPUT = document.getElementById('gists-limit');
        
        const renderGists = (gists) => {
            const GRID = document.getElementById('gists-grid');
            const LIMIT = parseInt(GISTS_LIMIT_INPUT.value) || 10;
            const LIMITED_GISTS = gists.slice(0, LIMIT);
            
            // Creating a single HTML string to inject all gists at once (much faster than multiple DOM manipulations)
            let gistsHTML = ''; 
            if (LIMITED_GISTS && Array.isArray(LIMITED_GISTS)) {
                LIMITED_GISTS.forEach(gist => {
                    const FILES = Object.values(gist.files);
                    const DESCRIPTION = gist.description || (FILES.length > 0 && FILES[0].filename) || 'Untitled Gist';
                    const FILE_COUNT = FILES.length;
                    const CREATED_DATE = new Date(gist.created_at);
                    const DATE_STR = CREATED_DATE.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    
                    // Count files by language
                    const LANGUAGE_COUNT = {};
                    FILES.forEach(file => {
                        const LANG = (file.language && file.language.trim()) || 'Other';
                        LANGUAGE_COUNT[LANG] = (LANGUAGE_COUNT[LANG] || 0) + 1;
                    });
                    
                    // Build progress bar segments
                    const SORTED_LANGUAGES = Object.entries(LANGUAGE_COUNT)
                        .sort((a, b) => b[1] - a[1]); // Sort by count descending
                    
                    let progressBarHTML = '<div class="gist-language-bar">';
                    SORTED_LANGUAGES.forEach(([lang, count]) => {
                        const COLOR = LANGUAGE_COLORS[lang] || DEFAULT_LANGUAGE_COLOR;
                        const PERCENTAGE = ((count / FILE_COUNT) * 100).toFixed(1);
                        progressBarHTML += `<div class="gist-language-segment" style="width: ${PERCENTAGE}%; background-color: ${COLOR};" title="${escapeHtml(lang)}: ${count} ${count === 1 ? 'file' : 'files'}"></div>`;
                    });
                    progressBarHTML += '</div>';
                    
                    // Build language legend
                    let languageLegendHTML = '<div class="gist-language-legend">';
                    SORTED_LANGUAGES.forEach(([lang, count]) => {
                        const COLOR = LANGUAGE_COLORS[lang] || DEFAULT_LANGUAGE_COLOR;
                        languageLegendHTML += `<span class="gist-language-item"><span class="gist-language-dot" style="background-color: ${COLOR};"></span>${escapeHtml(lang)}</span>`;
                    });
                    languageLegendHTML += '</div>';
                    
                    gistsHTML += `<article class="gist-card">
                        <header>
                            <p>${escapeHtml(DESCRIPTION)}</p>
                        </header>
                        ${progressBarHTML}
                        ${languageLegendHTML}
                        <div class="gist-info">
                            <span class="gist-file-count"><i class="fa-solid fa-file"></i> ${FILE_COUNT} ${FILE_COUNT === 1 ? 'file' : 'files'}</span>
                            <span class="gist-date"><i class="fa-solid fa-calendar"></i> ${DATE_STR}</span>
                        </div>
                        <footer>
                            <a href="${escapeHtml(gist.html_url)}" target="_blank" rel="noopener noreferrer">View Gist <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                        </footer>
                    </article>`;
                });
            }
            GRID.innerHTML = trimAndMinifyHTML(gistsHTML);
        };
        renderGists(GISTS); // Render gists on load
        
        GISTS_LIMIT_INPUT.addEventListener('change', () => renderGists(GISTS)); // Re-render when limit input changes
        GISTS_LIMIT_INPUT.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            let currentValue = parseInt(GISTS_LIMIT_INPUT.value) || 10;
            if (event.deltaY < 0) currentValue = Math.min(currentValue + 1, parseInt(GISTS_LIMIT_INPUT.max));
            else currentValue = Math.max(currentValue - 1, parseInt(GISTS_LIMIT_INPUT.min));

            GISTS_LIMIT_INPUT.value = currentValue;
            renderGists(GISTS);
        }); // When scrolling the input, increment/decrement the value and re-render
    } catch (error) {
        console.error('Error fetching gists:', error);
    }
});
