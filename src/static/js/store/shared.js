export const GITHUB_USERNAME = 'Niwer1525';
export const STORE_NAMESPACE = 'niwer-store-v2';
export const STORE_CATALOG_URL = '/data/store_catalog.json';
export const STRIPE_DATA_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/data/stripe_catalog.json`;
export const CATEGORY_STORAGE_KEY = `${STORE_NAMESPACE}-category`;

export const storeState = {
    catalog: null,
    categories: [],
    packages: [],
    packageMap: new Map(),
    packageImageIndexes: new Map(),
    openCategoryIds: new Set(),
    collapsedCategoryIds: new Set(),
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

function resolvePackageImageUrl(source) {
    const normalized = String(source || '').trim();
    if (!normalized || typeof document === 'undefined') return normalized;

    const localPath = normalized.startsWith('/') && document.baseURI.startsWith('file:')
        ? `.${normalized}`
        : normalized;

    try {
        return new URL(localPath, document.baseURI).href;
    } catch {
        return normalized;
    }
}

export function packageImages(storePackage) {
    const images = [];
    for (const candidate of [storePackage?.images, storePackage?.gallery, storePackage?.media, storePackage?.image]) {
        if (Array.isArray(candidate)) {
            for (const item of candidate) {
                const source = extractPackageImageSource(item);
                const resolvedSource = resolvePackageImageUrl(source);
                if (source && isSafeAssetUrl(source) && !images.includes(resolvedSource)) images.push(resolvedSource);
            }
            continue;
        }

        const source = extractPackageImageSource(candidate);
        const resolvedSource = resolvePackageImageUrl(source);
        if (source && isSafeAssetUrl(source) && !images.includes(resolvedSource)) images.push(resolvedSource);
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

export function formatCurrency(amount, currency) {
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return '';

    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'EUR' }).format(numericValue);
    } catch {
        return `${numericValue.toFixed(2)} ${currency || 'EUR'}`;
    }
}

export function getCategoryPreference() { return localStorage.getItem(CATEGORY_STORAGE_KEY) || 'all'; }

export function setCategoryPreference(categoryId) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, categoryId);
}

export function normalizeCategoryPath(value) {
    return String(value || 'all').split('/').filter(Boolean);
}

export function matchesCategoryPath(item, active) {
    const path = normalizeCategoryPath(active);
    if (!path.length || active === 'all') return true;

    const [targetCatId, ...targetSubSegments] = path;

    // Check top-level match
    if (String(item.categoryId) !== String(targetCatId)) return false;

    // Selected top-level category: show all packages in that category
    if (!targetSubSegments.length) return true;

    const itemSubPath = Array.isArray(item.subcategoryPath)
        ? item.subcategoryPath.map(String)
        : (item.subcategoryId ? [String(item.subcategoryId)] : []);

    if (itemSubPath.length < targetSubSegments.length) return false;

    return targetSubSegments.every((segment, idx) => String(itemSubPath[idx]) === String(segment));
}

export function getResolvedPaymentLink(pkg) {
    return String(pkg?.paymentLink || pkg?.payment_link || storeState.catalog?.paymentLink || '').trim();
}

export function filteredPackages() {
    const active = String(storeState.activeCategoryId || 'all');
    // Accepts package if it has a direct payment link OR catalog has a global payment link
    const validPackages = storeState.packages.filter(pkg => Boolean(getResolvedPaymentLink(pkg)));

    if (active === 'all') return validPackages;
    return validPackages.filter(item => matchesCategoryPath(item, active));
}