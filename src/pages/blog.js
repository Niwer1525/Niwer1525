import { marked } from 'marked';
import { defaultLayout } from '../components/layout.js';
import { escapeHtml, translate } from '../utils.js';

const blogPrefix = (lang) => (lang === 'en' ? '/blog/' : `/${lang}/blog/`);

function formatDate(val, lang) {
    const d = new Date(val);
    if(isNaN(d)) return escapeHtml(val || '')
        
    return `
        <span class="text-secondary">
            <i class="fa-solid fa-calendar-days"></i>
            ${d.toLocaleDateString(lang)}
        </span>
    `;
}

function readingTime(minutes) {
    const n = Number(minutes);
    if(n < 0 || isNaN(n)) return '';

    return `
        <span class="text-secondary">
            <i class="fa-solid fa-stopwatch"></i>
            ${n} min
        </span>
    `;
}

function renderSources(sources, lang) {
    if (!sources?.length) return '';

    const list = sources.map(({ date, url = '', authors = [] }) => {
        const isHttp = /^https?:\/\//i.test(url);
        const link = isHttp
            ? `<a class="text-bold" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`
            : escapeHtml(url);
        const authorStr = authors.filter(Boolean).join(', ');

        return `
            <div>
                ${formatDate(date, lang)}
                -
                <span class="text-secondary">
                    ${link}
                    ${authorStr ? `<span>(${escapeHtml(authorStr)}</span>)` : ''}
                </span>
            </div>`;
    }).join('');

    return `<div class="article-info">${list}</div>`;
}

function renderCard(post, lang, fullScreen = false) {
    return `
        <article>
            <header><h2>${escapeHtml(post.title)}</h2></header>
            <main><p>${escapeHtml(post.summary || '')}</p></main>
            <footer>
                ${readingTime(post.reading_time_minutes)}
                <span class="text-secondary">${formatDate(post.published_at, lang)}</span>
                <a href="${blogPrefix(lang)}${encodeURIComponent(post.slug)}.html">
                    ${escapeHtml(lang === 'fr' ? "Lire l'article" : 'Read more')}
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            </footer>
        </article>`;
}

export async function fetchPosts(apiBaseUrl, lang) {
    const res = await fetch(`${apiBaseUrl}/blog/posts?lang=${encodeURIComponent(lang)}`);
    if (!res.ok) throw new Error(`Could not fetch blog posts: ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.posts ?? [];
}

export function renderPost(post, lang = 'en', langDict = {}) {
    const slugUrl = `${blogPrefix(lang)}${encodeURIComponent(post.slug)}.html`;

    const content = `
        <article>
            <header><h2>${escapeHtml(post.title)}</h2></header>
            <main><p>${marked.parse(post.content_markdown || '')}</p></main>
            ${renderSources(post.sources, lang)}
            <footer>
                <div>
                    <a href="${blogPrefix(lang)}" class="button">
                        <i class="fa-solid fa-arrow-left"></i>
                    </a>
                    <button class="button" type="button" title="${translate(langDict, 'blog.share')}" onclick="navigator.share ? navigator.share({ title: document.title, url: location.href }) : copyToClipboardWithNotification(location.href, ${escapeHtml(JSON.stringify(translate(langDict, 'blog.link_copied')))})">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
                ${formatDate(post.published_at, lang)}
                ${readingTime(post.reading_time_minutes)}
            </footer>
        </article>`;

    return defaultLayout({
        page: 'blog', lang, langDict,
        title: `${escapeHtml(post.title)} | ${translate(langDict, 'title.blog')}`,
        description: translate(langDict, 'blog.description'),
        canonical: `https://niwer.dev${slugUrl}`,
        content
    });
}

/**
 * Renders the blog page with a list of posts.
 */
export function render(lang = 'en', langDict = {}, { apiBaseUrl = '' } = {}, posts = []) {
    const postCards = posts.map(p => renderCard(p, lang, false)).join('');
    const rssUrl = `${apiBaseUrl}/blog/rss?lang=${encodeURIComponent(lang)}`;

    const content = `
    <section class="blog-page">
        <h2>${translate(langDict, 'title.blog')}</h2>
        <header class="blog-header">
            <p>${translate(langDict, 'blog.description')}</p>
            <button class="button" type="button" onclick="copyToClipboardWithNotification(${escapeHtml(JSON.stringify(rssUrl))}, ${escapeHtml(JSON.stringify(translate(langDict, 'blog.rss_copied')))})">
                <i class="fa-solid fa-rss"></i>
                ${translate(langDict, 'blog.rss')}
            </button>
        </header>
        ${posts.length ? `<div class="articles-grid large-card">${postCards}</div>` : `<div class="blog-status" role="status">${translate(langDict, 'blog.no_posts')}</div>`}
    </section>`;

    return defaultLayout({
        page: 'blog', lang, langDict,
        title: `${translate(langDict, 'title.blog')} | Erwin Redoté`,
        description: translate(langDict, 'blog.description'),
        canonical: `https://niwer.dev${blogPrefix(lang)}`,
        content
    });
}