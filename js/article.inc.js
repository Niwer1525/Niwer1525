function appendImageOrVideo(project) {
    const USE_VIDEO_AS_PREV = project.video_id !== undefined;
    if(USE_VIDEO_AS_PREV)
        return `<iframe src="https://www.youtube.com/embed/${project.video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    return `<img loading="lazy" draggable="false" src="assets/${project.image}" alt="Image of ${project.name}">`
}

function formatDefaultTitle(projectName) {
    return projectName.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function formatDefaultButtonName(type) {
    switch(type.toLowerCase()) {
        case 'read': return 'Read more';
        case 'see': return 'See more';
        case 'play': return 'Play';
        default: return "Read more";
    }
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
                        <h2 data-i18n="project.title.${project.name}">${formatDefaultTitle(project.name)}</h2>
                        ${project.video_id || project.image ? appendImageOrVideo(project) : ''}
                    </header>
                    <p data-i18n="project.desc.${project.name}">Loading description . . .</p>
                    ${project.tags && Array.isArray(project.tags) ? `<p class="project-tags">${project.tags.map(tag => `#${tag}`).join(', ')}</p>` : ''}
                    <footer>
                        ${project.links && typeof project.links === 'object' ? Object.entries(project.links).map(([link, type]) => `<a href="${link}" target="_blank" data-i18n="btn.${type}">${formatDefaultButtonName(type)} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`).join('') : ''}
                    </footer>
                </article>`;
            });
        }
        GRID.innerHTML = trimAndMinifyHTML(allArticlesHTML);

        /* Re-translate injected HTML */
        await applyLanguage(GRID);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});