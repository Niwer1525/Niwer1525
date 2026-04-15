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
    coupon: { storageKey: COUPON_STORAGE_KEY, endpoint: 'coupons', removeEndpoint: 'coupons/remove', payloadKey: 'coupon_code', collectionKey: 'coupons', valueKey: 'code', label: 'coupon', requiresBasketItems: true },
    giftcard: { storageKey: GIFTCARD_STORAGE_KEY, endpoint: 'giftcards', removeEndpoint: 'giftcards/remove', payloadKey: 'card_number', collectionKey: 'giftcards', valueKey: 'card_number', label: 'gift card' },
    creator: { storageKey: CREATOR_CODE_STORAGE_KEY, endpoint: 'creator-codes', removeEndpoint: 'creator-codes/remove', payloadKey: 'creator_code', valueKey: 'creator_code', label: 'creator code' },
};

export const basketToolTimers = new Map();
export const basketToolAppliedValues = new Map();
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

export function getBasketToolAppliedValue(kind) { return basketToolAppliedValues.get(kind) || ''; }

export function setBasketToolAppliedValue(kind, value) {
    const normalizedValue = String(value || '').trim();
    if (!kind) return;
    if (normalizedValue) basketToolAppliedValues.set(kind, normalizedValue);
    else basketToolAppliedValues.delete(kind);
}

export function basketHasTool(basket, kind, value) {
    const config = getBasketToolConfig(kind);
    if (!config) return false;

    const normalizedValue = String(value || '').toLowerCase();
    if (config.collectionKey) return Array.isArray(basket?.[config.collectionKey]) && basket[config.collectionKey].some(entry => String(entry?.[config.valueKey] || '').toLowerCase() === normalizedValue);

    return String(basket?.[config.valueKey] || '').toLowerCase() === normalizedValue;
}

export function basketItemQuantity(item) {
    const readQuantity = candidate => {
        if (candidate == null) return null;

        if (typeof candidate === 'number') return Number.isFinite(candidate) ? candidate : null;

        if (typeof candidate === 'string') {
            const normalized = candidate.trim();
            if (!normalized) return null;

            const parsed = Number(normalized);
            return Number.isFinite(parsed) ? parsed : null;
        }

        if (typeof candidate === 'object') {
            for (const key of ['qty', 'quantity', 'count', 'amount', 'value', 'package_quantity']) {
                if (candidate[key] !== undefined) {
                    const nestedQuantity = readQuantity(candidate[key]);
                    if (nestedQuantity !== null) return nestedQuantity;
                }
            }
        }

        return null;
    };

    const quantity = readQuantity(
        item?.in_basket?.quantity ??
        item?.in_basket?.qty ??
        item?.in_basket?.count ??
        item?.in_basket?.quantity_in_basket ??
        item?.in_basket?.line_quantity ??
        item?.qty ??
        item?.quantity ??
        item?.count ??
        item?.amount ??
        item?.package_quantity ??
        item?.quantity_in_basket ??
        item?.line_quantity ??
        item?.package?.qty ??
        item?.package?.quantity ??
        item?.package?.count ??
        item?.package?.amount ??
        item?.package?.quantity_in_basket ??
        item?.package?.line_quantity
    );

    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
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

export function basketQuantitiesByPackage() {
    const quantities = new Map();

    for (const item of basketItems()) {
        const packageId = basketItemPackageId(item);
        if (!packageId) continue;

        quantities.set(packageId, (quantities.get(packageId) || 0) + basketItemQuantity(item));
    }

    return quantities;
}

export function basketItemUnitPrice(item) {
    const packageId = basketItemPackageId(item);
    const catalogPackage = packageId ? storeState.packageMap.get(Number(packageId)) : null;
    const quantity = basketItemQuantity(item);

    const basketPrice = Number(
        item?.in_basket?.price ??
        item?.in_basket?.unit_price ??
        item?.in_basket?.base_price ??
        item?.price ??
        item?.unit_price ??
        item?.base_price ??
        item?.package?.in_basket?.price ??
        item?.package?.in_basket?.unit_price ??
        item?.package?.in_basket?.base_price ??
        item?.package?.price ??
        item?.package?.unit_price ??
        item?.package?.base_price
    );
    if (Number.isFinite(basketPrice) && basketPrice > 0) return basketPrice;

    const basketTotal = Number(
        item?.in_basket?.total_price ??
        item?.in_basket?.subtotal ??
        item?.in_basket?.line_total ??
        item?.total_price ??
        item?.subtotal ??
        item?.line_total ??
        item?.package?.in_basket?.total_price ??
        item?.package?.in_basket?.subtotal ??
        item?.package?.in_basket?.line_total ??
        item?.package?.total_price ??
        item?.package?.subtotal ??
        item?.package?.line_total
    );
    if (Number.isFinite(basketTotal) && basketTotal > 0) return basketTotal / Math.max(quantity, 1);

    const catalogPrice = catalogPackage ? Number(catalogPackage.total_price ?? catalogPackage.base_price) : NaN;
    if (Number.isFinite(catalogPrice) && catalogPrice > 0) return catalogPrice;

    return 0;
}

export function basketItemCurrentLineTotal(item) {
    const quantity = basketItemQuantity(item);

    const explicitTotal = Number(
        item?.in_basket?.total_price ??
        item?.in_basket?.subtotal ??
        item?.in_basket?.line_total ??
        item?.total_price ??
        item?.subtotal ??
        item?.line_total ??
        item?.package?.in_basket?.total_price ??
        item?.package?.in_basket?.subtotal ??
        item?.package?.in_basket?.line_total ??
        item?.package?.total_price ??
        item?.package?.subtotal ??
        item?.package?.line_total
    );
    if (Number.isFinite(explicitTotal) && explicitTotal > 0) return explicitTotal;

    const unitPrice = Number(
        item?.in_basket?.price ??
        item?.in_basket?.unit_price ??
        item?.in_basket?.base_price ??
        item?.price ??
        item?.unit_price ??
        item?.base_price ??
        item?.package?.in_basket?.price ??
        item?.package?.in_basket?.unit_price ??
        item?.package?.in_basket?.base_price ??
        item?.package?.price ??
        item?.package?.unit_price ??
        item?.package?.base_price
    );
    if (Number.isFinite(unitPrice) && unitPrice > 0) return unitPrice * quantity;

    return 0;
}

export function basketItemCatalogLineTotal(item) {
    const packageId = basketItemPackageId(item);
    const catalogPackage = packageId ? storeState.packageMap.get(Number(packageId)) : null;
    const quantity = basketItemQuantity(item);

    const catalogTotal = Number(
        catalogPackage?.total_price ??
        catalogPackage?.base_price ??
        item?.package?.total_price ??
        item?.package?.base_price
    );

    if (Number.isFinite(catalogTotal) && catalogTotal > 0) return catalogTotal * quantity;
    return 0;
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

export function basketSummaryReduction(subtotal) {
    const basket = storeState.basket;
    if (!basket) return 0;

    const readPositiveAmount = candidate => {
        const amount = Number(candidate);
        return Number.isFinite(amount) && amount > 0 ? amount : 0;
    };

    const directAmountCandidates = [
        basket.discount,
        basket.discount_amount,
        basket.discount_total,
        basket.total_discount,
        basket.discounts_total,
        basket.discounted_amount,
    ];

    for (const candidate of directAmountCandidates) {
        const amount = readPositiveAmount(candidate);
        if (amount > 0) return amount;
    }

    const lineTotalReduction = basketItems().reduce((total, item) => {
        const currentTotal = basketItemCurrentLineTotal(item);
        const catalogTotal = basketItemCatalogLineTotal(item);
        if (!(Number.isFinite(currentTotal) && currentTotal >= 0 && Number.isFinite(catalogTotal) && catalogTotal > currentTotal)) return total;
        return total + (catalogTotal - currentTotal);
    }, 0);
    if (lineTotalReduction > 0) return lineTotalReduction;

    const discountCollections = [basket.discounts, basket.discounts_applied, basket.applied_discounts];
    for (const collection of discountCollections) {
        if (!Array.isArray(collection) || !collection.length) continue;

        const amount = collection.reduce((total, entry) => total + readPositiveAmount(
            entry?.amount ??
            entry?.value ??
            entry?.total ??
            entry?.price ??
            entry?.discount ??
            entry?.discount_amount
        ), 0);
        if (Number.isFinite(amount) && amount > 0) return amount;
    }

    const lineItemDiscounts = basketItems().reduce((total, item) => total + readPositiveAmount(
        item?.discount ??
        item?.discount_amount ??
        item?.discounted_amount ??
        item?.in_basket?.discount ??
        item?.in_basket?.discount_amount ??
        item?.in_basket?.discounted_amount ??
        item?.package?.discount ??
        item?.package?.discount_amount ??
        item?.package?.discounted_amount
    ), 0);
    if (lineItemDiscounts > 0) return lineItemDiscounts;

    const basketBaseSubtotal = Number(basket.base_price ?? basket.subtotal ?? basket.subtotal_price ?? basket.total_before_discount ?? basket.total_price_before_tax ?? basket.subtotal_before_discount);
    if (Number.isFinite(basketBaseSubtotal) && basketBaseSubtotal > 0 && subtotal > basketBaseSubtotal) {
        return subtotal - basketBaseSubtotal;
    }

    return 0;
}

export function filteredPackages() {
    return storeState.activeCategoryId === 'all' ? storeState.packages : storeState.packages.filter(item => String(item.categoryId) === String(storeState.activeCategoryId));
}