import { escapeHtml } from './main.js';
import { apiRequest } from './utils/api.js';

const lang = document.documentElement.lang || 'en';
const list = document.getElementById('blog-posts');
const postView = document.getElementById('blog-post');
const status = document.getElementById('blog-status');
const blogPage = document.querySelector('.blog-page');
const labels = blogPage.dataset;

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString(lang);
}

function postUrl(post) {
    const slug = String(post.slug || '').trim();
    if (!slug) return '/blog.html';
    
    const query = new URLSearchParams();
    query.set('slug', slug);
    query.set('lang', lang);
    return `/blog.html?${query.toString()}`;
}

function readingTime(post) {
    const minutes = Number(post.reading_time_minutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return '';
    return `${escapeHtml(minutes)} ${escapeHtml(labels.readingTimeLabel)}`;
}

function renderCard(post) {
    return `
        <article class="blog-card">
            <header>
                <h2>${escapeHtml(post.title)}</h2>
                <span>${formatDate(post.published_at)}</span>
            </header>
            <main><p>${escapeHtml(post.summary || '')}</p></main>
            <footer>
                <span class="blog-card-reading-time">${readingTime(post)}</span>
                <a href="${postUrl(post)}" data-blog-slug="${escapeHtml(post.slug)}">${escapeHtml(lang === 'fr' ? 'Lire l\'article' : 'Read more')} <i class="fa-solid fa-arrow-right"></i></a>
            </footer>
        </article>
    `;
}

async function loadBlog() {
    try {
        const slug = new URLSearchParams(window.location.search).get('slug');
        if (slug) {
            const post = await apiRequest(`/blog/posts/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`);
            if (!post || !post.title) throw new Error('Blog post not found');
            status.textContent = '';
            list.classList.add('hidden');
            postView.classList.remove('hidden');
            postView.innerHTML = `
                <h1>${escapeHtml(post.title)}</h1>
                <span class="blog-post-meta">${formatDate(post.published_at)}</span>
                <div class="blog-post-content">${marked.parse(post.content_markdown || '')}</div>
                <footer class="blog-post-footer">
                    <span class="blog-post-reading-time">${readingTime(post)}</span>
                    <button class="button blog-share-button" type="button" data-blog-share>
                        <i class="fa-solid fa-share-nodes"></i>
                        <span class="blog-share-label">${escapeHtml(labels.shareLabel)}</span>
                    </button>
                </footer>
                <p class="blog-post-back">
                    <a href="/${lang === 'en' ? '' : `${lang}/`}blog.html">
                        <i class="fa-solid fa-arrow-left"></i> ${escapeHtml(lang === 'fr' ? 'Tous les articles' : 'All posts')}
                    </a>
                </p>
            `;
            return;
        }

        const posts = await apiRequest(`/blog/posts?lang=${encodeURIComponent(lang)}`);
        const publishedPosts = Array.isArray(posts) ? posts : posts.posts;
        if (!Array.isArray(publishedPosts) || publishedPosts.length === 0) {
            status.textContent = lang === 'fr' ? 'Aucun article publié.' : 'No published posts yet.';
            return;
        }
        status.textContent = '';
        list.innerHTML = publishedPosts.map(renderCard).join('');
    } catch (error) {
        console.error('Failed to load blog:', error);
        status.textContent = lang === 'fr'
            ? 'Impossible de charger les articles pour le moment.'
            : 'Unable to load blog posts right now.';
    }
}

document.addEventListener('click', (event) => {
    const rssButton = event.target.closest('button[data-blog-rss]');
    if (rssButton) {
        copyRssUrl(rssButton);
        return;
    }

    const shareButton = event.target.closest('button[data-blog-share]');
    if (shareButton) {
        shareArticle(shareButton);
        return;
    }

    const link = event.target.closest('a[data-blog-slug]');
    if (!link) return;

    event.preventDefault();
    const url = new URL(link.href, window.location.origin);
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
    loadBlog();
});

async function copyRssUrl(button) {
    const label = button.querySelector('.blog-rss-label');
    try {
        await navigator.clipboard.writeText(button.dataset.blogRss);
        label.textContent = labels.rssCopiedLabel;
    } catch (error) {
        console.error('Failed to copy RSS feed URL:', error);
        label.textContent = labels.rssCopyErrorLabel;
    }

    setTimeout(() => {
        label.textContent = labels.rssLabel;
    }, 2000);
}

async function shareArticle(button) {
    const shareUrl = window.location.href;
    const title = postView.querySelector('h1')?.textContent || document.title;
    const label = button.querySelector('.blog-share-label');

    if (typeof navigator.share === 'function') {
        try {
            await navigator.share({ title, url: shareUrl });
            return;
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Failed to share blog post:', error);
        }
    }

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(shareUrl);
            label.textContent = labels.linkCopiedLabel;
            setTimeout(() => {
                label.textContent = labels.shareLabel;
            }, 2000);
            return;
        } catch (error) {
            console.error('Failed to copy blog post link:', error);
        }
    }

    label.textContent = labels.shareErrorLabel;
    setTimeout(() => {
        label.textContent = labels.shareLabel;
    }, 2000);
}

window.addEventListener('popstate', loadBlog);
loadBlog();
