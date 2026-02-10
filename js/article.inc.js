function appendImageOrVideo(project) {
    let useYoutubeVideoAsPreview = project.video_id !== undefined;
    if(useYoutubeVideoAsPreview)
        return `<iframe src="https://www.youtube.com/embed/${project.video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    return `<img draggable="false" src="assets/${project.image}" alt="Image of ${project.name}">`
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const baseUrl = (typeof websiteURL !== 'undefined') ? websiteURL : '';
        const response = await fetch(`${baseUrl}/database.json?t=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        
        /* Create the grid container */
        let grid = document.getElementById('projects-grid');
        
        // Creating a single HTML string to inject all articles at once (much faster than multiple DOM manipulations)
        let allArticlesHTML = ''; 
        if (data.projects && Array.isArray(data.projects)) {
            data.projects.forEach(project => {
                allArticlesHTML += `
                    <article>
                        <header>
                            <h2 data-i18n="project.title.${project.name}">Title</h2>
                            ${project.video_id || project.image ? appendImageOrVideo(project) : ''}
                        </header>
                        <p data-i18n="project.desc.${project.name}">Description</p>
                        ${project.tags && Array.isArray(project.tags) ? `<p class="project-tags">${project.tags.map(tag => `#${tag}`).join(', ')}</p>` : ''}
                        <footer>
                            ${project.links && typeof project.links === 'object' ? Object.entries(project.links).map(([link, type]) => `<a href="${link}" target="_blank" data-i18n="btn.${type}">See more</a>`).join('') : ''}
                        </footer>
                    </article>
                `;
            });
        }
        grid.innerHTML = allArticlesHTML;
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
});