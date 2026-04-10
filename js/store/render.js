const { trimAndMinifyHTML, escapeHtml } = globalThis;

import {
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
    packageImages,
    sanitizeHtml,
    setPackageImageIndex,
    storeState,
} from './shared.js';

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
                <div id="projects-grid" class="articles-grid store-grid"></div>
            </section>

            <aside class="store-basket">
                <div class="store-panel">
                    <div class="store-panel-head">
                        <h2 data-i18n="store.basket">Basket</h2>
                        <span id="basket-item-count"></span>
                    </div>
                    <div id="basket-summary" class="store-summary"></div>
                    <div id="basket-items" class="store-basket-items"></div>
                    <div class="store-panel-section">
                        <div class="store-panel-head">
                            <h3 data-i18n="store.checkout_tools">Basket tools</h3>
                        </div>
                        <form id="coupon-form" class="store-form" data-kind="coupon" data-auto-apply="true">
                            <label class="store-inline-field"><span data-i18n="store.coupon">Coupon code</span><input name="code" type="text" autocomplete="off" placeholder="SUMMER10"></label>
                        </form>
                        <form id="giftcard-form" class="store-form" data-kind="giftcard" data-auto-apply="true">
                            <label class="store-inline-field"><span data-i18n="store.giftcard">Gift card</span><input name="code" type="text" autocomplete="off" placeholder="0127 0244 7210 1111"></label>
                        </form>
                        <form id="creator-code-form" class="store-form" data-kind="creator" data-auto-apply="true">
                            <label class="store-inline-field"><span data-i18n="store.creator_code">Creator code</span><input name="code" type="text" autocomplete="off" placeholder="NIWER"></label>
                        </form>
                    </div>
                    <button id="checkout-button" type="button" class="store-checkout-button" data-action="checkout" data-i18n="btn.checkout">Checkout</button>
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
        `<button type="button" class="store-category-button${storeState.activeCategoryId === 'all' ? ' is-active' : ''}" data-action="select-category" data-category-id="all" data-i18n="store.all_categories">All categories</button>`,
        ...storeState.categories.map(category => {
            const packageCount = Array.isArray(category.packages) ? category.packages.length : 0;
            return `<button type="button" class="store-category-button${String(category.id) === String(storeState.activeCategoryId) ? ' is-active' : ''}" data-action="select-category" data-category-id="${escapeHtml(category.id)}"><span>${escapeHtml(category.name || 'Category')}</span><small>${packageCount}</small></button>`;
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
                        <button type="button" class="store-carousel-button open" data-action="package-image-open" data-package-id="${escapeHtml(storePackage.id)}" aria-label="Open image full size" title="Open image full size">&#128443;</button>
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
                    <button type="button" class="store-action-button" data-action="add-package" data-package-id="${escapeHtml(storePackage.id)}" data-i18n="btn.add_to_basket">Add to basket</button>
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
    checkoutButton.disabled = !items.length; // Prevent checkout if basket is empty

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
                    <div>
                        <h3>${escapeHtml(basketItemName(item))}</h3>
                        <p>${escapeHtml(quantity)} x ${escapeHtml(price)}</p>
                    </div>
                    <button type="button" class="icon-button" data-action="remove-package" data-package-id="${escapeHtml(packageId)}" aria-label="Remove" title="Remove">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="store-basket-item-actions">
                    <label class="store-quantity-field compact">
                        <span data-i18n="store.quantity">Quantity</span>
                        <input type="number" min="1" value="${quantity}" data-quantity-input="${escapeHtml(packageId)}">
                        <div class="store-basket-quantity-actions">
                            <button type="button" class="store-mini-button" data-action="decrease-package" data-package-id="${escapeHtml(packageId)}" data-quantity="${quantity}" data-i18n="btn.decrease">-1</button>
                            <button type="button" class="store-mini-button" data-action="increase-package" data-package-id="${escapeHtml(packageId)}" data-i18n="btn.increase">+1</button>
                        </div>
                    </label>
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
}