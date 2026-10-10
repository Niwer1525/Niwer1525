import { getValueWithFallback } from '../../utils.js';

export function renderFilterPills(categories, visiblePackages, langDict) {
    // Collect all unique filters you want to display
    const pillDefs = [
        { id: 'all', label: getValueWithFallback(langDict, 'store.all_categories', 'All') }
    ];

    categories.forEach(cat => {
        const catId = String(cat.id ?? cat.slug);
        pillDefs.push({ id: catId, label: cat.name });

        if (Array.isArray(cat.subcategories)) {
            cat.subcategories.forEach(sub => {
                const subId = String(sub.id ?? sub.slug);
                pillDefs.push({ id: subId, label: sub.name });
            });
        }
    });

    const pillsHtml = pillDefs.map(pill => {
        const count = pill.id === 'all'
            ? visiblePackages.length
            : visiblePackages.filter(p => p.filterTags?.includes(pill.id)).length;

        const isActive = pill.id === 'all' ? ' is-active' : '';

        return `
            <button type="button" 
                    class="store-filter-pill${isActive}" 
                    data-filter="${pill.id}">
                <span>${pill.label}</span>
                <small>${count}</small>
            </button>
        `;
    }).join('');

    return `
        <nav class="store-filter-bar" aria-label="Product categories">
            ${pillsHtml}
        </nav>
    `;
}