import { getValueWithFallback } from '../../utils.js';

function renderSubcategoryBranch(subcategories, categoryId, visiblePackages, parentPath = []) {
    if (!Array.isArray(subcategories) || !subcategories.length) return '';

    const itemsHtml = subcategories.map(sub => {
        const subId = String(sub.id ?? sub.slug);
        const path = [...parentPath, subId];
        const pathKey = path.join('/'); // e.g. "niwer-engine", "niwer-engine/licenses", "tools-standalone"
        const fullCompositePath = `${categoryId}/${pathKey}`;

        // Count packages that live in this exact branch or its descendants
        const subCount = visiblePackages.filter(item => {
            if (String(item.categoryId) !== String(categoryId)) return false;
            const itemPath = Array.isArray(item.subcategoryPath) ? item.subcategoryPath : [];
            return path.every((segment, idx) => String(itemPath[idx]) === String(segment));
        }).length;

        const hasChildren = Array.isArray(sub.subcategories) && sub.subcategories.length > 0;
        const childHtml = hasChildren ? renderSubcategoryBranch(sub.subcategories, categoryId, visiblePackages, path) : '';

        return `
            <div class="store-category-row" data-row-path="${fullCompositePath}">
                <div class="store-category-main">
                    <button type="button" 
                            class="store-subcategory-button" 
                            data-action="select-category" 
                            data-full-path="${fullCompositePath}"
                            data-category-id="${categoryId}" 
                            data-subcategory-path="${pathKey}">
                        <span>${sub.name || 'Subcategory'}</span>
                        <small>${subCount}</small>
                    </button>
                    ${hasChildren ? `
                        <button type="button" 
                                class="store-category-toggle icon-button" 
                                data-action="toggle-category-dropdown" 
                                data-full-path="${fullCompositePath}"
                                aria-expanded="false" 
                                aria-label="Toggle subcategories">
                            <span>▾</span>
                        </button>
                    ` : ''}
                </div>
                ${childHtml}
            </div>
        `;
    }).join('');

    return `<div class="store-subcategory-list">${itemsHtml}</div>`;
}

export function renderCategoriesSidebar(categories, visiblePackages, langDict) {
    const categoryButtonsHtml = [
        `<button type="button" class="is-active" data-action="select-category" data-full-path="all" data-category-id="all">${getValueWithFallback(langDict, 'store.all_categories', 'All categories')}</button>`,
        ...categories.map(category => {
            const catId = String(category.id ?? category.slug);
            const packageCount = visiblePackages.filter(item => String(item.categoryId) === catId).length;
            const hasSubcategories = Array.isArray(category.subcategories) && category.subcategories.length > 0;
            const subHtml = hasSubcategories ? renderSubcategoryBranch(category.subcategories, catId, visiblePackages, []) : '';

            return `
                <div class="store-category-row" data-row-path="${catId}">
                    <div class="store-category-main">
                        <button type="button" 
                                class="store-category-select" 
                                data-action="select-category" 
                                data-full-path="${catId}"
                                data-category-id="${catId}">
                            <span>${category.name || 'Category'}</span>
                            <small>${packageCount}</small>
                        </button>
                        ${hasSubcategories ? `
                            <button type="button" 
                                    class="store-category-toggle icon-button" 
                                    data-action="toggle-category-dropdown" 
                                    data-full-path="${catId}"
                                    aria-expanded="false" 
                                    aria-label="Toggle subcategories">
                                <span>▾</span>
                            </button>
                        ` : ''}
                    </div>
                    ${subHtml}
                </div>
            `;
        })
    ].join('');

    return `
        <aside class="store-sidebar">
            <div class="store-panel">
                <div class="store-panel-head">
                    <h2>${getValueWithFallback(langDict, 'store.categories', 'Categories')}</h2>
                </div>
                <div id="store-categories" class="store-category-list">
                    ${categoryButtonsHtml}
                </div>
            </div>
        </aside>
    `;
}