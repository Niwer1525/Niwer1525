function appendImageOrVideo(project) {
    let useYoutubeVideoAsPreview = project.video_id !== undefined;
    if(useYoutubeVideoAsPreview)
        return `<iframe src="https://www.youtube.com/embed/${project.video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    return `<img draggable="false" src="assets/${project.image}" alt="Image of ${project.name}">`
}

/**
 * Removes extra whitespace and newlines from the HTML string to optimize it for faster rendering.
 * @param {*} html The HTML string to be trimmed and minified.
 * @returns {string} The trimmed and minified HTML string.
 */
function trimAndMinifyHTML(html) {
    return html.trim().replace(/\s+/g, ' ');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const BASE_URL = (typeof WEBSITE_URL !== 'undefined') ? WEBSITE_URL : '';
        const RESPONSE = await fetch(`${BASE_URL}/database.json`);
        if (!RESPONSE.ok) throw new Error(`HTTP error! status: ${RESPONSE.status}`);

        const DATA = await RESPONSE.json();
        
        /* Create the grid container */
        const GRID = document.getElementById('projects-grid');
        
        // Creating a single HTML string to inject all articles at once (much faster than multiple DOM manipulations)
        let allArticlesHTML = ''; 
        if (DATA.projects && Array.isArray(DATA.projects)) {
            DATA.projects.forEach(project => {
                allArticlesHTML += `<article>
                    <header>
                        <h2 data-i18n="project.title.${project.name}">Title</h2>
                        ${project.video_id || project.image ? appendImageOrVideo(project) : ''}
                    </header>
                    <p data-i18n="project.desc.${project.name}">Description</p>
                    ${project.tags && Array.isArray(project.tags) ? `<p class="project-tags">${project.tags.map(tag => `#${tag}`).join(', ')}</p>` : ''}
                    <footer>
                        ${project.links && typeof project.links === 'object' ? Object.entries(project.links).map(([link, type]) => `<a href="${link}" target="_blank" data-i18n="btn.${type}">See more <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`).join('') : ''}
                    </footer>
                </article>`;
            });
        }
        GRID.innerHTML = trimAndMinifyHTML(allArticlesHTML);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});