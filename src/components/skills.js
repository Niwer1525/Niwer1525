import { getValueWithFallback } from '../utils.js';

function createCard(iconClass, skillName) {
    return `
    <div class="skills-card">
        <i class="${iconClass} skill-icon" alt="${skillName}"></i>
        ${skillName}
    </div>`;
}

export function skillsCards(langDict) {
  return `
    <section id="skills">
        <h2>${getValueWithFallback(langDict, 'title.skills', 'Skills')}</h2>
        <div class="skills-grid">
            <!-- Game/App dev -->
            ${createCard('fa-brands fa-java', 'Java')}
            ${createCard('devicon-csharp-plain', 'C#')}
            ${createCard('devicon-opengl-plain', 'OpenGL')}
            <!-- Web tech -->
            ${createCard('fa-brands fa-html5', 'HTML')}
            ${createCard('fa-brands fa-css3-alt', 'CSS')}
            ${createCard('fa-brands fa-square-js', 'JavaScript')}
            ${createCard('fa-brands fa-php', 'PHP')}
            ${createCard('fa-brands fa-node-js', 'NodeJS')}
            ${createCard('devicon-threejs-original', 'ThreeJS')}
            <!-- Tools -->
            ${createCard('fa-solid fa-code-branch', 'Git')}
            ${createCard('fa-brands fa-github', 'Github')}
            ${createCard('fa-brands fa-linux', 'Linux CLI')}
            ${createCard('devicon-gradle-plain', 'Gradle')}
            ${createCard('devicon-sqlite-plain', 'SQLite')}
            ${createCard('devicon-mysql-plain', 'MySQL')}
            ${createCard('devicon-docker-plain', 'Docker')}
            <!-- IDEs -->
            ${createCard('devicon-eclipse-plain', 'Eclipse')}
            ${createCard('devicon-visualstudio-plain', 'VS Code')}
        </div>
    </section>
    `;
}