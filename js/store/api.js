import {
    BASKET_TOOL_CONFIG,
    TEBEX_API_BASE,
    TEBEX_PUBLIC_KEY,
    basketHasTool,
    basketItemPackageId,
    basketItemQuantity,
    basketItems,
    basketLineItems,
    getBasketIdent,
    getBasketToolAppliedValue,
    getCategoryPreference,
    getStoredBasketTool,
    sanitizeHtml,
    setBasketIdent,
    setBasketToolAppliedValue,
    storeState,
} from './shared.js';

import { renderBasketState, renderStateMessage, setBasketToolStatus } from './render.js';

let basketMutationQueue = Promise.resolve();

function enqueueBasketMutation(operation) {
    const result = basketMutationQueue.then(operation, operation);
    basketMutationQueue = result.then(() => undefined, () => undefined);
    return result;
}

export function waitForBasketMutations() {
    return basketMutationQueue;
}

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

    if (!response.ok) {
        const errorText = await response.text();
        let errorDetail = '';

        if (errorText) {
            try {
                const errorPayload = JSON.parse(errorText);
                const payload = unwrapApiData(errorPayload);
                errorDetail = typeof payload === 'string' ? payload : payload?.message || payload?.error || payload?.detail || payload?.title || errorText;
            } catch {
                errorDetail = errorText;
            }
        }

        const suffix = errorDetail ? `: ${errorDetail}` : '';
        throw new Error(`Tebex request failed (${response.status})${suffix}`);
    }
    if (response.status === 204) return null;

    const text = await response.text();
    return text ? unwrapApiData(JSON.parse(text)) : null;
}

function updateBasketState(basket) {
    if (basket && typeof basket === 'object') storeState.basket = basket;
}

async function commitBasketResponse(basket, refresh = true) {
    const currentBasket = storeState.basket;
    const currentItemCount = basketLineItems(currentBasket).length;
    const nextItemCount = basketLineItems(basket).length;

    if (basket && currentItemCount > 0 && nextItemCount === 0) {
        try {
            const syncedBasket = await syncBasket();
            updateBasketState(syncedBasket || basket);
        } catch (error) {
            console.warn('Basket response dropped line items; using the mutation response.', error);
            updateBasketState(basket);
        }
    } else if (basket) {
        updateBasketState(basket);
    } else {
        await syncBasket();
    }

    if (refresh) renderBasketState();
}

export async function loadStorePackages() {
    const categories = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/categories?includePackages=1`);
    storeState.categories = Array.isArray(categories) ? categories : [];
    storeState.packages = storeState.categories.flatMap(category => Array.isArray(category.packages)
        ? category.packages.map(storePackage => ({
            ...storePackage,
            categoryId: category.id,
            categoryName: category.name,
            sanitizedDescription: sanitizeHtml(storePackage.description) || '<p>No description available.</p>',
        }))
        : []);
    storeState.packageMap = new Map(storeState.packages.map(storePackage => [Number(storePackage.id), storePackage]));
    storeState.activeCategoryId = getCategoryPreference();

    if (storeState.activeCategoryId !== 'all' && !storeState.categories.some(category => String(category.id) === String(storeState.activeCategoryId))) storeState.activeCategoryId = 'all';

    renderStateMessage(storeState.packages.length ? `Loaded ${storeState.categories.length} categories and ${storeState.packages.length} packages.` : 'No Tebex packages were returned by the store.');
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

    return basket;
}

async function addPackageToBasketNow(packageId, quantity = 1) {
    if (!storeState.basket?.ident) return;

    const basket = await fetchTebex(`/baskets/${storeState.basket.ident}/packages`, {
        method: 'POST',
        body: JSON.stringify({ package_id: Number(packageId), quantity: Number(quantity) || 1 }),
    });

    await commitBasketResponse(basket);

    await applyStoredBasketToolsNow();
}

export function addPackageToBasket(packageId, quantity = 1) {
    return enqueueBasketMutation(() => addPackageToBasketNow(packageId, quantity));
}

async function removePackageFromBasketNow(packageId, { refresh = true } = {}) {
    if (!storeState.basket?.ident) return;

    try {
        const basket = await fetchTebex(`/baskets/${storeState.basket.ident}/packages/remove`, {
            method: 'POST',
            body: JSON.stringify({ package_id: Number(packageId) }),
        });

        await commitBasketResponse(basket, refresh);
    } catch (error) {
        const message = String(error?.message || '');
        if (message.includes('(400)') || message.includes('(404)')) {
            await syncBasket();
            if (refresh) renderBasketState();
            return;
        }

        throw error;
    }
}

export function removePackageFromBasket(packageId, { refresh = true } = {}) {
    return enqueueBasketMutation(() => removePackageFromBasketNow(packageId, { refresh }));
}

export function updatePackageQuantity(packageId, nextQuantity) {
    return enqueueBasketMutation(async () => {
        const quantity = Number(nextQuantity) || 1;
        const item = basketItems().find(entry => basketItemPackageId(entry) === Number(packageId));
        const currentQuantity = basketItemQuantity(item);

        if (!item) return;
        if (quantity <= 0) return removePackageFromBasketNow(packageId);
        if (quantity === currentQuantity) return;

        await removePackageFromBasketNow(packageId, { refresh: false });
        await addPackageToBasketNow(packageId, quantity);
    });
}

async function applyBasketValueNow(kind, value) {
    const config = BASKET_TOOL_CONFIG[kind];
    if (!storeState.basket?.ident || !config) return;

    const normalizedValue = String(value || '').trim();
    const appliedValue = getBasketToolAppliedValue(kind);

    if (normalizedValue && appliedValue && appliedValue.toLowerCase() === normalizedValue.toLowerCase()) {
        setBasketToolStatus(kind, 'success');
        return;
    }

    const isClearRequest = !normalizedValue;
    const basketValue = getBasketToolAppliedValue(kind) || (
        config.collectionKey
            ? Array.isArray(storeState.basket?.[config.collectionKey])
                ? storeState.basket[config.collectionKey][0]?.[config.valueKey] || ''
                : ''
            : storeState.basket?.[config.valueKey] || ''
    );
    const endpoint = isClearRequest && config.removeEndpoint ? config.removeEndpoint : config.endpoint;
    const payloadValue = isClearRequest ? basketValue : normalizedValue;
    const payload = payloadValue ? { [config.payloadKey]: payloadValue } : {};

    if (isClearRequest && !basketValue) {
        setBasketToolStatus(kind, null);
        return;
    }

    let basket;
    try {
        basket = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${storeState.basket.ident}/${endpoint}`, {
            method: 'POST',
            body: Object.keys(payload).length ? JSON.stringify(payload) : undefined,
        });
    } catch (error) {
        const message = String(error?.message || '');
        if (message.includes('already applied to your basket')) {
            setBasketToolStatus(kind, 'success');
            return;
        }

        throw error;
    }

    await commitBasketResponse(basket);
    if (normalizedValue) setBasketToolAppliedValue(kind, normalizedValue);
    else setBasketToolAppliedValue(kind, '');
    setBasketToolStatus(kind, normalizedValue ? 'success' : null);
}

export function applyBasketValue(kind, value) {
    return enqueueBasketMutation(() => applyBasketValueNow(kind, value));
}

async function applyStoredBasketToolsNow() {
    if (!storeState.basket?.ident) return;

    for (const [kind, config] of Object.entries(BASKET_TOOL_CONFIG)) {
        const storedValue = getStoredBasketTool(config.storageKey);
        if (!storedValue || basketHasTool(storeState.basket, kind, storedValue)) continue;
        if (config.requiresBasketItems && !basketItems().length) continue;

        try {
            await applyBasketValueNow(kind, storedValue);
        } catch (error) {
            setBasketToolStatus(kind, 'error');
            console.warn(`Unable to auto-apply ${config.label}:`, error);
        }
    }
}

export function applyStoredBasketTools() {
    return enqueueBasketMutation(() => applyStoredBasketToolsNow());
}