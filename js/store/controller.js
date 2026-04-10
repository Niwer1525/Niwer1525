import {
    BASKET_TOOL_DEBOUNCE_MS,
    QUANTITY_DEBOUNCE_MS,
    basketHasTool,
    basketToolTimers,
    getBasketToolConfig,
    getPackageImageIndex,
    packageImages,
    quantityTimers,
    setCategoryPreference,
    setPackageImageIndex,
    setStoredBasketTool,
    storeState,
} from './shared.js';

import { applyBasketValue, applyStoredBasketTools, addPackageToBasket, loadBasket, loadStorePackages, removePackageFromBasket, updatePackageQuantity } from './api.js';
import { ensureStoreShell, renderPackages, renderStore, setBasketToolStatus } from './render.js';

const { createNotification, applyLanguage } = globalThis;
const STORE_IMAGE_POPUP_ID = 'store-image-popup';
const STORE_IMAGE_POPUP_CLOSE_ACTION = 'close-store-image-popup';

function setActiveCategory(categoryId, shouldScroll = false) {
    storeState.activeCategoryId = String(categoryId || 'all');
    setCategoryPreference(storeState.activeCategoryId);
    renderStore();
    if (shouldScroll) document.getElementById('projects-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeStoreImagePopup() {
    const popup = document.getElementById(STORE_IMAGE_POPUP_ID);
    if (!popup) return;

    popup.hidden = true;
    popup.dataset.open = 'false';
    document.body.classList.remove('has-store-image-popup');
}

function ensureStoreImagePopup() {
    let popup = document.getElementById(STORE_IMAGE_POPUP_ID);
    if (popup) return popup;

    popup = document.createElement('div');
    popup.id = STORE_IMAGE_POPUP_ID;
    popup.className = 'store-image-popup';
    popup.hidden = true;
    popup.innerHTML = `
        <div class="store-image-popup-backdrop" data-action="${STORE_IMAGE_POPUP_CLOSE_ACTION}" aria-hidden="true"></div>
        <div class="store-image-popup-panel" role="dialog" aria-modal="true" aria-label="Package image preview">
            <button type="button" class="icon-button store-image-popup-close" data-action="${STORE_IMAGE_POPUP_CLOSE_ACTION}" aria-label="Close image preview">&times;</button>
            <img class="store-image-popup-image" alt="" draggable="false">
        </div>
    `;

    popup.addEventListener('click', event => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) {
            if (event.target === popup) closeStoreImagePopup();
            return;
        }

        if (actionButton.dataset.action === STORE_IMAGE_POPUP_CLOSE_ACTION) closeStoreImagePopup();
    });

    document.body.appendChild(popup);
    return popup;
}

function openStoreImagePopup(imageUrl, altText) {
    if (!imageUrl) return;

    const popup = ensureStoreImagePopup();
    const image = popup.querySelector('.store-image-popup-image');
    if (!(image instanceof HTMLImageElement)) return;

    image.src = imageUrl;
    image.alt = altText || 'Package image';
    popup.hidden = false;
    popup.dataset.open = 'true';
    document.body.classList.add('has-store-image-popup');
    requestAnimationFrame(() => popup.querySelector('.store-image-popup-close')?.focus());
}

export function scheduleBasketToolAutoApply(form) {
    if (!(form instanceof HTMLElement)) return;

    const kind = form.dataset.kind;
    const config = getBasketToolConfig(kind);
    const input = form.querySelector('input[name="code"]');
    if (!kind || !config || !(input instanceof HTMLInputElement)) return;

    const normalizedValue = input.value.trim();
    setStoredBasketTool(config.storageKey, normalizedValue);
    if (!normalizedValue) {
        if (basketToolTimers.has(kind)) {
            clearTimeout(basketToolTimers.get(kind));
            basketToolTimers.delete(kind);
        }

        setBasketToolStatus(kind, null);

        if (kind === 'coupon' && storeState.basket?.ident) {
            void applyBasketValue(kind, '').catch(error => {
                setBasketToolStatus(kind, 'error');
                console.warn(`Unable to clear ${config.label}:`, error);
            });
        }

        return;
    }

    if (basketToolTimers.has(kind)) clearTimeout(basketToolTimers.get(kind));

    basketToolTimers.set(kind, setTimeout(async () => {
        basketToolTimers.delete(kind);
        if (!storeState.basket?.ident || !normalizedValue || basketHasTool(storeState.basket, kind, normalizedValue)) return;

        try {
            await applyBasketValue(kind, normalizedValue);
        } catch (error) {
            setBasketToolStatus(kind, 'error');
            console.warn(`Unable to auto-apply ${config.label}:`, error);
        }
    }, BASKET_TOOL_DEBOUNCE_MS));
}

export function scheduleBasketQuantityAutoUpdate(input) {
    if (!(input instanceof HTMLInputElement)) return;

    const packageId = Number(input.dataset.quantityInput);
    if (!packageId) return;

    if (quantityTimers.has(packageId)) clearTimeout(quantityTimers.get(packageId));

    quantityTimers.set(packageId, setTimeout(async () => {
        quantityTimers.delete(packageId);
        await updatePackageQuantity(packageId, Number(input.value || 1));
    }, QUANTITY_DEBOUNCE_MS));
}

function openCheckout() {
    const checkoutUrl = storeState.basket?.links?.checkout;
    if (!checkoutUrl) {
        createNotification('Checkout is not available yet.');
        return;
    }

    window.location.href = checkoutUrl;
}

export function handleStoreClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const { action, packageId, categoryId } = button.dataset;

    if (action === 'select-category') return setActiveCategory(categoryId);
    if (action === 'jump-to-category') return setActiveCategory(categoryId, true);
    if (action === 'add-package' && packageId) return addPackageToBasket(packageId, 1).catch(error => createNotification(error.message || 'Could not add package to basket.'));

    if (action === 'package-image-dot' && packageId) {
        const imageIndex = Number(button.dataset.imageIndex);
        if (Number.isInteger(imageIndex)) {
            setPackageImageIndex(packageId, imageIndex);
            renderPackages();
        }
        return;
    }

    if (action === 'package-image-open' && packageId) {
        const packageItem = storeState.packageMap.get(Number(packageId));
        const images = packageItem ? packageImages(packageItem) : [];
        const imageUrl = images.length ? images[getPackageImageIndex(packageId, images.length)] : '';
        if (imageUrl) openStoreImagePopup(imageUrl, packageItem?.name || 'Package');
        return;
    }

    if (action === 'remove-package' && packageId) return removePackageFromBasket(packageId).catch(error => createNotification(error.message || 'Could not remove package from basket.'));
    if (action === 'increase-package' && packageId) return addPackageToBasket(packageId, 1).catch(error => createNotification(error.message || 'Could not update basket.'));
    if (action === 'decrease-package' && packageId) return updatePackageQuantity(packageId, Number(button.dataset.quantity || 1) - 1).catch(error => createNotification(error.message || 'Could not update basket.'));
    if (action === 'checkout') openCheckout();
}

export function handleStoreInput(event) {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.matches('[data-quantity-input]')) scheduleBasketQuantityAutoUpdate(target);

    if (!(target instanceof HTMLInputElement)) return;

    const storeTool = target.closest('[data-auto-apply][data-kind]');
    if (!storeTool) return;

    if (!['coupon-form', 'giftcard-form', 'creator-code-form'].includes(storeTool.id)) return;
    scheduleBasketToolAutoApply(storeTool);
}

export async function bootstrapStore() {
    ensureStoreShell();
    renderStore();

    try {
        await Promise.all([loadStorePackages(), loadBasket()]);
        await applyStoredBasketTools();
        renderStore();
        await applyLanguage(document.querySelector('main') || document);
        storeState.loading = false;
    } catch (error) {
        storeState.error = error;
        const grid = document.getElementById('projects-grid');
        if (grid) {
            grid.innerHTML = `<article class="store-empty-card"><header><h2 data-i18n="store.load_failed">Store could not be loaded</h2></header><p>${error.message || 'The Tebex API request failed.'}</p></article>`;
            await applyLanguage(grid);
        }
    }
}

/* Update the content */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrapStore, { once: true });
else bootstrapStore();

document.addEventListener('click', handleStoreClick);
document.addEventListener('input', handleStoreInput);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeStoreImagePopup(); });
window.addEventListener('beforeunload', () => { if (storeState.activeCategoryId) setCategoryPreference(storeState.activeCategoryId); });