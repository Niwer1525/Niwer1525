import {
    getPackageImageIndex,
    packageImages,
    setCategoryPreference,
    setPackageImageIndex,
    storeState,
} from './shared.js';

import { loadStorePackages } from './api.js';
import { ensureStoreShell, renderPackages, renderStore } from './render.js';

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

function resolvePackage(packageId, packageSlug) {
    const slug = String(packageSlug || '').trim();
    if (slug) {
        const bySlug = storeState.packages.find(item => String(item.slug || '') === slug);
        if (bySlug) return bySlug;
    }

    return storeState.packageMap.get(Number(packageId)) || null;
}

const actionHandlers = {
    'select-category': ({ categoryId, subcategoryId }) => {
        if (!categoryId || String(categoryId) === 'all') return setActiveCategory('all');
        const composite = subcategoryId ? `${categoryId}/${subcategoryId}` : String(categoryId);
        return setActiveCategory(composite);
    },
    'jump-to-category': ({ categoryId }) => setActiveCategory(categoryId, true),
    'open-package-payment': ({ paymentLink }) => {
        const link = String(paymentLink || '').trim();
        if (!link) {
            createNotification('Payment link is not available for this package.');
            return;
        }

        window.open(link, '_blank', 'noopener');
    },
    'package-image-dot': ({ packageId, packageSlug, imageIndex }) => {
        if (!packageId) return;

        const index = Number(imageIndex);
        if (!Number.isInteger(index)) return;

        const packageItem = resolvePackage(packageId, packageSlug);
        if (!packageItem) return;

        setPackageImageIndex(packageItem.id, index);
        renderPackages();
    },
    'package-image-open': ({ packageId, packageSlug }) => {
        if (!packageId) return;

        const packageItem = resolvePackage(packageId, packageSlug);
        const images = packageItem ? packageImages(packageItem) : [];
        const imageUrl = images.length ? images[getPackageImageIndex(packageItem.id, images.length)] : '';
        if (imageUrl) openStoreImagePopup(imageUrl, packageItem?.name || 'Package');
    },
    'package-image-prev': ({ packageId, packageSlug }) => {
        if (!packageId) return;
        const packageItem = resolvePackage(packageId, packageSlug);
        const images = packageItem ? packageImages(packageItem) : [];
        if (!images.length) return;
        const current = getPackageImageIndex(packageItem.id, images.length);
        const next = (current - 1 + images.length) % images.length;
        setPackageImageIndex(packageItem.id, next);
        renderPackages();
    },
    'package-image-next': ({ packageId, packageSlug }) => {
        if (!packageId) return;
        const packageItem = resolvePackage(packageId, packageSlug);
        const images = packageItem ? packageImages(packageItem) : [];
        if (!images.length) return;
        const current = getPackageImageIndex(packageItem.id, images.length);
        const next = (current + 1) % images.length;
        setPackageImageIndex(packageItem.id, next);
        renderPackages();
    },
};

export function handleStoreClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const handler = actionHandlers[button.dataset.action];
    if (handler) return handler(button.dataset, button);
}

export function handleStoreInput() { /* no-op: basket removed */ }

export async function bootstrapStore() {
    ensureStoreShell();
    renderStore();

    try {
        await loadStorePackages();
        renderStore();
        await applyLanguage(document.querySelector('main') || document);
        storeState.loading = false;
    } catch (error) {
        storeState.error = error;
        const grid = document.getElementById('projects-grid');
        if (grid) {
            grid.innerHTML = `<article class="store-empty-card"><header><h2 data-i18n="store.load_failed">Store could not be loaded</h2></header><p>${error.message || 'The store service request failed.'}</p></article>`;
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
