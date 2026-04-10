const { trimAndMinifyHTML, escapeHtml } = globalThis;

import {
    BASKET_TOOL_CONFIG,
    basketItems,
    basketQuantityForPackage,
    basketSummarySubtotal,
    basketSummaryTax,
    basketSummaryTotal,
    basketTotalItems,
    basketItemName,
    basketItemPackageId,
    basketItemQuantity,
    basketItemUnitPrice,
    filteredPackages,
    formatCurrency,
    formatDefaultTitle,
    getPackageImageIndex,
    getStoredBasketTool,
    packageImages,
    sanitizeHtml,
    setPackageImageIndex,
    storeState,
} from './shared.js';

const basketToolStatuses = new Map();

function basketToolId(kind) {
    if (kind === 'coupon') return 'coupon-form';
    if (kind === 'giftcard') return 'giftcard-form';
    if (kind === 'creator') return 'creator-code-form';
    return '';
}

function updateBasketToolStatusClasses() {
    for (const kind of BASKET_TOOL_CONFIG ? Object.keys(BASKET_TOOL_CONFIG) : []) {
        const element = document.getElementById(basketToolId(kind));
        if (!element) continue;

        element.classList.remove('is-success', 'is-error');
        const status = basketToolStatuses.get(kind);
        if (status === 'success') element.classList.add('is-success');
        else if (status === 'error') element.classList.add('is-error');
    }
}

export function setBasketToolStatus(kind, status) {
    if (!kind) return;

    if (!status) basketToolStatuses.delete(kind);
    else basketToolStatuses.set(kind, status);

    updateBasketToolStatusClasses();
}

function renderBasketToolValue(kind) {
    const config = BASKET_TOOL_CONFIG[kind];
    if (!config) return '';

    return escapeHtml(getStoredBasketTool(config.storageKey));
}

export function ensureStoreShell() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('store-shell')) return;

    main.innerHTML = trimAndMinifyHTML(`
        <section class="store-shell" id="store-shell">
            <aside class="store-sidebar">
                <div class="store-panel">
                    <div class="store-panel-head">
                        <h2 data-i18n="store.categories">Categories</h2>
                    </div>
                    <div id="store-categories" class="store-category-list"></div>
                </div>
            </aside>

            <section class="store-content">
                <div id="projects-grid" class="articles-grid"></div>
            </section>

            <aside class="store-basket">
                <div class="store-panel">
                    <div class="store-panel-head">
                        <h2 data-i18n="store.basket">Basket</h2>
                        <span id="basket-item-count"></span>
                    </div>
                    <div id="basket-summary"></div>
                    <div>
                        <div id="coupon-form" class="store-basket-tool" data-kind="coupon" data-auto-apply="true">
                            <label aria-label="Coupon code"><i class="fa-solid fa-ticket" aria-hidden="true"></i><span class="sr-only" data-i18n="store.coupon">Coupon code</span><input name="code" type="text" autocomplete="off" placeholder="SUMMER10" value="${renderBasketToolValue('coupon')}"></label>
                        </div>
                        <div id="giftcard-form" class="store-basket-tool" data-kind="giftcard" data-auto-apply="true">
                            <label aria-label="Gift card"><i class="fa-solid fa-gift" aria-hidden="true"></i><span class="sr-only" data-i18n="store.giftcard">Gift card</span><input name="code" type="text" autocomplete="off" placeholder="0127 0244 7210 1111" value="${renderBasketToolValue('giftcard')}"></label>
                        </div>
                        <div id="creator-code-form" class="store-basket-tool" data-kind="creator" data-auto-apply="true">
                            <label aria-label="Creator code"><i class="fa-solid fa-hashtag" aria-hidden="true"></i><span class="sr-only" data-i18n="store.creator_code">Creator code</span><input name="code" type="text" autocomplete="off" placeholder="NIWER" value="${renderBasketToolValue('creator')}"></label>
                        </div>
                    </div>
                    <div id="basket-items" class="store-basket-items"></div>
                    <button id="checkout-button" type="button" data-tone="primary" data-size="full" data-action="checkout" data-i18n="btn.checkout">Checkout</button>
                </div>
            </aside>
        </section>
    `);
}

export function renderStateMessage(message, isError = false) {
    const status = document.getElementById('store-connection-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'ready';
}

export function renderStoreHeader() {
    const basketCount = document.getElementById('basket-item-count');
    if (basketCount) basketCount.textContent = `${basketTotalItems()} items`;
}

export function renderCategoryButtons() {
    const container = document.getElementById('store-categories');
    if (!container) return;

    container.innerHTML = trimAndMinifyHTML([
        `<button type="button"${storeState.activeCategoryId === 'all' ? ' class="is-active"' : ''} data-action="select-category" data-category-id="all" data-i18n="store.all_categories">All categories</button>`,
        ...storeState.categories.map(category => {
            const packageCount = Array.isArray(category.packages) ? category.packages.length : 0;
            return `<button type="button"${String(category.id) === String(storeState.activeCategoryId) ? ' class="is-active"' : ''} data-action="select-category" data-category-id="${escapeHtml(category.id)}"><span>${escapeHtml(category.name || 'Category')}</span><small>${packageCount}</small></button>`;
        }),
    ].join(''));
}

export function renderPackages() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const packages = filteredPackages();
    if (!packages.length) {
        grid.innerHTML = trimAndMinifyHTML(`
            <article class="store-empty-card">
                <header><h2 data-i18n="store.no_packages">No packages available</h2></header>
                <p data-i18n="store.no_packages_copy">Try another category or come back later.</p>
            </article>
        `);
        return;
    }

    grid.innerHTML = trimAndMinifyHTML(packages.map(storePackage => {
        const price = formatCurrency(storePackage.total_price ?? storePackage.base_price, storePackage.currency);
        const tags = [storePackage.type ? String(storePackage.type).replace(/_/g, ' ') : null, storePackage.disable_quantity ? 'single quantity' : null, storePackage.disable_gifting ? 'gifting disabled' : null].filter(Boolean);
        const description = sanitizeHtml(storePackage.description) || '<p>No description available.</p>';
        const quantityInBasket = basketQuantityForPackage(storePackage.id);
        const images = packageImages(storePackage);
        const activeImageIndex = getPackageImageIndex(storePackage.id, images.length);
        const activeImage = images[activeImageIndex] || '';

        return `
            <article class="store-package-card" data-package-id="${escapeHtml(storePackage.id)}">
                <header class="store-package-header">
                    <div>
                        <h2>${escapeHtml(storePackage.name || formatDefaultTitle(storePackage.slug || 'Package'))}</h2>
                    </div>
                    <div class="store-price">${escapeHtml(price)}</div>
                </header>
                ${activeImage ? `
                    <div class="store-image-carousel" data-package-carousel="${escapeHtml(storePackage.id)}" data-image-count="${images.length}">
                        <img src="${escapeHtml(activeImage)}" alt="${escapeHtml(storePackage.name || 'Package')}" loading="lazy" draggable="false">
                        <button type="button" class="store-carousel-button open icon-button" data-action="package-image-open" data-package-id="${escapeHtml(storePackage.id)}" aria-label="Open image full size" title="Open image full size">&#128443;</button>
                        ${images.length > 1 ? `
                            <div class="store-carousel-dots" aria-hidden="true">
                                ${images.map((_, index) => `<button type="button" class="store-carousel-dot${index === activeImageIndex ? ' is-active' : ''}" data-action="package-image-dot" data-package-id="${escapeHtml(storePackage.id)}" data-image-index="${index}" aria-label="Go to image ${index + 1}"></button>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="store-package-description">${description}</div>
                ${tags.length ? `<div class="store-badges">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                <footer>
                    <button type="button" data-tone="primary" data-action="add-package" data-package-id="${escapeHtml(storePackage.id)}" data-i18n="btn.add_to_basket">Add to basket</button>
                    ${quantityInBasket ? `<span class="store-in-basket-count">${escapeHtml(quantityInBasket)} in basket</span>` : ''}
                </footer>
            </article>
        `;
    }).join(''));
}

export function renderBasketSummary() {
    const summary = document.getElementById('basket-summary');
    if (!summary) return;

    const basket = storeState.basket;
    if (!basket) {
        summary.innerHTML = `<p data-i18n="store.basket_loading">Loading basket...</p>`;
        return;
    }

    const currency = basket.currency || 'USD';
    const subtotal = basketSummarySubtotal();
    const tax = basketSummaryTax(subtotal);
    const total = basketSummaryTotal(subtotal, tax);
    summary.innerHTML = trimAndMinifyHTML(`
        <div class="store-summary-grid">
            <div><span data-i18n="store.subtotal">Subtotal</span><strong>${escapeHtml(formatCurrency(subtotal, currency))}</strong></div>
            <div><span data-i18n="store.tax">Tax</span><strong>${escapeHtml(formatCurrency(tax, currency))}</strong></div>
            <div><span data-i18n="store.total">Total</span><strong>${escapeHtml(formatCurrency(total, currency))}</strong></div>
        </div>
        <div class="store-summary-meta"><span>${escapeHtml(currency)}</span><span>${basket.complete ? 'Completed' : 'Active'}</span></div>
    `);
}

export function renderBasketItems() {
    const container = document.getElementById('basket-items');
    const checkoutButton = document.getElementById('checkout-button');
    if (!container || !checkoutButton) return;

    const items = basketItems();
    checkoutButton.disabled = !items.length;

    if (!items.length) {
        container.innerHTML = trimAndMinifyHTML(`
            <article class="store-empty-card">
                <header><h2 data-i18n="store.empty_basket">Basket is empty</h2></header>
            </article>
        `);
        return;
    }

    container.innerHTML = trimAndMinifyHTML(items.map(item => {
        const packageId = basketItemPackageId(item);
        const quantity = basketItemQuantity(item);
        const price = formatCurrency(basketItemUnitPrice(item), storeState.basket?.currency);

        return `
            <article class="store-basket-item" data-package-id="${escapeHtml(packageId)}">
                <div class="store-basket-item-head">
                    <div class="store-basket-item-info">
                        <h3>${escapeHtml(basketItemName(item))}</h3>
                        <p>${escapeHtml(quantity)} x ${escapeHtml(price)}</p>
                    </div>
                    <button type="button" class="icon-button" data-action="remove-package" data-package-id="${escapeHtml(packageId)}" aria-label="Remove" title="Remove">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="store-basket-item-actions">
                    <div class="store-basket-quantity-row">
                        <span class="store-basket-quantity-label"><i class="fa-solid fa-list-ol" aria-hidden="true"></i><span data-i18n="store.quantity">Quantity</span></span>
                        <div class="store-basket-quantity-actions" aria-label="Quantity actions">
                            <button type="button" data-tone="secondary" data-action="decrease-package" data-package-id="${escapeHtml(packageId)}" data-quantity="${quantity}" data-i18n="btn.decrease" aria-label="Decrease quantity">-</button>
                            <span class="store-basket-quantity-value" aria-live="polite">${escapeHtml(quantity)}</span>
                            <button type="button" data-tone="secondary" data-action="increase-package" data-package-id="${escapeHtml(packageId)}" data-i18n="btn.increase" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join(''));
}

export function renderStore() {
    renderStoreHeader();
    renderCategoryButtons();
    renderPackages();
    renderBasketSummary();
    renderBasketItems();
    updateBasketToolStatusClasses();
}