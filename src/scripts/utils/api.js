const API_BASE = process.env.API_BASE_URL || 'https://panel.niwer.dev';

export async function apiRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const isFormData = options.body instanceof FormData;
    const isURLSearch = options.body instanceof URLSearchParams;

    if (options.body && !isFormData && !isURLSearch && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(API_BASE + path, {
        credentials: 'include',
        ...options,
        headers
    });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('json') ? await response.json() : await response.text();

    if (response.ok) return payload;

    const error = new Error(typeof payload === 'string' ? payload : payload?.message || response.statusText);
    error.status = response.status;
    throw error;
}
