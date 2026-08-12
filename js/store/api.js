import { STORE_CATALOG_URL, getCategoryPreference, sanitizeHtml, storeState } from './shared.js';
import { renderStateMessage } from './render.js';

export function unwrapApiData(payload) {
    if (!payload) return null;
    return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

function readPositiveNumber(value, fallback = 0) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

function ensureNumericId(value, fallbackId) {
    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue) && parsedValue > 0) return parsedValue;
    return fallbackId;
}

function walkSubcategories(subcategories, parentPath = []) {
    return (Array.isArray(subcategories) ? subcategories : []).flatMap(sub => {
        const id = ensureNumericId(sub?.id, parentPath.length + 1);
        const path = [...parentPath, id];
        return [{ ...sub, __path: path }, ...walkSubcategories(sub?.subcategories, path)];
    });
}

export async function loadStorePackages() {
    const response = await fetch(STORE_CATALOG_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load store catalog (${response.status}).`);

    const payload = unwrapApiData(await response.json());
    const categories = Array.isArray(payload?.categories) ? payload.categories : (Array.isArray(payload) ? payload : []);

    storeState.catalog = {
        currency: String(payload?.currency || 'EUR').toUpperCase(),
        taxRate: Number(payload?.taxRate) || 0,
        paymentLink: payload?.paymentLink || '',
        packageName: payload?.packageName || 'Unknown package',
    };

    storeState.categories = categories.map((category, categoryIndex) => ({
        id: ensureNumericId(category?.id, categoryIndex + 1),
        name: category?.name || `Category ${categoryIndex + 1}`,
        // preserve legacy top-level packages and nested subcategories
        packages: Array.isArray(category?.packages) ? category.packages : [],
        subcategories: Array.isArray(category?.subcategories) ? category.subcategories : [],
    }));

    storeState.packages = storeState.categories.flatMap((category, categoryIndex) => {
        const fromTop = Array.isArray(category.packages) ? category.packages.map((storePackage, packageIndex) => {
            const fallbackId = ((categoryIndex + 1) * 1000) + packageIndex + 1;
            return {
                ...storePackage,
                id: ensureNumericId(storePackage?.id, fallbackId),
                currency: String(storePackage?.currency || storeState.catalog.currency || 'EUR').toUpperCase(),
                categoryId: category.id,
                categoryName: category.name,
                subcategoryId: null,
                subcategoryName: null,
                subcategoryPath: [],
                sanitizedDescription: sanitizeHtml(storePackage.description) || '<p>No description available.</p>',
            };
        }) : [];

        const fromSubs = walkSubcategories(category.subcategories).flatMap((subNode) => Array.isArray(subNode.packages) ? subNode.packages.map((storePackage, packageIndex) => {
            const fallbackId = ((categoryIndex + 1) * 1000) + (subNode.__path.join('-').length) + packageIndex + 1;
            return {
                ...storePackage,
                id: ensureNumericId(storePackage?.id, fallbackId),
                currency: String(storePackage?.currency || storeState.catalog.currency || 'EUR').toUpperCase(),
                categoryId: category.id,
                categoryName: category.name,
                subcategoryId: subNode.__path[subNode.__path.length - 1],
                subcategoryName: subNode.name || null,
                subcategoryPath: subNode.__path,
                sanitizedDescription: sanitizeHtml(storePackage.description) || '<p>No description available.</p>',
            };
        }) : []);

        return [...fromTop, ...fromSubs];
    });

    if (!storeState.packages.length && storeState.catalog.paymentLink) {
        const fallbackCategoryId = storeState.categories[0]?.id || 1;
        const fallbackCategoryName = storeState.categories[0]?.name || 'Store';
        storeState.categories = storeState.categories.length ? storeState.categories : [{ id: fallbackCategoryId, name: fallbackCategoryName, packages: [] }];
        storeState.packages = [{
            id: 1,
            name: storeState.catalog.packageName,
            slug: 'support-package',
            displayed_price: 0,
            currency: storeState.catalog.currency,
            categoryId: fallbackCategoryId,
            categoryName: fallbackCategoryName,
            paymentLink: storeState.catalog.paymentLink,
            sanitizedDescription: '<p>Redirects to Stripe payment link.</p>',
        }];
    }

    storeState.packageMap = new Map(storeState.packages.map(storePackage => [Number(storePackage.id), storePackage]));
    storeState.activeCategoryId = getCategoryPreference();

    // validate activeCategoryId: supports 'all', 'categoryId', or 'categoryId/subcategoryId[/...childSubcategoryId]'
    const active = String(storeState.activeCategoryId || 'all');
    if (active !== 'all') {
        const parts = active.split('/').filter(Boolean);
        const catId = parts[0];
        const foundCategory = storeState.categories.some(cat => String(cat.id) === String(catId));
        if (!foundCategory) storeState.activeCategoryId = 'all';
        else {
            const category = storeState.categories.find(cat => String(cat.id) === String(catId));
            let current = Array.isArray(category?.subcategories) ? category.subcategories : [];
            let valid = true;
            for (const id of parts.slice(1)) {
                const next = current.find(sub => String(sub.id) === String(id));
                if (!next) { valid = false; break; }
                current = Array.isArray(next.subcategories) ? next.subcategories : [];
            }
            if (!valid) storeState.activeCategoryId = String(catId);
        }
    }

    renderStateMessage(storeState.packages.length ? `Loaded ${storeState.categories.length} categories and ${storeState.packages.length} packages.` : 'No packages were returned by the catalog.');
}
export function getPackagePaymentLink(packageId) {
    const storePackage = storeState.packageMap.get(Number(packageId));
    return String(storePackage?.paymentLink || storePackage?.payment_link || storeState.catalog?.paymentLink || '').trim();
}