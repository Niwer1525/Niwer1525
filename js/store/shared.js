const { trimAndMinifyHTML } = globalThis;

export const STORE_NAMESPACE = 'niwer-store-v2';
export const STORE_CATALOG_URL = './store_catalog.json';
export const CATEGORY_STORAGE_KEY = `${STORE_NAMESPACE}-category`;

export const storeState = {
    catalog: null,
    categories: [],
    packages: [],
    packageMap: new Map(),
    packageImageIndexes: new Map(),
    openCategoryIds: new Set(),
    activeCategoryId: 'all',
    loading: true,
    error: null,
};

export function formatDefaultTitle(projectName) {
    return String(projectName || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export function isSafeAssetUrl(url) {
    const normalized = String(url || '').trim();
    return Boolean(normalized) && /^(https?:|mailto:|\/|#)/i.test(normalized);
}

export function extractPackageImageSource(image) {
    if (!image) return '';
    if (typeof image === 'string') return image.trim();
    if (typeof image === 'object') {
        return String(image.src ?? image.url ?? image.image ?? image.path ?? '').trim();
    }
    return '';
}

export function packageImages(storePackage) {
    const images = [];
    for (const candidate of [storePackage?.images, storePackage?.gallery, storePackage?.media, storePackage?.image]) {
        if (Array.isArray(candidate)) {
            for (const item of candidate) {
                const source = extractPackageImageSource(item);
                if (source && isSafeAssetUrl(source) && !images.includes(source)) images.push(source);
            }
            continue;
        }

        const source = extractPackageImageSource(candidate);
        if (source && isSafeAssetUrl(source) && !images.includes(source)) images.push(source);
    }

    return images;
}

export function getPackageImageIndex(packageId, imageCount) {
    if (!imageCount) return 0;
    const storedIndex = storeState.packageImageIndexes.get(Number(packageId));
    return Number.isInteger(storedIndex) ? storedIndex % imageCount : 0;
}

export function setPackageImageIndex(packageId, nextIndex) {
    const numericPackageId = Number(packageId);
    if (numericPackageId) storeState.packageImageIndexes.set(numericPackageId, nextIndex);
}

export function sanitizeHtml(value) {
    const allowedTags = new Set(['a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'span', 'ul']);
    const allowedAttributes = new Set(['alt', 'aria-label', 'aria-hidden', 'class', 'href', 'loading', 'rel', 'src', 'target', 'title', 'width', 'height']);
    const template = document.createElement('template');
    template.innerHTML = String(value || '');

    const isSafeUrl = url => isSafeAssetUrl(url);
    const walk = node => {
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) continue;
            if (child.nodeType !== Node.ELEMENT_NODE) {
                child.remove();
                continue;
            }

            const element = child;
            const tagName = element.tagName.toLowerCase();
            if (!allowedTags.has(tagName)) {
                element.replaceWith(...Array.from(element.childNodes));
                continue;
            }

            for (const attribute of Array.from(element.attributes)) {
                const name = attribute.name.toLowerCase();
                const attributeValue = attribute.value;
                if (name.startsWith('on') || !allowedAttributes.has(name)) {
                    element.removeAttribute(attribute.name);
                    continue;
                }

                if ((name === 'href' || name === 'src') && !isSafeUrl(attributeValue)) element.removeAttribute(attribute.name);
            }

            if (tagName === 'a') {
                const href = element.getAttribute('href');
                if (!href || !isSafeUrl(href)) element.removeAttribute('href');
                else {
                    element.setAttribute('target', '_blank');
                    element.setAttribute('rel', 'noopener noreferrer');
                }
            }

            if (tagName === 'img') {
                const src = element.getAttribute('src');
                if (!src || !isSafeUrl(src)) {
                    element.remove();
                    continue;
                }

                if (!element.hasAttribute('loading')) element.setAttribute('loading', 'lazy');
                if (!element.hasAttribute('decoding')) element.setAttribute('decoding', 'async');
            }

            walk(element);
        }
    };

    walk(template.content);
    return template.innerHTML.trim();
}

export function formatCurrency(amount, currency) {
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return '';

    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(numericValue);
    } catch {
        return `${numericValue.toFixed(2)} ${currency || 'USD'}`;
    }
}
export function getCategoryPreference() { return localStorage.getItem(CATEGORY_STORAGE_KEY) || 'all'; }

export function setCategoryPreference(categoryId) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, categoryId);
}

export function filteredPackages() {
    const active = String(storeState.activeCategoryId || 'all');
    const withPaymentLink = storeState.packages.filter(pkg => {
        const link = String(pkg.paymentLink || pkg.payment_link || '').trim();
        return Boolean(link);
    });

    if (active === 'all') return withPaymentLink;

    // support selection of "categoryId" or "categoryId/subcategoryId"
    const parts = active.split('/');
    const categoryId = parts[0];
    const subcategoryId = parts[1] || null;

    if (!subcategoryId) {
        return withPaymentLink.filter(item => String(item.categoryId) === String(categoryId));
    }

    return withPaymentLink.filter(item => String(item.categoryId) === String(categoryId) && String(item.subcategoryId || '') === String(subcategoryId));
}