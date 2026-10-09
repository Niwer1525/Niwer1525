import { layout } from '../components/layout.js';

export function render(data = {}) {
  // Uses data.store_items if available, or falls back to data.projects
  const items = data.store_items || data.projects || [];

  const storeCards = items.map((item) => `
    <article class="article-card">
      ${item.image ? `<img src="${item.image}" alt="${item.title || 'Store item'}" loading="lazy">` : ''}
      <div class="card-content">
        <h3>${item.title || 'Untitled Project'}</h3>
        <p>${item.description || ''}</p>
        ${item.price ? `<span class="price-tag">${item.price}</span>` : ''}
        ${item.link ? `
          <a class="link-button" href="${item.link}" target="_blank" rel="noopener noreferrer">
            ${item.link_text || 'View Item'}
          </a>
        ` : ''}
      </div>
    </article>
  `).join('\n');

  const content = `
    <section>
      <h2>Store</h2>
      <div id="projects-grid" class="articles-grid">
        ${storeCards.length > 0 ? storeCards : '<p>No items currently available.</p>'}
      </div>
    </section>
  `;

  return layout({
    pageName: 'store',
    title: 'Developer Store & Digital Tools | Erwin Redoté',
    description: 'Explore developer tools, code repositories, and software products by Erwin Redoté.',
    canonical: 'https://niwer.dev/store.html',
    content
  });
}