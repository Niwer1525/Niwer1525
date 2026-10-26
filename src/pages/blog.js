import { defaultLayout } from '../components/layout.js';
import { escapeHtml, translate } from '../utils.js';

export async function render(lang = 'en', langDict = {}, { apiBaseUrl = '' } = {}) {
    const content = `
        <section
            class="blog-page"
            data-reading-time-label="${escapeHtml(translate(langDict, 'blog.reading_time'))}"
            data-share-label="${escapeHtml(translate(langDict, 'blog.share'))}"
            data-link-copied-label="${escapeHtml(translate(langDict, 'blog.link_copied'))}"
            data-share-error-label="${escapeHtml(translate(langDict, 'blog.share_error'))}"
            data-rss-label="${escapeHtml(translate(langDict, 'blog.rss'))}"
            data-rss-copied-label="${escapeHtml(translate(langDict, 'blog.rss_copied'))}"
            data-rss-copy-error-label="${escapeHtml(translate(langDict, 'blog.rss_copy_error'))}"
        >
            <header class="blog-header">
                <h1>${translate(langDict, 'title.blog')}</h1>
                <p>${translate(langDict, 'blog.description')}</p>
                <button
                    class="button"
                    type="button"
                    data-blog-rss="${escapeHtml(`${apiBaseUrl}/blog/rss?lang=${encodeURIComponent(lang)}`)}"
                >
                    <i class="fa-solid fa-rss"></i>
                    <span class="blog-rss-label">${translate(langDict, 'blog.rss')}</span>
                </button>
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