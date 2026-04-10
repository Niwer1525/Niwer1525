const TEBEX_PUBLIC_KEY = '12j7m-55e896f30d3cf5108a42cb3e2aae6323210840ab';
const TEBEX_API_BASE = 'https://headless.tebex.io/api';
const BASKET_STORAGE_KEY = `tebex-basket-${TEBEX_PUBLIC_KEY}`;
const CATEGORY_STORAGE_KEY = `tebex-category-${TEBEX_PUBLIC_KEY}`;
const COUPON_STORAGE_KEY = `tebex-coupon-${TEBEX_PUBLIC_KEY}`;
const GIFTCARD_STORAGE_KEY = `tebex-giftcard-${TEBEX_PUBLIC_KEY}`;
const CREATOR_CODE_STORAGE_KEY = `tebex-creator-code-${TEBEX_PUBLIC_KEY}`;
const BASKET_TOOL_DEBOUNCE_MS = 500;
const QUANTITY_DEBOUNCE_MS = 400;

const basketToolTimers = new Map();
const quantityTimers = new Map();

const storeState = {
    categories: [],
    packages: [],
    packageMap: new Map(),
    packageImageIndexes: new Map(),
    basket: null,
    activeCategoryId: 'all',
    loading: true,
    error: null,
};

function formatDefaultTitle(projectName) {
    return String(projectName || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function stripHtml(value) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = String(value || '');
    return wrapper.textContent?.trim() || '';
}

function isSafeAssetUrl(url) {
    const normalized = String(url || '').trim();
    if (!normalized) return false;
    return /^(https?:|mailto:|\/|#)/i.test(normalized);
}

function extractPackageImageSource(image) {
    if (!image) return '';
    if (typeof image === 'string') return image.trim();
    if (typeof image === 'object') {
        return String(
            image.src ??
            image.url ??
            image.image ??
            image.path ??
            ''
        ).trim();
    }
    return '';
}

function packageImages(storePackage) {
    const candidates = [
        storePackage?.images,
        storePackage?.gallery,
        storePackage?.media,
        storePackage?.image,
    ];

    const imageList = [];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            for (const item of candidate) {
                const source = extractPackageImageSource(item);
                if (source && isSafeAssetUrl(source) && !imageList.includes(source)) {
                    imageList.push(source);
                }
            }
            continue;
        }

        const source = extractPackageImageSource(candidate);
        if (source && isSafeAssetUrl(source) && !imageList.includes(source)) {
            imageList.push(source);
        }
    }

    return imageList;
}

function getPackageImageIndex(packageId, imageCount) {
    if (!imageCount) return 0;

    const storedIndex = storeState.packageImageIndexes.get(Number(packageId));
    return Number.isInteger(storedIndex) ? storedIndex % imageCount : 0;
}

function setPackageImageIndex(packageId, nextIndex) {
    const numericPackageId = Number(packageId);
    if (!numericPackageId) return;

    storeState.packageImageIndexes.set(numericPackageId, nextIndex);
}

function rotatePackageImage(packageId, direction) {
    const packageItem = storeState.packageMap.get(Number(packageId));
    if (!packageItem) return;

    const images = packageImages(packageItem);
    if (images.length <= 1) return;

    const currentIndex = getPackageImageIndex(packageId, images.length);
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    setPackageImageIndex(packageId, nextIndex);
    renderPackages();
}

function sanitizeHtml(value) {
    const allowedTags = new Set([
        'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'span', 'ul',
    ]);
    const allowedAttributes = new Set([
        'alt', 'aria-label', 'aria-hidden', 'class', 'href', 'loading', 'rel', 'src', 'target', 'title', 'width', 'height',
    ]);

    const template = document.createElement('template');
    template.innerHTML = String(value || '');

    const isSafeUrl = url => {
        const normalized = String(url || '').trim();
        if (!normalized) return false;
        return /^(https?:|mailto:|\/|#)/i.test(normalized);
    };

    const walk = node => {
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) continue;

            if (child.nodeType !== Node.ELEMENT_NODE) {
                child.remove();
                continue;
            }

            const element = child;
            const tagName = element.tagName.toLowerCase();

            if (!allowedTags.has(tagName)) {
                element.replaceWith(...Array.from(element.childNodes));
                continue;
            }

            for (const attribute of Array.from(element.attributes)) {
                const name = attribute.name.toLowerCase();
                const value = attribute.value;

                if (name.startsWith('on') || !allowedAttributes.has(name)) {
                    element.removeAttribute(attribute.name);
                    continue;
                }

                if (name === 'href' || name === 'src') {
                    if (!isSafeUrl(value)) {
                        element.removeAttribute(attribute.name);
                    }
                }
            }

            if (tagName === 'a') {
                const href = element.getAttribute('href');
                if (!href || !isSafeUrl(href)) {
                    element.removeAttribute('href');
                } else {
                    element.setAttribute('target', '_blank');
                    element.setAttribute('rel', 'noopener noreferrer');
                }
            }

            if (tagName === 'img') {
                const src = element.getAttribute('src');
                if (!src || !isSafeUrl(src)) {
                    element.remove();
                    continue;
                }

                if (!element.hasAttribute('loading')) element.setAttribute('loading', 'lazy');
                if (!element.hasAttribute('decoding')) element.setAttribute('decoding', 'async');
            }

            walk(element);
        }
    };

    walk(template.content);
    return template.innerHTML.trim();
}

function formatCurrency(amount, currency) {
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return '';

    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'USD',
        }).format(numericValue);
    } catch (_) {
        return `${numericValue.toFixed(2)} ${currency || 'USD'}`;
    }
}

function getBasketIdent() {
    return localStorage.getItem(BASKET_STORAGE_KEY);
}

function setBasketIdent(ident) {
    if (ident) localStorage.setItem(BASKET_STORAGE_KEY, ident);
    else localStorage.removeItem(BASKET_STORAGE_KEY);
}

function getCategoryPreference() {
    return localStorage.getItem(CATEGORY_STORAGE_KEY) || 'all';
}

function setCategoryPreference(categoryId) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, categoryId);
}

function getStoredBasketTool(key) {
    return localStorage.getItem(key) || '';
}

function setStoredBasketTool(key, value) {
    const normalizedValue = String(value || '').trim();
    if (normalizedValue) localStorage.setItem(key, normalizedValue);
    else localStorage.removeItem(key);
}

function basketToolStorageKey(kind) {
    switch (kind) {
        case 'coupon': return COUPON_STORAGE_KEY;
        case 'giftcard': return GIFTCARD_STORAGE_KEY;
        case 'creator': return CREATOR_CODE_STORAGE_KEY;
        default: return null;
    }
}

function scheduleBasketToolAutoApply(form) {
    if (!(form instanceof HTMLFormElement)) return;

    const kind = form.dataset.kind;
    const storageKey = basketToolStorageKey(kind);
    const input = form.querySelector('input[name="code"]');

    if (!kind || !storageKey || !(input instanceof HTMLInputElement)) return;

    const normalizedValue = input.value.trim();
    setStoredBasketTool(storageKey, normalizedValue);

    if (basketToolTimers.has(kind)) {
        clearTimeout(basketToolTimers.get(kind));
    }

    basketToolTimers.set(kind, setTimeout(async () => {
        basketToolTimers.delete(kind);

        if (!storeState.basket?.ident || !normalizedValue) return;

        const alreadyApplied =
            (kind === 'coupon' && basketHasCoupon(storeState.basket, normalizedValue)) ||
            (kind === 'giftcard' && basketHasGiftCard(storeState.basket, normalizedValue)) ||
            (kind === 'creator' && basketHasCreatorCode(storeState.basket, normalizedValue));

        if (alreadyApplied) return;

        try {
            await applyBasketValue(kind, normalizedValue);
        } catch (error) {
            console.warn(`Unable to auto-apply ${kind}:`, error);
        }
    }, BASKET_TOOL_DEBOUNCE_MS));
}

function basketHasCoupon(basket, couponCode) {
    return Array.isArray(basket?.coupons) && basket.coupons.some(coupon => String(coupon?.coupon_code || '').toLowerCase() === String(couponCode || '').toLowerCase());
}

function basketHasGiftCard(basket, cardNumber) {
    return Array.isArray(basket?.giftcards) && basket.giftcards.some(card => String(card?.card_number || '').toLowerCase() === String(cardNumber || '').toLowerCase());
}

function basketHasCreatorCode(basket, creatorCode) {
    return String(basket?.creator_code || '').toLowerCase() === String(creatorCode || '').toLowerCase();
}

function unwrapApiData(payload) {
    if (!payload) return null;
    return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

async function fetchTebex(path, options = {}) {
    const response = await fetch(`${TEBEX_API_BASE}${path}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`Tebex request failed (${response.status})`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    return unwrapApiData(JSON.parse(text));
}

function basketItemQuantity(item) {
    return Number(
        item?.qty ??
        item?.quantity ??
        item?.count ??
        item?.amount ??
        item?.package_quantity ??
        item?.package?.qty ??
        item?.package?.quantity ??
        item?.package?.count ??
        item?.package?.amount ??
        1
    ) || 1;
}

function basketItemPackageId(item) {
    return Number(
        item?.package_id ??
        item?.packageId ??
        item?.package?.id ??
        item?.id ??
        item?.package?.package_id ??
        0
    ) || null;
}

function basketItemName(item) {
    return item?.name || item?.package?.name || item?.package_name || `Package #${basketItemPackageId(item) || '0'}`;
}

function basketLineItems(basket = storeState.basket) {
    const sources = [
        basket?.items,
        basket?.contents,
        basket?.line_items,
        basket?.cart_items,
        basket?.packages,
    ];

    for (const source of sources) {
        if (!Array.isArray(source) || !source.length) continue;

        const hasUsefulLineShape = source.some(item =>
            typeof item === 'object' && item && (
                item.qty !== undefined ||
                item.quantity !== undefined ||
                item.count !== undefined ||
                item.amount !== undefined ||
                item.package_id !== undefined ||
                item.packageId !== undefined ||
                item.package?.id !== undefined
            )
        );

        if (hasUsefulLineShape) return source;
    }

    for (const source of sources) {
        if (Array.isArray(source) && source.length) return source;
    }

    return [];
}

function scheduleBasketQuantityAutoUpdate(input) {
    if (!(input instanceof HTMLInputElement)) return;

    const packageId = Number(input.dataset.quantityInput);
    if (!packageId) return;

    if (quantityTimers.has(packageId)) {
        clearTimeout(quantityTimers.get(packageId));
    }

    quantityTimers.set(packageId, setTimeout(async () => {
        quantityTimers.delete(packageId);
        const quantity = Number(input.value || 1);
        await updatePackageQuantity(packageId, quantity);
    }, QUANTITY_DEBOUNCE_MS));
}

function basketItems() {
    return basketLineItems();
}

function basketTotalItems() {
    const basket = storeState.basket;
    const basketLevelTotal = Number(
        basket?.total_items ??
        basket?.item_count ??
        basket?.items_count ??
        basket?.quantity ??
        basket?.count
    );

    if (Number.isFinite(basketLevelTotal) && basketLevelTotal > 0) {
        return basketLevelTotal;
    }

    return basketItems().reduce((total, item) => total + basketItemQuantity(item), 0);
}

function basketQuantityForPackage(packageId) {
    return basketItems().reduce((total, item) => {
        return basketItemPackageId(item) === Number(packageId)
            ? total + basketItemQuantity(item)
            : total;
    }, 0);
}

function basketItemUnitPrice(item) {
    const packageId = basketItemPackageId(item);
    const catalogPackage = packageId ? storeState.packageMap.get(Number(packageId)) : null;

    const catalogPrice = catalogPackage
        ? Number(catalogPackage.total_price ?? catalogPackage.base_price)
        : NaN;

    if (Number.isFinite(catalogPrice) && catalogPrice > 0) {
        return catalogPrice;
    }

    const basketPrice = Number(
        item?.price ??
        item?.unit_price ??
        item?.base_price ??
        item?.total_price ??
        item?.package?.price ??
        item?.package?.unit_price ??
        item?.package?.base_price ??
        item?.package?.total_price
    );

    if (Number.isFinite(basketPrice) && basketPrice > 0) {
        return basketPrice;
    }

    const quantity = basketItemQuantity(item);
    const totalPrice = Number(item?.total_price ?? item?.subtotal ?? item?.line_total);
    if (Number.isFinite(totalPrice) && totalPrice > 0) {
        return totalPrice / Math.max(quantity, 1);
    }

    return 0;
}

function basketSummarySubtotal() {
    return basketItems().reduce((total, item) => {
        return total + (basketItemUnitPrice(item) * basketItemQuantity(item));
    }, 0);
}

function basketSummaryTax(subtotal) {
    const basketTax = Number(storeState.basket?.sales_tax);
    if (Number.isFinite(basketTax)) {
        return basketTax;
    }

    const basketTotal = Number(storeState.basket?.total_price);
    if (Number.isFinite(basketTotal) && basketTotal >= subtotal) {
        return basketTotal - subtotal;
    }

    return 0;
}

function basketSummaryTotal(subtotal, tax) {
    return subtotal + tax;
}

function activeCategory() {
    return storeState.categories.find(category => String(category.id) === String(storeState.activeCategoryId)) || null;
}

function filteredPackages() {
    if (storeState.activeCategoryId === 'all') return storeState.packages;
    return storeState.packages.filter(item => String(item.categoryId) === String(storeState.activeCategoryId));
}

function ensureStoreShell() {
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
                            <label class="store-inline-field">
                                <span data-i18n="store.coupon">Coupon code</span>
                                <input name="code" type="text" autocomplete="off" placeholder="SUMMER10">
                            </label>
                        </form>
                        <form id="giftcard-form" class="store-form" data-kind="giftcard" data-auto-apply="true">
                            <label class="store-inline-field">
                                <span data-i18n="store.giftcard">Gift card</span>
                                <input name="code" type="text" autocomplete="off" placeholder="0127 0244 7210 1111">
                            </label>
                        </form>
                        <form id="creator-code-form" class="store-form" data-kind="creator" data-auto-apply="true">
                            <label class="store-inline-field">
                                <span data-i18n="store.creator_code">Creator code</span>
                                <input name="code" type="text" autocomplete="off" placeholder="NIWER">
                            </label>
                        </form>
                    </div>
                    <button id="checkout-button" type="button" class="store-checkout-button" data-action="checkout" data-i18n="btn.checkout">Checkout</button>
                </div>
            </aside>
        </section>
    `);
}

function renderStateMessage(message, isError = false) {
    const status = document.getElementById('store-connection-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'ready';
}

function renderStoreHeader() {
    const basketCount = document.getElementById('basket-item-count');

    if (basketCount) basketCount.textContent = `${basketTotalItems()} items`;
}

function renderCategoryButtons() {
    const container = document.getElementById('store-categories');
    if (!container) return;

    const categoryButtons = [
        `<button type="button" class="store-category-button${storeState.activeCategoryId === 'all' ? ' is-active' : ''}" data-action="select-category" data-category-id="all" data-i18n="store.all_categories">All categories</button>`,
        ...storeState.categories.map(category => {
            const packageCount = Array.isArray(category.packages) ? category.packages.length : 0;
            return `<button type="button" class="store-category-button${String(category.id) === String(storeState.activeCategoryId) ? ' is-active' : ''}" data-action="select-category" data-category-id="${escapeHtml(category.id)}">
                <span>${escapeHtml(category.name || 'Category')}</span>
                <small>${packageCount}</small>
            </button>`;
        }),
    ];

    container.innerHTML = trimAndMinifyHTML(categoryButtons.join(''));
}

function renderPackages() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const packages = filteredPackages();
    if (!packages.length) {
        grid.innerHTML = trimAndMinifyHTML(`
            <article class="store-empty-card">
                <header>
                    <h2 data-i18n="store.no_packages">No packages available</h2>
                </header>
                <p data-i18n="store.no_packages_copy">Try another category or come back later.</p>
            </article>
        `);
        return;
    }

    grid.innerHTML = trimAndMinifyHTML(packages.map(storePackage => {
        const price = formatCurrency(storePackage.total_price ?? storePackage.base_price, storePackage.currency);
        const tags = [
            storePackage.type ? String(storePackage.type).replace(/_/g, ' ') : null,
            storePackage.disable_quantity ? 'single quantity' : null,
            storePackage.disable_gifting ? 'gifting disabled' : null,
        ].filter(Boolean);
        const description = sanitizeHtml(storePackage.description) || '<p>No description available.</p>';
        const quantityInBasket = basketQuantityForPackage(storePackage.id);
        const images = packageImages(storePackage);
        const activeImageIndex = getPackageImageIndex(storePackage.id, images.length);
        const activeImage = images[activeImageIndex] || '';
        const hasCarousel = images.length > 1;

        return `<article class="store-package-card" data-package-id="${escapeHtml(storePackage.id)}">
            <header class="store-package-header">
                <div>
                    <h2>${escapeHtml(storePackage.name || formatDefaultTitle(storePackage.slug || 'Package'))}</h2>
                </div>
                <div class="store-price">${escapeHtml(price)}</div>
            </header>
            ${activeImage ? `<div class="store-image-carousel" data-package-carousel="${escapeHtml(storePackage.id)}" data-image-count="${images.length}">
                <img src="${escapeHtml(activeImage)}" alt="${escapeHtml(storePackage.name || 'Package')}" loading="lazy">
                <button type="button" class="store-carousel-button open" data-action="package-image-open" data-package-id="${escapeHtml(storePackage.id)}" aria-label="Open image full size" title="Open image full size">&#128443;</button>
                ${hasCarousel ? `
                    <button type="button" class="store-carousel-button prev" data-action="package-image-prev" data-package-id="${escapeHtml(storePackage.id)}" aria-label="Previous image" title="Previous image">&#10094;</button>
                    <button type="button" class="store-carousel-button next" data-action="package-image-next" data-package-id="${escapeHtml(storePackage.id)}" aria-label="Next image" title="Next image">&#10095;</button>
                    <div class="store-carousel-dots" aria-hidden="true">
                        ${images.map((_, index) => `<button type="button" class="store-carousel-dot${index === activeImageIndex ? ' is-active' : ''}" data-action="package-image-dot" data-package-id="${escapeHtml(storePackage.id)}" data-image-index="${index}" aria-label="Go to image ${index + 1}"></button>`).join('')}
                    </div>
                ` : ''}
            </div>` : ''}
            <div class="store-package-description">${description}</div>
            ${tags.length ? `<div class="store-badges">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
            <footer>
                <button type="button" class="store-action-button" data-action="add-package" data-package-id="${escapeHtml(storePackage.id)}" data-i18n="btn.add_to_basket">Add to basket</button>
                ${quantityInBasket ? `<span class="store-in-basket-count">${escapeHtml(quantityInBasket)} in basket</span>` : ''}
            </footer>
        </article>`;
    }).join(''));
}

function renderBasketSummary() {
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
        <div class="store-summary-meta">
            <span>${escapeHtml(currency)}</span>
            <span>${basket.complete ? 'Completed' : 'Active'}</span>
        </div>
    `);
}

function renderBasketItems() {
    const container = document.getElementById('basket-items');
    const checkoutButton = document.getElementById('checkout-button');
    if (!container || !checkoutButton) return;

    const items = basketItems();
    checkoutButton.disabled = !items.length;

    if (!items.length) {
        container.innerHTML = trimAndMinifyHTML(`
            <article class="store-empty-card">
                <header>
                    <h2 data-i18n="store.empty_basket">Basket is empty</h2>
                </header>
            </article>
        `);
        return;
    }

    container.innerHTML = trimAndMinifyHTML(items.map(item => {
        const packageId = basketItemPackageId(item);
        const quantity = basketItemQuantity(item);
        const price = formatCurrency(basketItemUnitPrice(item), storeState.basket?.currency);

        return `<article class="store-basket-item" data-package-id="${escapeHtml(packageId)}">
            <div class="store-basket-item-head">
                <div>
                    <h3>${escapeHtml(basketItemName(item))}</h3>
                    <p>${escapeHtml(quantity)} x ${escapeHtml(price)}</p>
                </div>
                <button type="button" class="icon-button" data-action="remove-package" data-package-id="${escapeHtml(packageId)}" aria-label="Remove" title="Remove"><i class="fa-solid fa-trash"></i></button>
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
        </article>`;
    }).join(''));
}

async function applyStoredBasketTools() {
    if (!storeState.basket?.ident) return;

    const steps = [
        {
            kind: 'coupon',
            key: COUPON_STORAGE_KEY,
            hasValue: basketHasCoupon,
            endpointLabel: 'coupon',
        },
        {
            kind: 'giftcard',
            key: GIFTCARD_STORAGE_KEY,
            hasValue: basketHasGiftCard,
            endpointLabel: 'gift card',
        },
        {
            kind: 'creator',
            key: CREATOR_CODE_STORAGE_KEY,
            hasValue: basketHasCreatorCode,
            endpointLabel: 'creator code',
        },
    ];

    for (const step of steps) {
        const storedValue = getStoredBasketTool(step.key);
        if (!storedValue || step.hasValue(storeState.basket, storedValue)) continue;

        try {
            await applyBasketValue(step.kind, storedValue);
        } catch (error) {
            console.warn(`Unable to auto-apply ${step.endpointLabel}:`, error);
        }
    }
}

function renderStore() {
    renderStoreHeader();
    renderCategoryButtons();
    renderPackages();
    renderBasketSummary();
    renderBasketItems();
}

async function loadStorePackages() {
    const categories = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/categories?includePackages=1`);
    storeState.categories = Array.isArray(categories) ? categories : [];
    storeState.packages = storeState.categories.flatMap(category => {
        return Array.isArray(category.packages)
            ? category.packages.map(storePackage => ({
                ...storePackage,
                categoryId: category.id,
                categoryName: category.name,
            }))
            : [];
    });
    storeState.packageMap = new Map(storeState.packages.map(storePackage => [Number(storePackage.id), storePackage]));
    storeState.activeCategoryId = getCategoryPreference();

    if (storeState.activeCategoryId !== 'all' && !storeState.categories.some(category => String(category.id) === String(storeState.activeCategoryId))) {
        storeState.activeCategoryId = 'all';
    }

    if (storeState.packages.length) {
        renderStateMessage(`Loaded ${storeState.categories.length} categories and ${storeState.packages.length} packages.`);
    } else {
        renderStateMessage('No Tebex packages were returned by the store.');
    }
}

async function loadBasket() {
    const basketIdent = getBasketIdent();

    if (basketIdent) {
        try {
            const basket = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${basketIdent}`);
            if (basket?.complete) {
                setBasketIdent(null);
            } else if (basket) {
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
        body: JSON.stringify({
            complete_url: window.location.href.split('#')[0],
            cancel_url: window.location.href.split('#')[0],
            complete_auto_redirect: true,
            custom: {
                source: 'portfolio-store',
            },
        }),
    });

    storeState.basket = basket;
    setBasketIdent(basket?.ident || null);
}

async function syncBasket() {
    if (!storeState.basket?.ident) return;

    const basket = await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${storeState.basket.ident}`);
    storeState.basket = basket;
    if (basket?.complete) {
        setBasketIdent(null);
    }
}

async function addPackageToBasket(packageId, quantity = 1) {
    if (!storeState.basket?.ident) return;

    await fetchTebex(`/baskets/${storeState.basket.ident}/packages`, {
        method: 'POST',
        body: JSON.stringify({
            package_id: Number(packageId),
            quantity: Number(quantity) || 1,
        }),
    });

    await syncBasket();
    renderStore();
}

async function removePackageFromBasket(packageId) {
    if (!storeState.basket?.ident) return;

    await fetchTebex(`/baskets/${storeState.basket.ident}/packages/remove`, {
        method: 'POST',
        body: JSON.stringify({
            package_id: Number(packageId),
        }),
    });

    await syncBasket();
    renderStore();
}

async function updatePackageQuantity(packageId, nextQuantity) {
    const quantity = Number(nextQuantity) || 1;
    const item = basketItems().find(entry => basketItemPackageId(entry) === Number(packageId));
    const currentQuantity = basketItemQuantity(item);

    if (!item) return;
    if (quantity <= 0) {
        await removePackageFromBasket(packageId);
        return;
    }

    if (quantity === currentQuantity) return;

    await removePackageFromBasket(packageId);
    await addPackageToBasket(packageId, quantity);
}

async function applyBasketValue(kind, value) {
    if (!storeState.basket?.ident) return;

    const normalizedValue = String(value || '').trim();
    if (!normalizedValue) return;

    if (kind === 'coupon') {
        await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${storeState.basket.ident}/coupons`, {
            method: 'POST',
            body: JSON.stringify({ coupon_code: normalizedValue }),
        });
    } else if (kind === 'giftcard') {
        await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${storeState.basket.ident}/giftcards`, {
            method: 'POST',
            body: JSON.stringify({ card_number: normalizedValue }),
        });
    } else if (kind === 'creator') {
        await fetchTebex(`/accounts/${TEBEX_PUBLIC_KEY}/baskets/${storeState.basket.ident}/creator-codes`, {
            method: 'POST',
            body: JSON.stringify({ creator_code: normalizedValue }),
        });
    }

    await syncBasket();
    renderStore();
}

function openCheckout() {
    const checkoutUrl = storeState.basket?.links?.checkout;
    if (!checkoutUrl) {
        createNotification('Checkout is not available yet.');
        return;
    }

    window.location.href = checkoutUrl;
}

function handleStoreClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const packageId = button.dataset.packageId;
    const categoryId = button.dataset.categoryId;

    if (action === 'select-category') {
        storeState.activeCategoryId = String(categoryId || 'all');
        setCategoryPreference(storeState.activeCategoryId);
        renderStore();
        return;
    }

    if (action === 'jump-to-category') {
        storeState.activeCategoryId = String(categoryId || 'all');
        setCategoryPreference(storeState.activeCategoryId);
        renderStore();
        document.getElementById('projects-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    if (action === 'add-package' && packageId) {
        addPackageToBasket(packageId, 1).catch(error => createNotification(error.message || 'Could not add package to basket.'));
        return;
    }

    if (action === 'package-image-prev' && packageId) {
        rotatePackageImage(packageId, -1);
        return;
    }

    if (action === 'package-image-next' && packageId) {
        rotatePackageImage(packageId, 1);
        return;
    }

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
        if (!packageItem) return;

        const images = packageImages(packageItem);
        if (!images.length) return;

        const activeImageIndex = getPackageImageIndex(packageId, images.length);
        const imageUrl = images[activeImageIndex];
        if (imageUrl) window.open(imageUrl, '_blank', 'noopener,noreferrer');
        return;
    }

    if (action === 'remove-package' && packageId) {
        removePackageFromBasket(packageId).catch(error => createNotification(error.message || 'Could not remove package from basket.'));
        return;
    }

    if (action === 'increase-package' && packageId) {
        addPackageToBasket(packageId, 1).catch(error => createNotification(error.message || 'Could not update basket.'));
        return;
    }

    if (action === 'decrease-package' && packageId) {
        const currentQuantity = Number(button.dataset.quantity || 1);
        updatePackageQuantity(packageId, currentQuantity - 1).catch(error => createNotification(error.message || 'Could not update basket.'));
        return;
    }

    if (action === 'checkout') {
        openCheckout();
    }
}

function handleStoreInput(event) {
    const form = event.target;
    if (form instanceof HTMLFormElement) {
        if (!form.dataset.autoApply) return;
        if (!['coupon-form', 'giftcard-form', 'creator-code-form'].includes(form.id)) return;
        scheduleBasketToolAutoApply(form);
        return;
    }

    if (form instanceof HTMLInputElement && form.matches('[data-quantity-input]')) {
        scheduleBasketQuantityAutoUpdate(form);
    }
}

async function bootstrapStore() {
    ensureStoreShell();
    renderStoreHeader();
    renderCategoryButtons();
    renderPackages();
    renderBasketSummary();
    renderBasketItems();

    try {
        await Promise.all([
            loadStorePackages(),
            loadBasket(),
        ]);

        await applyStoredBasketTools();
        renderStore();
        await applyLanguage(document.querySelector('main') || document);
        storeState.loading = false;
    } catch (error) {
        storeState.error = error;
        const grid = document.getElementById('projects-grid');
        if (grid) {
            grid.innerHTML = trimAndMinifyHTML(`
                <article class="store-empty-card">
                    <header>
                        <h2 data-i18n="store.load_failed">Store could not be loaded</h2>
                    </header>
                    <p>${escapeHtml(error.message || 'The Tebex API request failed.')}</p>
                </article>
            `);
            await applyLanguage(grid);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrapStore();
});

document.addEventListener('click', handleStoreClick);
document.addEventListener('input', handleStoreInput);

window.addEventListener('beforeunload', () => {
    if (storeState.activeCategoryId) setCategoryPreference(storeState.activeCategoryId);
});