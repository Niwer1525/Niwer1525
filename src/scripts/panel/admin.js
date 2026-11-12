import { escapeHtml, formatVal, handleFormSubmit } from '../main.js';
import { api } from '../panel.js';
import { closeModals, showPopup } from '../utils/modals.js';
import { createNotification } from '../utils/toast.js';

async function loadTablesList() {
    const sel = document.getElementById('tableSelector');
    if (!sel) return;

    try {
        const tables = await api('/admin/tables');
        if (!tables || !tables.length) {
            sel.innerHTML = '<option value="">No tables available</option>';
            document.getElementById('dataTableBody').innerHTML = '<tr><td class="text-secondary">No tables found on server.</td></tr>';
            return;
        }

        sel.innerHTML = tables.map((t) => `<option value="${escapeHtml(t.table)}">${escapeHtml(t.label)}</option>`).join('');
        loadTableData();
    } catch (e) {
        console.error('Error loading tables list:', e);
        sel.innerHTML = '<option value="">Error loading tables</option>';
        createNotification('Failed to load tables list (API Error)', 'error');
    }
}
window.loadTablesList = loadTablesList;

async function executeAdminSql() {
    const input = document.getElementById('adminSql');
    const output = document.getElementById('adminSqlResult');
    if (!input || !output || !input.value.trim()) return;
    if (!window.confirm('Run this restricted SQL? UPDATE statements are backed up first.')) return;
    try {
        const result = await api('/admin/sql', { method: 'POST', body: JSON.stringify({ sql: input.value }) });
        output.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        output.textContent = error.message;
        createNotification(error.message, 'error');
    }
}
window.executeAdminSql = executeAdminSql;

async function loadTableData() {
    const table = document.getElementById('tableSelector')?.value;
    const limit = document.getElementById('tableLimit')?.value || 100;
    const head = document.getElementById('dataTableHead');
    const body = document.getElementById('dataTableBody');
    if (!table || !head || !body) return;

    try {
        const data = await api(`/admin/tables/${encodeURIComponent(table)}?limit=${limit}`);

        if (!data.columns || !data.rows.length) {
            head.innerHTML = '<tr><th>Notice</th></tr>';
            body.innerHTML = '<tr><td class="text-secondary">No rows found in this table.</td></tr>';
            return;
        }

        head.innerHTML = `<tr>${data.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;
        body.innerHTML = data.rows.map((row) =>
            `<tr>${data.columns.map((c) => `<td class="no-wrap" title="${escapeHtml(formatVal(row[c]))}">${escapeHtml(formatVal(row[c]))}</td>`).join('')}</tr>`
        ).join('');
    } catch (e) {
        console.error('Error loading table data:', e);
        createNotification('Failed to load table data', 'error');
        body.innerHTML = '<tr><td class="text-danger">Failed to fetch data.</td></tr>';
    }
}
window.loadTableData = loadTableData;

async function loadBlogPosts() {
    const body = document.getElementById('blogTableBody');
    if (!body) return;
    
    try {
        const posts = await api('/admin/blog/posts');
        if (!posts || !posts.length) {
            body.innerHTML = '<tr><td class="text-secondary">No blog posts found.</td></tr>';
            return;
        }

        body.innerHTML = posts.map((post) => `
            <tr>
                <td class="no-wrap">${escapeHtml(post.slug)}</td>
                <td class="no-wrap">${escapeHtml(post.lang)}</td>
                <td class="no-wrap">${escapeHtml(post.title)}</td>
                <td class="no-wrap">${escapeHtml(post.summary)}</td>
                <td class="no-wrap blog-sources-cell">${renderBlogSources(post.sources)}</td>
                <td class="no-wrap">${escapeHtml(post.status)}</td>
                <td class="no-wrap">${escapeHtml(post.published_at || 'N/A')}</td>
                <td class="no-wrap">${escapeHtml(post.created_at)}</td>
                <td class="no-wrap">${escapeHtml(post.updated_at)}</td>
                <td class="no-wrap">
                    ${post.status.toUpperCase() !== 'DELETED' ? `
                        <button onclick="prepareEditBlogPost('${escapeHtml(post.id)}', '${escapeHtml(post.slug)}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="openDeleteBlogPostModal('${escapeHtml(post.id)}', '${escapeHtml(post.slug)}')" class="danger-button">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    ` : ``}
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Error loading blog posts:', e);
        createNotification('Failed to load blog posts', 'error');
        body.innerHTML = '<tr><td class="text-danger">Failed to fetch blog posts.</td></tr>';
    }

    function renderBlogSources(sources) {
        if (!Array.isArray(sources) || !sources.length) return '<span class="text-secondary">N/A</span>';

        return `<ul class="blog-sources-list">${sources.map((source) => {
            const date = escapeHtml(source?.date || '');
            const url = String(source?.url || '');
            const authors = Array.isArray(source?.authors) ? source.authors.filter(Boolean).join(', ') : '';
            let link = escapeHtml(formatUrlLabel(url));

            try {
                const parsedUrl = new URL(url);
                if (['http:', 'https:'].includes(parsedUrl.protocol))
                    link = `
                        <a href="${escapeHtml(parsedUrl.href)}" title="${escapeHtml(parsedUrl.href)}" target="_blank" rel="noopener noreferrer">
                            ${escapeHtml(formatUrlLabel(url))}
                        </a>
                    `;
            } catch {
                // Display malformed source URLs as text.
            }

            return `<li><span>${date}</span> ${link}${authors ? `<small>${escapeHtml(authors)}</small>` : ''}</li>`;
        }).join('')}</ul>`;
    }
}

/**
 * Formats a URL string into a more readable label, optionally limiting its length and/or returning only the domain.
 * 
 * @param {*} urlString The URL string to format. 
 * @param {*} param1 An object containing optional parameters:
 *   - maxLength: The maximum length of the returned label. Defaults to 45 characters.
 *   - onlyDomain: A boolean indicating whether to return only the domain part of the URL. Defaults to false.
 * @returns A formatted label for the URL, which may be truncated or limited to the domain based on the provided options.
 */
function formatUrlLabel(urlString, { maxLength = 45, onlyDomain = false } = {}) {
    try {
        // Ensure scheme exists so new URL() parses bare domains like "statbel.fgov.be"
        const normalized = /^https?:\/\//i.test(urlString) ? urlString : `https://${urlString}`;
        const parsed = new URL(normalized);
        const domain = parsed.hostname.replace(/^www\./i, '');

        if (onlyDomain) return domain;

        const path = (parsed.pathname === '/' ? '' : parsed.pathname) + parsed.search;
        if (!path) return domain;

        const fullDisplay = `${domain}${path}`;
        if (fullDisplay.length <= maxLength) return fullDisplay;

        const remainingSpace = maxLength - domain.length - 3; // 3 chars for "…"
        if (remainingSpace > 6) return `${domain}${path.slice(0, remainingSpace)}…`;

        return domain;
    } catch {
        if (onlyDomain) {
            // Best-effort extraction without protocol
            const clean = urlString.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
            return clean.split(/[\/?#]/)[0];
        }

        return urlString.length > maxLength ? `${urlString.slice(0, maxLength - 1)}…` : urlString;
    }
}

async function prepareEditBlogPost(id, slug) {
    if (!id) return;
    showPopup('edit-post-popup');

    const postIdInput = document.getElementById('editPostId');
    const postSlugInput = document.getElementById('editPostSlug');
    const postScheduledAtInput = document.getElementById('editPostScheduledAt');
    const postTitleEnInput = document.getElementById('editPostTitle');
    const postSummaryEnInput = document.getElementById('editPostSummary');
    const postContentEnInput = document.getElementById('editPostContent');
    const postSources = document.getElementById('editPostSources');

    try {
        const post = await api(`/admin/blog/posts/${encodeURIComponent(id)}`);
        if (!post) throw new Error('Blog post not found');

        // Show the scheduled at field if the post has a scheduled date
        const postScheduledAtLabel = document.getElementById('editPostScheduledAtLabel');
        if (postScheduledAtLabel && post.status.toUpperCase() === 'SCHEDULED' && post.published_at) postScheduledAtLabel.classList.remove('hidden');

        // Populate the form fields with the existing blog post data
        if (postIdInput) postIdInput.value = post.id || '';
        if (postSlugInput) postSlugInput.value = post.slug || '';
        if (postScheduledAtInput) postScheduledAtInput.value = post.scheduled_at || '';
        if (postTitleEnInput) postTitleEnInput.value = post.title || '';
        if (postSummaryEnInput) postSummaryEnInput.value = post.summary || '';
        if (postContentEnInput) postContentEnInput.value = post.content_markdown || '';
        if (postSources) {
            postSources.replaceChildren();
            (post.sources || []).forEach((source) => postSources.append(createPostSourceRow(source)));
        }
    } catch (e) {
        console.error('Error fetching blog post for editing:', e);
        createNotification(`Failed to load blog post "${slug}" for editing.`, 'error');
        closeModals();
    }
}
window.prepareEditBlogPost = prepareEditBlogPost;

/**
 * Handle the form submission for editing an existing blog post
 * 
 * @param {*} e The form submission event
 */
export async function editBlogPost(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const postId = formData.get('post_id');
        if (!postId) throw new Error('Blog post ID is missing');
        
        const jsonBody = Object.fromEntries(formData.entries());
        delete jsonBody.source_date;
        delete jsonBody.source_url;
        delete jsonBody.source_authors;
        jsonBody.sources = getPostSources(form);
        const result = await api(`/admin/blog/posts/update`, { method: 'POST', body: JSON.stringify(jsonBody), headers: { 'Content-Type': 'application/json' } });
        if (result.success) loadBlogPosts();
        closeModals();
    });
}

function openDeleteBlogPostModal(id, slug) {
    const modal = document.getElementById('delete-post-popup');
    if (!(modal instanceof HTMLElement)) {
        createNotification('Unable to delete blog post: modal is unavailable', 'error');
        return;
    }

    modal.dataset.postId = id;
    modal.dataset.postSlug = slug;
    showPopup('delete-post-popup');
}
window.openDeleteBlogPostModal = openDeleteBlogPostModal;

async function deleteBlogPost() {
    const modal = document.getElementById('delete-post-popup');
    const id = modal?.dataset.postId;
    const slug = modal?.dataset.postSlug;
    if (!id || !slug) {
        createNotification('Unable to delete blog post: missing post details', 'error');
        return;
    }

    delete modal.dataset.postId;
    delete modal.dataset.postSlug;
    closeModals();
    
    try {
        const result = await api(`/admin/blog/posts/delete/${encodeURIComponent(id)}`, { method: 'POST' });
        if (result.success) loadBlogPosts();
    } catch (e) {
        console.error('Error deleting blog post:', e);
        createNotification(`Error deleting blog post "${slug}".`, 'error');
    }
}
window.deleteBlogPost = deleteBlogPost;

/**
 * Handle the form submission for creating a new blog post
 * 
 * @param {*} e The form submission event 
 * @returns The result of the form submission, or an error notification if it fails
 */
export async function createBlogPost(e) {
    return handleFormSubmit(e, async (form, formData) => {
        const jsonBody = Object.fromEntries(formData.entries());
        jsonBody.draft = e.submitter?.dataset.draft === 'true';
        delete jsonBody.source_date;
        delete jsonBody.source_url;
        delete jsonBody.source_authors;
        const sources = getPostSources(form);
        if (sources.length) jsonBody.sources = sources;

        const result = await api('/admin/blog/posts/create', { method: 'POST', body: JSON.stringify(jsonBody), headers: { 'Content-Type': 'application/json' } });
        if (result.success) loadBlogPosts();
        closeModals();
    });
}

function createPostSourceRow(source = {}) {
    const row = document.createElement('div');
    row.className = 'create-post-source';
    row.innerHTML = `
        <label>
            <i class="fa-solid fa-calendar"></i>
            <input type="date" name="source_date" aria-label="Source date">
        </label>
        <label>
            <i class="fa-solid fa-link"></i>
            <input type="url" name="source_url" placeholder="https://example.com/article" aria-label="Source URL">
        </label>
        <label>
            <i class="fa-solid fa-users"></i>
            <input type="text" name="source_authors" placeholder="Author 1, Author 2" aria-label="Source authors">
        </label>
        <button type="button" class="danger-button remove-post-source" aria-label="Remove source">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    row.querySelector('[name="source_date"]').value = source.date || '';
    row.querySelector('[name="source_url"]').value = source.url || '';
    row.querySelector('[name="source_authors"]').value = Array.isArray(source.authors) ? source.authors.join(', ') : '';
    return row;
}

function getPostSources(form) {
    return [...form.querySelectorAll('.create-post-source')].map((sourceRow, index) => {
        const date = sourceRow.querySelector('[name="source_date"]')?.value.trim();
        const url = sourceRow.querySelector('[name="source_url"]')?.value.trim();
        const authors = sourceRow.querySelector('[name="source_authors"]')?.value.trim();

        if (!date && !url && !authors) return null;
        if (!date || !url) throw new Error(`Source ${index + 1} requires both a date and a URL.`);
        const parsedDate = new Date(`${date}T00:00:00Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
            throw new Error(`Source ${index + 1} must use a valid ISO date.`);
        }

        try {
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Unsupported URL protocol');
        } catch {
            throw new Error(`Source ${index + 1} must use a valid HTTP(S) URL.`);
        }

        return {
            date,
            url,
            ...(authors ? { authors: authors.split(',').map((author) => author.trim()).filter(Boolean) } : {})
        };
    }).filter(Boolean);
}

export function addPostSource(containerId = 'createPostSources') {
    document.getElementById(containerId)?.append(createPostSourceRow());
}

export function removePostSource(button) {
    button.closest('.create-post-source')?.remove();
}

window.addPostSource = addPostSource;
window.removePostSource = removePostSource;

/**
 * Load the admin panel sections when the admin page is accessed
 */
export function loadAdminPanel() {
    loadTablesList();
    loadBlogPosts();
}