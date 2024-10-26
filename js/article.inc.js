function appendImageOrVideo(project) {
    let useYoutubeVideoAsPreview = project.video_id !== undefined;
    if(useYoutubeVideoAsPreview) {
        return `<iframe src="https://www.youtube.com/embed/${project.video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    return `<img src="assets/${project.image}" alt="Image of ${project.name}">`
}

document.addEventListener('DOMContentLoaded', () => {
    let file = document.getElementById('projects');
    file.innerHTML = `<h2 data-i18n="title.projects">Projects</h2>`; // Add "page" title
    
    fetch('../database.json').then(response => response.json()).then(data => {
        let grid = document.createElement('div');
        grid.classList.add('projects-grid');
        
        data.projects.forEach(project => {
            grid.innerHTML += `
                <article>
                    <header>
                        <h2 data-i18n="project.title.${project.name}">Title</h2>
                        ${appendImageOrVideo(project)}
                    </header>
                    <p data-i18n="project.desc.${project.name}">Description</p>
                    <footer>
                        <a href="${project.link}" target="_blank" data-i18n="btn.${project.linkType == 'read' ? 'read' : 'see'}more">View Project</a>
                    </footer>
                </article>
            `;
        });

        file.appendChild(grid);
    });

    file.innerHTML +- `<p>And this is only the main ones ! Explore my github for more</p>`;
});