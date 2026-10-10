import { STORE_CATALOG_URL, STRIPE_DATA_URL, getCategoryPreference, storeState } from './shared.js';
import { renderStateMessage } from './render.js';

export function unwrapApiData(payload) {
    if (!payload) return null;
    return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

function ensureNumericId(value, fallbackId) {
    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue) && parsedValue > 0) return parsedValue;
    return fallbackId;
}

// Recursively walks the category tree to extract all subnodes with their full path
function collectAllSubcategories(subcategories, parentPath = []) {
    if (!Array.isArray(subcategories)) return [];
    return subcategories.flatMap((sub, idx) => {
        const id = String(sub.id ?? sub.slug ?? (idx + 1));
        const path = [...parentPath, id];
        return [
            { ...sub, __path: path },
            ...collectAllSubcategories(sub.subcategories, path)
        ];
    });
}

export async function loadStorePackages() {
    const [catalogResponse, stripeResponse] = await Promise.all([
        fetch(STORE_CATALOG_URL, { cache: 'no-store' }),
        fetch(STRIPE_DATA_URL, { cache: 'no-store' }).catch(() => null)
    ]);

    if (!catalogResponse.ok) throw new Error(`Could not load store catalog (${catalogResponse.status}).`);

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

    storeState.categories = categories;

    // Grab pre-rendered descriptions already in the DOM
    const existingDomDescriptions = new Map();
    document.querySelectorAll('.store-package-card').forEach(card => {
        const id = Number(card.dataset.packageId);
        const descEl = card.querySelector('.store-package-description');
        if (id && descEl) existingDomDescriptions.set(id, descEl.innerHTML);
    });

    const hydratePackage = (storePackage, category, subNode = null, fallbackId = 1) => {
        const stripePriceObj = storePackage.price_id ? stripePriceMap.get(storePackage.price_id) : null;
        
        const displayedPrice = stripePriceObj
            ? (Number(stripePriceObj.unit_amount) || 0) / 100
            : (storePackage.displayed_price ?? storePackage.displayedPrice ?? storePackage.price ?? 0);

        const currency = String(stripePriceObj?.currency || storePackage.currency || storeState.catalog.currency || 'EUR').toUpperCase();
        const pkgId = ensureNumericId(storePackage?.id, fallbackId);
        const subPath = subNode ? subNode.__path.map(String) : [];

        return {
            ...storePackage,
            id: pkgId,
            displayed_price: displayedPrice,
            currency: currency,
            categoryId: String(category.id ?? category.slug),
            categoryName: category.name,
            subcategoryId: subPath.length ? subPath[subPath.length - 1] : null,
            subcategoryName: subNode ? subNode.name : null,
            subcategoryPath: subPath,
            sanitizedDescription: existingDomDescriptions.get(pkgId) || '<p>Description unavailable.</p>',
            paymentLink: storePackage.paymentLink || storePackage.payment_link || storeState.catalog.paymentLink || ''
        };
    };

    // Flatten all packages across all nested levels
    const flattened = [];
    categories.forEach((cat, catIdx) => {
        // Direct packages in category
        if (Array.isArray(cat.packages)) {
            cat.packages.forEach((pkg, pkgIdx) => {
                flattened.push(hydratePackage(pkg, cat, null, (catIdx + 1) * 1000 + pkgIdx + 1));
            });
        }

        // Packages in subcategories (and nested sub-subcategories)
        const subNodes = collectAllSubcategories(cat.subcategories);
        subNodes.forEach((subNode, subIdx) => {
            if (Array.isArray(subNode.packages)) {
                subNode.packages.forEach((pkg, pkgIdx) => {
                    flattened.push(hydratePackage(pkg, cat, subNode, (catIdx + 1) * 10000 + (subIdx + 1) * 100 + pkgIdx + 1));
                });
            }
        });
    });

    storeState.packages = flattened;
    storeState.packageMap = new Map(storeState.packages.map(p => [Number(p.id), p]));
    storeState.activeCategoryId = getCategoryPreference();

    renderStateMessage(storeState.packages.length ? `Loaded ${storeState.categories.length} categories and ${storeState.packages.length} packages.` : 'No packages found.');
}