export function renderCategoryButtons() {
    const container = document.getElementById('store-categories');
    if (!container) return;

    const active = String(storeState.activeCategoryId || 'all');
    const visiblePackages = storeState.packages.filter(pkg => Boolean(getResolvedPaymentLink(pkg)));

    const renderSubcategories = (items, categoryId, parentPath = []) => {
        if (!Array.isArray(items) || !items.length) return '';
        return `<div class="store-subcategory-list">${items.map(sub => {
            const subId = String(sub.id ?? sub.slug);
            const path = [...parentPath, subId];
            const pathKey = path.join('/');
            const fullKey = `${categoryId}/${pathKey}`;

            const itemActive = active === fullKey;
            const hasChildren = Array.isArray(sub.subcategories) && sub.subcategories.length > 0;

            // An item is open if user opened it explicitly OR if current active route is inside it (unless collapsed)
            const shouldAutoExpand = active === fullKey || active.startsWith(`${fullKey}/`);
            const rowOpen = hasChildren && (
                storeState.openCategoryIds.has(fullKey) || 
                (shouldAutoExpand && !storeState.collapsedCategoryIds.has(fullKey))
            );

            // Subcategory counter
            const subCountLocal = visiblePackages.filter(item => 
                String(item.categoryId) === String(categoryId) &&
                Array.isArray(item.subcategoryPath) &&
                path.every((segment, idx) => String(item.subcategoryPath[idx]) === String(segment))
            ).length;

            const childHtml = renderSubcategories(sub.subcategories, categoryId, path);

            return `
                <div class="store-category-row${rowOpen ? ' is-open' : ''}">
                    <div class="store-category-main">
                        <button type="button" class="store-subcategory-button${itemActive ? ' is-active' : ''}" data-action="select-category" data-category-id="${escapeHtml(categoryId)}" data-subcategory-path="${escapeHtml(pathKey)}">
                            <span>${escapeHtml(sub.name || 'Subcategory')}</span>
                            <small>${subCountLocal}</small>
                        </button>
                        ${hasChildren ? `
                            <button type="button" class="store-category-toggle icon-button${rowOpen ? ' is-open' : ''}" data-action="toggle-category-dropdown" data-category-id="${escapeHtml(categoryId)}" data-category-path="${escapeHtml(pathKey)}" aria-expanded="${rowOpen ? 'true' : 'false'}" aria-label="Toggle subcategories">
                                <span aria-hidden="true">▾</span>
                            </button>
                        ` : ''}
                    </div>
                    ${childHtml}
                </div>
            `;
        }).join('')}</div>`;
    };

    container.innerHTML = [
        `<button type="button"${active === 'all' ? ' class="is-active"' : ''} data-action="select-category" data-category-id="all">${i18nLabels.allCategories}</button>`,
        ...storeState.categories.map(category => {
            const catId = String(category.id ?? category.slug);
            const packageCount = visiblePackages.filter(item => String(item.categoryId) === catId).length;
            const hasSubcategories = Array.isArray(category.subcategories) && category.subcategories.length > 0;

            const categoryActive = active === catId;
            const shouldAutoExpand = active === catId || active.startsWith(`${catId}/`);
            const rowOpen = hasSubcategories && (
                storeState.openCategoryIds.has(catId) || 
                (shouldAutoExpand && !storeState.collapsedCategoryIds.has(catId))
            );

            const subHtml = renderSubcategories(category.subcategories, catId);

            return `
                <div class="store-category-row${rowOpen ? ' is-open' : ''}">
                    <div class="store-category-main">
                        <button type="button" class="store-category-select${categoryActive ? ' is-active' : ''}" data-action="select-category" data-category-id="${escapeHtml(catId)}">
                            <span>${escapeHtml(category.name || 'Category')}</span>
                            <small>${packageCount}</small>
                        </button>
                        ${hasSubcategories ? `
                            <button type="button" class="store-category-toggle icon-button${rowOpen ? ' is-open' : ''}" data-action="toggle-category-dropdown" data-category-id="${escapeHtml(catId)}" aria-expanded="${rowOpen ? 'true' : 'false'}" aria-label="Toggle subcategories">
                                <span aria-hidden="true">▾</span>
                            </button>
                        ` : ''}
                    </div>
                    ${subHtml}
                </div>
            `;
        }),
    ].join('');
}