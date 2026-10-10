export function formatCurrency(amount, currency = 'EUR') {
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return '';
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(numericValue);
    } catch {
        return `${numericValue.toFixed(2)} ${currency}`;
    }
}

// Recursively collects all packages with their correct nested branch path
function extractPackagesFromNode(node, categoryId, currentPath = []) {
    const packages = [];

    // Packages directly on this node
    if (Array.isArray(node.packages)) {
        node.packages.forEach((pkg, index) => {
            packages.push({
                ...pkg,
                id: pkg.id || `${categoryId}-${currentPath.join('-')}-${index + 1}`,
                categoryId: String(categoryId),
                subcategoryPath: [...currentPath] // e.g. ["niwer-engine", "licenses"] or ["tools-standalone"]
            });
        });
    }

    // Recurse into subcategories
    if (Array.isArray(node.subcategories)) {
        node.subcategories.forEach((sub) => {
            const subId = String(sub.id ?? sub.slug);
            packages.push(...extractPackagesFromNode(sub, categoryId, [...currentPath, subId]));
        });
    }

    return packages;
}

export function flattenCatalogPackages(categories = []) {
    return categories.flatMap((cat) => {
        const catId = String(cat.id ?? cat.slug);
        return extractPackagesFromNode(cat, catId, []);
    });
}