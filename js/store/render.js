const { trimAndMinifyHTML, escapeHtml } = globalThis;

import {
    filteredPackages,
    formatCurrency,
    formatDefaultTitle,
    getPackageImageIndex,
    packageImages,
    setPackageImageIndex,
    storeState,
} from './shared.js';

/* Basket tools removed */

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
        </section>
    `);
}

export function renderStateMessage(message, isError = false) {
    const status = document.getElementById('store-connection-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'ready';
}

export function renderStoreHeader() { /* no basket count */ }

export function renderCategoryButtons() {
    const container = document.getElementById('store-categories');
    if (!container) return;

    const active = String(storeState.activeCategoryId || 'all');
    const visiblePackages = storeState.packages.filter(pkg => Boolean(String(pkg.paymentLink || pkg.payment_link || '').trim()));

    container.innerHTML = trimAndMinifyHTML([
        `<button type="button"${active === 'all' ? ' class="is-active"' : ''} data-action="select-category" data-category-id="all" data-i18n="store.all_categories">All categories</button>`,
        ...storeState.categories.map(category => {
            const packageCount = visiblePackages.filter(item => String(item.categoryId) === String(category.id)).length;
            const hasSubcategories = Array.isArray(category.subcategories) && category.subcategories.length > 0;
            const categoryActive = active === String(category.id) || active.startsWith(String(category.id) + '/');
            const subcategoryActive = active.startsWith(String(category.id) + '/');
            const rowOpen = hasSubcategories && (subcategoryActive || storeState.openCategoryIds.has(String(category.id)));

            const subHtml = hasSubcategories ? `
                <div class="store-subcategory-list">
                    ${category.subcategories.map(sub => {
                        const subCountLocal = visiblePackages.filter(item => String(item.categoryId) === String(category.id) && String(item.subcategoryId || '') === String(sub.id)).length;
                        const subActive = active === `${category.id}/${sub.id}`;
                        return `<button type="button" class="store-subcategory-button${subActive ? ' is-active' : ''}" data-action="select-category" data-category-id="${escapeHtml(category.id)}" data-subcategory-id="${escapeHtml(sub.id)}"><span>${escapeHtml(sub.name || 'Subcategory')}</span><small>${subCountLocal}</small></button>`;
                    }).join('')}
                </div>
            ` : '';

            return `<div class="store-category-row${rowOpen ? ' is-open' : ''}"><div class="store-category-main"><button type="button" class="store-category-select${categoryActive ? ' is-active' : ''}" data-action="select-category" data-category-id="${escapeHtml(category.id)}"><span>${escapeHtml(category.name || 'Category')}</span><small>${packageCount}</small></button>${hasSubcategories ? `<button type="button" class="store-category-toggle icon-button${rowOpen ? ' is-open' : ''}" data-action="toggle-category-dropdown" data-category-id="${escapeHtml(category.id)}" aria-expanded="${rowOpen ? 'true' : 'false'}" aria-label="Toggle ${escapeHtml(category.name || 'Category')} subcategories"><span aria-hidden="true">▾</span></button>` : ''}</div>${subHtml}</div>`;
        }),
    ].join(''));
}

export function renderPackageBasketCounts() { /* no-op: basket removed */ }

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
        const price = formatCurrency(storePackage.displayed_price ?? storePackage.displayedPrice ?? storePackage.total_price ?? storePackage.base_price, storePackage.currency);
        const tags = [storePackage.type ? String(storePackage.type).replace(/_/g, ' ') : null, storePackage.disable_quantity ? 'single quantity' : null, storePackage.disable_gifting ? 'gifting disabled' : null].filter(Boolean);
        const description = storePackage.sanitizedDescription || '<p>No description available.</p>';
        const images = packageImages(storePackage);
        const activeImageIndex = getPackageImageIndex(storePackage.id, images.length);
        const activeImage = images[activeImageIndex] || '';
        const paymentLink = String(storePackage.paymentLink || storePackage.payment_link || storeState.catalog?.paymentLink || '').trim();

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
                        <button type="button" class="store-carousel-button prev icon-button" data-action="package-image-prev" data-package-id="${escapeHtml(storePackage.id)}" data-package-slug="${escapeHtml(storePackage.slug || '')}" aria-label="Previous image">‹</button>
                        <button type="button" class="store-carousel-button next icon-button" data-action="package-image-next" data-package-id="${escapeHtml(storePackage.id)}" data-package-slug="${escapeHtml(storePackage.slug || '')}" aria-label="Next image">›</button>
                        <button type="button" class="store-carousel-button open icon-button" data-action="package-image-open" data-package-id="${escapeHtml(storePackage.id)}" data-package-slug="${escapeHtml(storePackage.slug || '')}" aria-label="Open image full size" title="Open image full size">&#128443;</button>
                        ${images.length > 1 ? `
                            <div class="store-carousel-dots" aria-hidden="true">
                                ${images.map((_, index) => `<button type="button" class="store-carousel-dot${index === activeImageIndex ? ' is-active' : ''}" data-action="package-image-dot" data-package-id="${escapeHtml(storePackage.id)}" data-package-slug="${escapeHtml(storePackage.slug || '')}" data-image-index="${index}" aria-label="Go to image ${index + 1}"></button>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="store-package-description">${description}</div>
                ${tags.length ? `<div class="store-badges">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                <footer>
                    <a class="link-button" href="${escapeHtml(paymentLink)}" rel="noopener noreferrer" target="_blank" data-i18n="btn.buy_now">Buy now</a>
                </footer>
            </article>
        `;
    }).join(''));
}

/* Basket summary and items removed */

export function renderBasketState() { /* removed: no-op */ }

export function renderStore() {
    renderCategoryButtons();
    renderPackages();
    renderBasketState();
}