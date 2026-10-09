import { STORE_CATALOG_URL, STRIPE_DATA_URL, getCategoryPreference, sanitizeHtml, storeState } from './shared.js';
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

async function loadPackageDescription(descriptionPath) {
    const path = String(descriptionPath || '').trim();
    if (!path) return '<p data-i18n="description.unavailable">Description unavailable.</p>';

    try {
        const localPath = path.startsWith('/') ? `.${path}` : path;
        const response = await fetch(new URL(localPath, document.baseURI));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const markdown = await response.text();
        const parser = globalThis.marked?.parse;
        if (typeof parser !== 'function') throw new Error('Markdown parser is unavailable.');

        return sanitizeHtml(parser(markdown));
    } catch (error) {
        console.error(`Could not load package description: ${path}`, error);
        return '<p data-i18n="description.unavailable">Description unavailable.</p>';
    }
}

export async function loadStorePackages() {
    // Getting the catalog and Stripe data in parallel
    const [catalogResponse, stripeResponse] = await Promise.all([
        fetch(STORE_CATALOG_URL, { cache: 'no-store' }),
        fetch(STRIPE_DATA_URL, { cache: 'no-store' }).catch(() => null)
    ]);

    if (!catalogResponse.ok) throw new Error(`Could not load store catalog (${catalogResponse.status}).`);

    // Mapping Stripe price IDs to their corresponding data for quick lookup
    const stripePriceMap = new Map();
    if (stripeResponse && stripeResponse.ok) {
        try {
            const stripePayload = await stripeResponse.json();
            const stripeData = Array.isArray(stripePayload?.data) ? stripePayload.data : [];
            for (const item of stripeData) {
                if (item?.id) stripePriceMap.set(item.id, item);
            }
        } catch (err) {
            console.warn('Could not parse live Stripe data:', err);
        }
    }

    const payload = unwrapApiData(await catalogResponse.json());
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
        packages: Array.isArray(category?.packages) ? category.packages : [],
        subcategories: Array.isArray(category?.subcategories) ? category.subcategories : [],
    }));

    // Helper pour fusionner les infos du package local avec le prix Stripe
    const hydratePackage = async (storePackage, fallbackId, subNode = null) => {
        const stripePriceObj = storePackage.price_id ? stripePriceMap.get(storePackage.price_id) : null;
        
        // Si trouvé dans Stripe : conversion centimes -> euros (/ 100), sinon fallback sur displayed_price local
        const displayedPrice = stripePriceObj
            ? (Number(stripePriceObj.unit_amount) || 0) / 100
            : (storePackage.displayed_price ?? storePackage.displayedPrice ?? 0);

        const currency = String(stripePriceObj?.currency || storePackage.currency || storeState.catalog.currency || 'EUR').toUpperCase();

        return {
            ...storePackage,
            id: ensureNumericId(storePackage?.id, fallbackId),
            displayed_price: displayedPrice,
            currency: currency,
            categoryId: storePackage.categoryId,
            categoryName: storePackage.categoryName,
            subcategoryId: subNode ? subNode.__path[subNode.__path.length - 1] : null,
            subcategoryName: subNode ? (subNode.name || null) : null,
            subcategoryPath: subNode ? subNode.__path : [],
            sanitizedDescription: await loadPackageDescription(storePackage.description),
        };
    };

    storeState.packages = (await Promise.all(storeState.categories.map(async (category, categoryIndex) => {
        const fromTop = Array.isArray(category.packages) ? await Promise.all(category.packages.map(async (storePackage, packageIndex) => {
            const fallbackId = ((categoryIndex + 1) * 1000) + packageIndex + 1;
            return hydratePackage({ ...storePackage, categoryId: category.id, categoryName: category.name }, fallbackId);
        })) : [];

        const fromSubs = (await Promise.all(walkSubcategories(category.subcategories).map(async (subNode) => Array.isArray(subNode.packages) ? Promise.all(subNode.packages.map(async (storePackage, packageIndex) => {
            const fallbackId = ((categoryIndex + 1) * 1000) + (subNode.__path.join('-').length) + packageIndex + 1;
            return hydratePackage({ ...storePackage, categoryId: category.id, categoryName: category.name }, fallbackId, subNode);
        })) : []))).flat();

        return [...fromTop, ...fromSubs];
    }))).flat();

    storeState.packageMap = new Map(storeState.packages.map(storePackage => [Number(storePackage.id), storePackage]));
    storeState.activeCategoryId = getCategoryPreference();

    renderStateMessage(storeState.packages.length ? `Loaded ${storeState.categories.length} categories and ${storeState.packages.length} packages.` : 'No packages were returned by the catalog.');
}

export function getPackagePaymentLink(packageId) {
    const storePackage = storeState.packageMap.get(Number(packageId));
    return String(storePackage?.paymentLink || storePackage?.payment_link || storeState.catalog?.paymentLink || '').trim();
}