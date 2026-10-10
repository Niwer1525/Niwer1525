import { loadMd, loadJson, getValueWithFallback, formatDefaultTitle } from '../utils.js';

/**
 * Appends an image or video element based on the project's properties.
 * 
 * @param {*} project - The project object containing details about the project, including potential video_id or image properties.
 * @returns {string} - An HTML string representing either an iframe for a video or an img tag for an image.
 * @author Niwer
 */
function appendImageOrVideo(project) {
    if(!project.video_id && !project.image) return '';

    const USE_VIDEO_AS_PREV = project.video_id !== undefined;
    if(USE_VIDEO_AS_PREV)
        return `<lite-youtube videoid="${project.video_id}" title="YouTube video player of ${project.name}"></lite-youtube>`; // Lite-Youtube should reduce load time / memory usage compared to a full iframe.
        // return `<iframe loading="lazy" title="YouTube video player of ${project.name}" src="https://www.youtube.com/embed/${project.video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    return `<img loading="lazy" decoding="async" draggable="false" src="/assets/${project.image}" alt="Image of ${project.name}">`
}

/**
 * Formats a default button name based on its type.
 * 
 * @param {*} type - The type of the button, which can be 'read', 'see', 'play', or any other string. The function will return a default button name based on this type.
 * @returns  {string} - A formatted button name corresponding to the provided type, with a default fallback of "Read more".
 * @author Niwer
 */
function formatDefaultButtonName(type, langDict) {
    switch(type.toLowerCase()) {
        case 'read': return getValueWithFallback(langDict, 'btn.read', 'Read more');
        case 'see': return getValueWithFallback(langDict, 'btn.see', 'See more');
        case 'play': return getValueWithFallback(langDict, 'btn.play', 'Play');
        default: return getValueWithFallback(langDict, 'btn.read', 'Read more');
    }
}

async function loadArticles(lang, langDict) {
    const DATA = await loadJson('src/data/', 'database.json');
    if (!DATA.projects || !Array.isArray(DATA.projects)) return '<p>No projects found.</p>';
    
    const projectCards = await Promise.all(DATA.projects.map(async project => {
        const projectDescription = await loadMd(`src/data/projects/${project.name}/`, `project_description_${lang}.md`);
        return `
            <article>
                <header>
                    <h2>${getValueWithFallback(langDict, `project.title.${project.name}`, formatDefaultTitle(project.name))}</h2>
                    ${appendImageOrVideo(project)}
                </header>
                <div class="project-description">${projectDescription}</div>
                ${project.tags && Array.isArray(project.tags) ? `<p class="project-tags">${project.tags.map(tag => `#${tag}`).join(', ')}</p>` : ''}
                <footer>
                    ${project.links && typeof project.links === 'object' 
                        ? Object.entries(project.links).map(([link, type]) => `<a href="${link}" target="_blank">${formatDefaultButtonName(type, langDict)} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`).join('') 
                        : ''}
                </footer>
            </article>
        `;
    }));

    return projectCards.join('');
}

export async function projects(lang, langDict) {
    return `
        <section id="projects">
            <h2>Projects</h2>
            <div class="articles-grid">${await loadArticles(lang, langDict)}</div>
            <a class="link-button" href="https://git.niwer.dev?tab=repositories" target="_blank" rel="noopener noreferrer">Explore my GitHub</a>
        </section>
    `;
}