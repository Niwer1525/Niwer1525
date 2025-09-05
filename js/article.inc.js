function appendImageOrVideo(project) {
    let useYoutubeVideoAsPreview = project.video_id !== undefined;
    if(useYoutubeVideoAsPreview)
        return `<iframe src="https://www.youtube.com/embed/${project.video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    return `<img src="assets/${project.image}" alt="Image of ${project.name}">`
}

document.addEventListener('DOMContentLoaded', async () => {
    let projectsElement = document.getElementById('projects');
    projectsElement.innerHTML = `<h2 data-i18n="title.projects">Projects</h2>`; // Add "page" title
    
    await fetch('https://niwer1525.github.io/Niwer1525/database.json').then(response => response.json()).then(data => {
        let grid = document.createElement('div');
        grid.classList.add('projects-grid');
        
        data.projects.forEach(project => {
            let articleHTML = `<article><header><h2 data-i18n="project.title.${project.name}">Title</h2>`;
            if (project.video_id || project.image) articleHTML += appendImageOrVideo(project); // If there's an image or a video, add it
            articleHTML += `</header><p data-i18n="project.desc.${project.name}">Description</p><footer>`;
            // Add links (if there are links)
            if (project.links && typeof project.links === 'object') {
                for (const [type, link] of Object.entries(project.links)) articleHTML += `<a href="${link}" target="_blank" data-i18n="btn.${type}more">${type === 'read' ? 'Read more' : 'See more'}</a>`;
            }
            articleHTML += `</footer></article>`;
            grid.innerHTML += articleHTML;
        });

        projectsElement.appendChild(grid);
    });

    projectsElement.innerHTML +- `<p>And this is only the main ones ! Explore my github for more</p>`;
});