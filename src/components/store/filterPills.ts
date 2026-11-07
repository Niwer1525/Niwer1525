import type { LangDict } from '../../types.ts';
import { translate } from '../../utils.ts';
import type { CategoryData, FilterPackage } from '../../types.ts';

export function renderFilterPills(categories: CategoryData[], visiblePackages: FilterPackage[], langDict: LangDict): string {
    const pillDefs = [
        { id: 'all', label: translate(langDict, 'store.all_categories') }
    ];

    categories.forEach((cat: CategoryData) => {
        const catId = String(cat.id ?? cat.slug);
        pillDefs.push({ id: catId, label: cat.name || catId });

        if (Array.isArray(cat.subcategories)) {
            cat.subcategories.forEach((sub: CategoryData) => {
                const subId = String(sub.id ?? sub.slug);
                pillDefs.push({ id: subId, label: sub.name || subId });
            });
        }
    });

    const pillsHtml = pillDefs.map(pill => {
        const count = pill.id === 'all'
            ? visiblePackages.length
            : visiblePackages.filter((p: FilterPackage) => p.filterTags?.includes(pill.id)).length;

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
