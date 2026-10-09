import { layout } from '../components/layout.js';

export function render(data) {
  // Generate HTML for project cards directly from data
  const projectCards = (data.projects || []).map(p => `
    <article class="article-card">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      ${p.link ? `<a class="link-button" href="${p.link}" target="_blank" rel="noopener noreferrer">View Project</a>` : ''}
    </article>
  `).join('');

  const content = `
    <section id="presentation">
      <div>
        <h1>REDOTÉ Erwin</h1>
        <p>Self-taught developer, passionate about code and backend architecture.</p>
      </div>
      <img src="./assets/profile.webp" alt="REDOTÉ Erwin" fetchpriority="high">
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <div id="projects-grid" class="articles-grid">
        ${projectCards}
      </div>
      <a class="link-button" href="https://git.niwer.dev?tab=repositories" target="_blank" rel="noopener noreferrer">Explore my GitHub</a>
    </section>
  `;

  return layout({
    pageName: 'index',
    title: 'Erwin Redoté (Niwer) - Developer Portfolio',
    description: 'Portfolio of Erwin Redoté, a Java and Web developer showcasing recent work and open source projects.',
    canonical: 'https://niwer.dev',
    content
  });
}