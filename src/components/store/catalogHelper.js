export function formatCurrency(amount, currency = 'EUR') {
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return '';
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(numericValue);
    } catch {
        return `${numericValue.toFixed(2)} ${currency}`;
    }
}

function extractPackages(node, categorySlug, inheritedTags = []) {
    const packages = [];
    const currentTag = String(node.id ?? node.slug);
    const tags = [...inheritedTags, currentTag];

    if (Array.isArray(node.packages)) {
        node.packages.forEach((pkg, index) => {
            packages.push({
                ...pkg,
                id: pkg.id || `${categorySlug}-${index + 1}`,
                filterTags: tags // e.g. ["minecraft", "niwer-engine", "licenses"]
            });
        });
    }

    if (Array.isArray(node.subcategories)) {
        node.subcategories.forEach(sub => {
            packages.push(...extractPackages(sub, categorySlug, tags));
        });
    }

    return packages;
}

export function flattenCatalogPackages(categories = []) {
    return categories.flatMap(cat => {
        const catSlug = String(cat.id ?? cat.slug);
        return extractPackages(cat, catSlug, [catSlug]);
    });
}