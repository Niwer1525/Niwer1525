const { trimAndMinifyHTML } = globalThis;

export const TEBEX_PUBLIC_KEY = '12j7m-55e896f30d3cf5108a42cb3e2aae6323210840ab';
export const TEBEX_API_BASE = 'https://headless.tebex.io/api';
export const BASKET_STORAGE_KEY = `tebex-basket-${TEBEX_PUBLIC_KEY}`;
export const CATEGORY_STORAGE_KEY = `tebex-category-${TEBEX_PUBLIC_KEY}`;
export const COUPON_STORAGE_KEY = `tebex-coupon-${TEBEX_PUBLIC_KEY}`;
export const GIFTCARD_STORAGE_KEY = `tebex-giftcard-${TEBEX_PUBLIC_KEY}`;
export const CREATOR_CODE_STORAGE_KEY = `tebex-creator-code-${TEBEX_PUBLIC_KEY}`;
export const BASKET_TOOL_DEBOUNCE_MS = 500;
export const QUANTITY_DEBOUNCE_MS = 400;

export const BASKET_TOOL_CONFIG = {
    coupon: { storageKey: COUPON_STORAGE_KEY, endpoint: 'coupons', payloadKey: 'coupon_code', collectionKey: 'coupons', valueKey: 'coupon_code', label: 'coupon' },
    giftcard: { storageKey: GIFTCARD_STORAGE_KEY, endpoint: 'giftcards', payloadKey: 'card_number', collectionKey: 'giftcards', valueKey: 'card_number', label: 'gift card' },
    creator: { storageKey: CREATOR_CODE_STORAGE_KEY, endpoint: 'creator-codes', payloadKey: 'creator_code', valueKey: 'creator_code', label: 'creator code' },
};

export const basketToolTimers = new Map();
export const quantityTimers = new Map();

export const storeState = {
    categories: [],
    packages: [],
    packageMap: new Map(),
    packageImageIndexes: new Map(),
    basket: null,
    activeCategoryId: 'all',
    loading: true,
    error: null,
};

export function formatDefaultTitle(projectName) {
    return String(projectName || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export function isSafeAssetUrl(url) {
    const normalized = String(url || '').trim();
    return Boolean(normalized) && /^(https?:|mailto:|\/|#)/i.test(normalized);
}

export function extractPackageImageSource(image) {
    if (!image) return '';
    if (typeof image === 'string') return image.trim();
    if (typeof image === 'object') {
        return String(image.src ?? image.url ?? image.image ?? image.path ?? '').trim();
    }
    return '';
}

export function packageImages(storePackage) {
    const images = [];
    for (const candidate of [storePackage?.images, storePackage?.gallery, storePackage?.media, storePackage?.image]) {
        if (Array.isArray(candidate)) {
            for (const item of candidate) {
                const source = extractPackageImageSource(item);
                if (source && isSafeAssetUrl(source) && !images.includes(source)) images.push(source);
            }
            continue;
        }

        const source = extractPackageImageSource(candidate);
        if (source && isSafeAssetUrl(source) && !images.includes(source)) images.push(source);
    }

    return images;
}

export function getPackageImageIndex(packageId, imageCount) {
    if (!imageCount) return 0;
    const storedIndex = storeState.packageImageIndexes.get(Number(packageId));
    return Number.isInteger(storedIndex) ? storedIndex % imageCount : 0;
}

export function setPackageImageIndex(packageId, nextIndex) {
    const numericPackageId = Number(packageId);
    if (numericPackageId) storeState.packageImageIndexes.set(numericPackageId, nextIndex);
}

export function sanitizeHtml(value) {
    const allowedTags = new Set(['a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'span', 'ul']);
    const allowedAttributes = new Set(['alt', 'aria-label', 'aria-hidden', 'class', 'href', 'loading', 'rel', 'src', 'target', 'title', 'width', 'height']);
    const template = document.createElement('template');
    template.innerHTML = String(value || '');

    const isSafeUrl = url => isSafeAssetUrl(url);
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
                const attributeValue = attribute.value;
                if (name.startsWith('on') || !allowedAttributes.has(name)) {
                    element.removeAttribute(attribute.name);
                    continue;
                }

                if ((name === 'href' || name === 'src') && !isSafeUrl(attributeValue)) element.removeAttribute(attribute.name);
            }

            if (tagName === 'a') {
                const href = element.getAttribute('href');
                if (!href || !isSafeUrl(href)) element.removeAttribute('href');
                else {
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

export function formatCurrency(amount, currency) {
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return '';

    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(numericValue);
    } catch {
        return `${numericValue.toFixed(2)} ${currency || 'USD'}`;
    }
}

export function getBasketIdent() { return localStorage.getItem(BASKET_STORAGE_KEY); }

export function setBasketIdent(ident) {
    if (ident) localStorage.setItem(BASKET_STORAGE_KEY, ident);
    else localStorage.removeItem(BASKET_STORAGE_KEY);
}

export function getCategoryPreference() { return localStorage.getItem(CATEGORY_STORAGE_KEY) || 'all'; }

export function setCategoryPreference(categoryId) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, categoryId);
}

export function getStoredBasketTool(key) { return localStorage.getItem(key) || ''; }

export function setStoredBasketTool(key, value) {
    const normalizedValue = String(value || '').trim();
    if (normalizedValue) localStorage.setItem(key, normalizedValue);
    else localStorage.removeItem(key);
}

export function getBasketToolConfig(kind) { return BASKET_TOOL_CONFIG[kind] || null; }

export function basketHasTool(basket, kind, value) {
    const config = getBasketToolConfig(kind);
    if (!config) return false;

    const normalizedValue = String(value || '').toLowerCase();
    if (config.collectionKey) return Array.isArray(basket?.[config.collectionKey]) && basket[config.collectionKey].some(entry => String(entry?.[config.valueKey] || '').toLowerCase() === normalizedValue);

    return String(basket?.[config.valueKey] || '').toLowerCase() === normalizedValue;
}

export function basketItemQuantity(item) {
    return Number(item?.qty ?? item?.quantity ?? item?.count ?? item?.amount ?? item?.package_quantity ?? item?.package?.qty ?? item?.package?.quantity ?? item?.package?.count ?? item?.package?.amount ?? 1) || 1;
}

export function basketItemPackageId(item) {
    return Number(item?.package_id ?? item?.packageId ?? item?.package?.id ?? item?.id ?? item?.package?.package_id ?? 0) || null;
}

export function basketItemName(item) {
    return item?.name || item?.package?.name || item?.package_name || `Package #${basketItemPackageId(item) || '0'}`;
}

export function basketLineItems(basket = storeState.basket) {
    const sources = [basket?.items, basket?.contents, basket?.line_items, basket?.cart_items, basket?.packages];

    for (const source of sources) {
        if (!Array.isArray(source) || !source.length) continue;
        const hasUsefulLineShape = source.some(item => typeof item === 'object' && item && (item.qty !== undefined || item.quantity !== undefined || item.count !== undefined || item.amount !== undefined || item.package_id !== undefined || item.packageId !== undefined || item.package?.id !== undefined));
        if (hasUsefulLineShape) return source;
    }

    return sources.find(source => Array.isArray(source) && source.length) || [];
}

export function basketItems() { return basketLineItems(); }

export function basketTotalItems() {
    const basket = storeState.basket;
    const basketLevelTotal = Number(basket?.total_items ?? basket?.item_count ?? basket?.items_count ?? basket?.quantity ?? basket?.count);
    return Number.isFinite(basketLevelTotal) && basketLevelTotal > 0 ? basketLevelTotal : basketItems().reduce((total, item) => total + basketItemQuantity(item), 0);
}

export function basketQuantityForPackage(packageId) {
    return basketItems().reduce((total, item) => total + (basketItemPackageId(item) === Number(packageId) ? basketItemQuantity(item) : 0), 0);
}

export function basketItemUnitPrice(item) {
    const packageId = basketItemPackageId(item);
    const catalogPackage = packageId ? storeState.packageMap.get(Number(packageId)) : null;
    const catalogPrice = catalogPackage ? Number(catalogPackage.total_price ?? catalogPackage.base_price) : NaN;
    if (Number.isFinite(catalogPrice) && catalogPrice > 0) return catalogPrice;

    const basketPrice = Number(item?.price ?? item?.unit_price ?? item?.base_price ?? item?.total_price ?? item?.package?.price ?? item?.package?.unit_price ?? item?.package?.base_price ?? item?.package?.total_price);
    if (Number.isFinite(basketPrice) && basketPrice > 0) return basketPrice;

    const quantity = basketItemQuantity(item);
    const totalPrice = Number(item?.total_price ?? item?.subtotal ?? item?.line_total);
    return Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice / Math.max(quantity, 1) : 0;
}

export function basketSummarySubtotal() {
    return basketItems().reduce((total, item) => total + (basketItemUnitPrice(item) * basketItemQuantity(item)), 0);
}

export function basketSummaryTax(subtotal) {
    const basketTax = Number(storeState.basket?.sales_tax);
    if (Number.isFinite(basketTax)) return basketTax;

    const basketTotal = Number(storeState.basket?.total_price);
    return Number.isFinite(basketTotal) && basketTotal >= subtotal ? basketTotal - subtotal : 0;
}

export function basketSummaryTotal(subtotal, tax) {
    return subtotal + tax;
}

export function filteredPackages() {
    return storeState.activeCategoryId === 'all' ? storeState.packages : storeState.packages.filter(item => String(item.categoryId) === String(storeState.activeCategoryId));
}