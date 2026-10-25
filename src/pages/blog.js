import { defaultLayout } from '../components/layout.js';
import { translate } from '../utils.js';

export async function render(lang = 'en', langDict = {}, { apiBaseUrl = '' } = {}) {
    const content = `
        <section class="blog-page">
            <header class="blog-header">
                <h1>${translate(langDict, 'title.blog')}</h1>
                <p>${translate(langDict, 'blog.description')}</p>
                <a class="button" href="${apiBaseUrl}/blog/rss?lang=${encodeURIComponent(lang)}" target="_blank" rel="noopener">
                    <i class="fa-solid fa-rss"></i> ${translate(langDict, 'blog.rss')}
                </a>
            </header>
            <div id="blog-status" class="blog-status" role="status" aria-live="polite">
                ${translate(langDict, 'blog.loading')}
            </div>
            <div id="blog-posts" class="articles-grid" aria-live="polite"></div>
            <article id="blog-post" class="blog-post text-content hidden"></article>
        </section>
    `;

    return defaultLayout({
        page: 'blog',
        lang,
        langDict,
        title: `${translate(langDict, 'title.blog')} | Erwin Redoté`,
        description: translate(langDict, 'blog.description'),
        canonical: 'https://niwer.dev/blog.html',
        content,
        additionalScripts: [
            { file: '/js/blog.js', defer: true, type: 'module' }
        ]
    });
}