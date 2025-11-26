function appendImageOrVideo(project) {
    let useYoutubeVideoAsPreview = project.video_id !== undefined;
    if(useYoutubeVideoAsPreview)
        return `<iframe src="https://www.youtube.com/embed/${project.video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    return `<img src="assets/${project.image}" alt="Image of ${project.name}">`
}

document.addEventListener('DOMContentLoaded', async () => {
    let projectsElement = document.getElementById('projects');
    projectsElement.innerHTML = `<h2 data-i18n="title.projects">Projects</h2>`; // Add "page" title
    projectsElement.innerHTML += `<h3 data-i18n="projects.loading" id="loading-projects-indicator">Loading projects...</h3>`;
    
    try {
        const response = await fetch(websiteURL + '/database.json');
        const data = await response.json();

        let grid = document.createElement('div');
        grid.classList.add('projects-grid');
        
        data.projects.forEach(project => {
            let articleHTML = `<article><header><h2 data-i18n="project.title.${project.name}">Title</h2>`;
            if (project.video_id || project.image) articleHTML += appendImageOrVideo(project); // If there's an image or a video, add it
            articleHTML += `</header><p data-i18n="project.desc.${project.name}">Description</p>`;

            /* Tags */
            if (project.tags && Array.isArray(project.tags)) articleHTML += `<p class="project-tags">${project.tags.map(tag => `#${tag}`).join(', ')}</p>`;

            /* Footer */
            articleHTML += `<footer>`;
            if (project.links && typeof project.links === 'object') { // Add links (if there are links)
                for (const [link, type] of Object.entries(project.links)) articleHTML += `<a href="${link}" target="_blank" data-i18n="btn.${type}">'See more'}</a>`;
            }
            articleHTML += `</footer></article>`;
            grid.innerHTML += articleHTML;
        });

        let loadingIndicator = document.getElementById('loading-projects-indicator');
        if (loadingIndicator) loadingIndicator.remove();

        projectsElement.appendChild(grid);
    } catch (error) {
        console.error('Error fetching or processing projects:', error);
        let loadingIndicator = document.getElementById('loading-projects-indicator');
        if (loadingIndicator) {
            loadingIndicator.textContent = 'Error loading projects.';
            loadingIndicator.setAttribute('data-i18n', 'projects.error');
        }
    }

    const exploreGithub = document.createElement('p');
    exploreGithub.className = 'explore-github';
    exploreGithub.setAttribute('data-i18n', 'explore.github');
    exploreGithub.textContent = 'And this is only the main ones ! Explore my github for more.';
    projectsElement.appendChild(exploreGithub);
});