import {
    BASKET_TOOL_CONFIG,
    TEBEX_API_BASE,
    TEBEX_PUBLIC_KEY,
    basketHasTool,
    basketItemPackageId,
    basketItemQuantity,
    basketItems,
    getBasketIdent,
    getCategoryPreference,
    getStoredBasketTool,
    setBasketIdent,
    storeState,
} from './shared.js';

import { renderStateMessage, renderStore } from './render.js';

export function unwrapApiData(payload) {
    if (!payload) return null;
    return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

export async function fetchTebex(path, options = {}) {
    const response = await fetch(`${TEBEX_API_BASE}${path}`, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        ...options,
    });

    if (!response.ok) throw new Error(`Tebex request failed (${response.status})`);
    if (response.status === 204) return null;

    const text = await response.text();
    return text ? unwrapApiData(JSON.parse(text)) : null;
}

export async function loadStorePackages() {
    const categories = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/categories?includePackages=1`);
    storeState.categories = Array.isArray(categories) ? categories : [];
    storeState.packages = storeState.categories.flatMap(category => Array.isArray(category.packages)
        ? category.packages.map(storePackage => ({ ...storePackage, categoryId: category.id, categoryName: category.name }))
        : []);
    storeState.packageMap = new Map(storeState.packages.map(storePackage => [Number(storePackage.id), storePackage]));
    storeState.activeCategoryId = getCategoryPreference();

    if (storeState.activeCategoryId !== 'all' && !storeState.categories.some(category => String(category.id) === String(storeState.activeCategoryId))) {
        storeState.activeCategoryId = 'all';
    }

    renderStateMessage(storeState.packages.length
        ? `Loaded ${storeState.categories.length} categories and ${storeState.packages.length} packages.`
        : 'No Tebex packages were returned by the store.');
}

export async function loadBasket() {
    const basketIdent = getBasketIdent();

    if (basketIdent) {
        try {
            const basket = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${basketIdent}`);
            if (basket?.complete) setBasketIdent(null);
            else if (basket) {
                storeState.basket = basket;
                return;
            }
        } catch (error) {
            console.warn('Stored basket could not be restored, creating a new basket.', error);
            setBasketIdent(null);
        }
    }

    const basket = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets`, {
        method: 'POST',
        body: JSON.stringify({ complete_url: window.location.href.split('#')[0], cancel_url: window.location.href.split('#')[0], complete_auto_redirect: true, custom: { source: 'portfolio-store' } }),
    });

    storeState.basket = basket;
    setBasketIdent(basket?.ident || null);
}

export async function syncBasket() {
    if (!storeState.basket?.ident) return;

    const basket = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${storeState.basket.ident}`);
    storeState.basket = basket;
    if (basket?.complete) setBasketIdent(null);
}

export async function addPackageToBasket(packageId, quantity = 1) {
    if (!storeState.basket?.ident) return;

    await fetchTebex(`/baskets/${storeState.basket.ident}/packages`, {
        method: 'POST',
        body: JSON.stringify({ package_id: Number(packageId), quantity: Number(quantity) || 1 }),
    });

    await syncBasket();
    renderStore();
}

export async function removePackageFromBasket(packageId) {
    if (!storeState.basket?.ident) return;

    await fetchTebex(`/baskets/${storeState.basket.ident}/packages/remove`, {
        method: 'POST',
        body: JSON.stringify({ package_id: Number(packageId) }),
    });

    await syncBasket();
    renderStore();
}

export async function updatePackageQuantity(packageId, nextQuantity) {
    const quantity = Number(nextQuantity) || 1;
    const item = basketItems().find(entry => basketItemPackageId(entry) === Number(packageId));
    const currentQuantity = basketItemQuantity(item);

    if (!item) return;
    if (quantity <= 0) return removePackageFromBasket(packageId);
    if (quantity === currentQuantity) return;

    await removePackageFromBasket(packageId);
    await addPackageToBasket(packageId, quantity);
}

export async function applyBasketValue(kind, value) {
    const config = BASKET_TOOL_CONFIG[kind];
    if (!storeState.basket?.ident || !config) return;

    const normalizedValue = String(value || '').trim();
    if (!normalizedValue) return;

    await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${storeState.basket.ident}/${config.endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ [config.payloadKey]: normalizedValue }),
    });

    await syncBasket();
    renderStore();
}

export async function applyStoredBasketTools() {
    if (!storeState.basket?.ident) return;

    for (const [kind, config] of Object.entries(BASKET_TOOL_CONFIG)) {
        const storedValue = getStoredBasketTool(config.storageKey);
        if (!storedValue || basketHasTool(storeState.basket, kind, storedValue)) continue;

        try {
            await applyBasketValue(kind, storedValue);
        } catch (error) {
            console.warn(`Unable to auto-apply ${config.label}:`, error);
        }
    }
}