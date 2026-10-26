import { defaultLayout } from '../components/layout.js';
import { escapeHtml, translate } from '../utils.js';
import { marked } from 'marked';

function formatDate(value, lang) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? escapeHtml(value || '') : date.toLocaleDateString(lang);
}

function postUrl(post, lang) {
    return `/${lang === 'en' ? '' : `${lang}/`}blog/${encodeURIComponent(post.slug)}.html`;
}

function readingTime(post, label) {
    const minutes = Number(post.reading_time_minutes);
    return Number.isFinite(minutes) && minutes > 0
        ? `${escapeHtml(minutes)} ${escapeHtml(label)}`
        : '';
}

function renderCard(post, lang, label) {
    return `
        <article class="blog-card">
            <header><h2>${escapeHtml(post.title)}</h2><span>${formatDate(post.published_at, lang)}</span></header>
            <main><p>${escapeHtml(post.summary || '')}</p></main>
            <footer>
                <span class="blog-card-reading-time">${readingTime(post, label)}</span>
                <a href="${postUrl(post, lang)}">${escapeHtml(lang === 'fr' ? "Lire l'article" : 'Read more')} <i class="fa-solid fa-arrow-right"></i></a>
            </footer>
        </article>
    `;
}

export async function fetchPosts(apiBaseUrl, lang) {
    const response = await fetch(`${apiBaseUrl}/blog/posts?lang=${encodeURIComponent(lang)}`);
    if (!response.ok) throw new Error(`Could not fetch blog posts: ${response.statusText}`);
    const payload = await response.json();
    const posts = Array.isArray(payload) ? payload : payload.posts;
    return Array.isArray(posts) ? posts : [];
}

export function renderPost(post, lang = 'en', langDict = {}) {
    const readingTimeLabel = translate(langDict, 'blog.reading_time');
    const content = `
        <article class="blog-post text-content">
            <h1>${escapeHtml(post.title)}</h1>
            <span class="blog-post-meta">${formatDate(post.published_at, lang)}</span>
            <div class="blog-post-content">${marked.parse(post.content_markdown || '')}</div>
            <footer class="blog-post-footer">
                <span class="blog-post-reading-time">${readingTime(post, readingTimeLabel)}</span>
                <button class="button blog-share-button" type="button" onclick="navigator.share ? navigator.share({ title: document.title, url: location.href }) : copyToClipboardWithNotification(location.href, ${escapeHtml(JSON.stringify(translate(langDict, 'blog.link_copied')))})">
                    <i class="fa-solid fa-share-nodes"></i>
                    <span>${escapeHtml(translate(langDict, 'blog.share'))}</span>
                </button>
            </footer>
            <p class="blog-post-back"><a href="/${lang === 'en' ? '' : `${lang}/`}blog/"><i class="fa-solid fa-arrow-left"></i> ${escapeHtml(lang === 'fr' ? 'Tous les articles' : 'All posts')}</a></p>
        </article>
    `;

    return defaultLayout({
        page: 'blog',
        lang,
        langDict,
        title: `${escapeHtml(post.title)} | ${translate(langDict, 'title.blog')}`,
        description: translate(langDict, 'blog.description'),
        canonical: `https://niwer.dev/${lang === 'en' ? '' : `${lang}/`}blog/${encodeURIComponent(post.slug)}.html`,
        content
    });
}

export function render(lang = 'en', langDict = {}, { apiBaseUrl = '' } = {}, posts = []) {
    const readingTimeLabel = translate(langDict, 'blog.reading_time');
    const postCards = posts.map(post => renderCard(post, lang, readingTimeLabel)).join('');
    const content = `
        <section class="blog-page">
            <header class="blog-header">
                <h1>${translate(langDict, 'title.blog')}</h1>
                <p>${translate(langDict, 'blog.description')}</p>
                <button class="button" type="button" onclick="copyToClipboardWithNotification(${escapeHtml(JSON.stringify(`${apiBaseUrl}/blog/rss?lang=${encodeURIComponent(lang)}`))}, ${escapeHtml(JSON.stringify(translate(langDict, 'blog.rss_copied')))})">
                    <i class="fa-solid fa-rss"></i>
                    <span>${translate(langDict, 'blog.rss')}</span>
                </button>
            </header>
            ${posts.length
                ? `<div class="articles-grid">${postCards}</div>`
                : `<div class="blog-status" role="status">${translate(langDict, 'blog.no_posts')}</div>`}
        </section>
    `;

    return defaultLayout({
        page: 'blog',
        lang,
        langDict,
        title: `${translate(langDict, 'title.blog')} | Erwin Redoté`,
        description: translate(langDict, 'blog.description'),
        canonical: `https://niwer.dev/${lang === 'en' ? '' : `${lang}/`}blog/`,
        content
    });
}