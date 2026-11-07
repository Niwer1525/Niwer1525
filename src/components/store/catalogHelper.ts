/**
 * Formats a given amount into a currency string based on the specified currency code.
 * 
 * @param {*} amount The numeric amount to format. Can be a number or a string that can be converted to a number.
 * @param {*} currency The ISO 4217 currency code (e.g., 'USD', 'EUR') to format the amount in. Defaults to 'EUR'.
 * @returns {string} A string representing the formatted currency amount, or an empty string if the amount is invalid.
 */
export function formatCurrency(amount: number | string, currency = 'EUR'): string {
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) return '';
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(numericValue);
    } catch {
        return `${numericValue.toFixed(2)} ${currency}`;
    }
}

/**
 * Recursively extracts all packages from a category node and its subcategories, adding filter tags based on the category and subcategory slugs.
 * 
 * @param {*} node The category or subcategory node to extract packages from. 
 * @param {*} categorySlug The slug of the parent category, used to generate unique package IDs and filter tags.
 * @param {*} inheritedTags An array of tags inherited from parent categories, used to build the filterTags for each package.
 * @returns {Array} An array of package objects, each enriched with an id and filterTags.
 */
function extractPackages(node: CategoryData, categorySlug: string, inheritedTags: string[] = []): PackageData[] {
    const packages: PackageData[] = [];
    const currentTag = String(node.id ?? node.slug);
    const tags = [...inheritedTags, currentTag];

    if (Array.isArray(node.packages)) {
        node.packages.forEach((pkg: PackageData, index: number) => {
            packages.push({
                ...pkg,
                id: pkg.id || `${categorySlug}-${index + 1}`,
                filterTags: tags // e.g. ["minecraft", "niwer-engine", "licenses"]
            });
        });
    }

    if (Array.isArray(node.subcategories)) {
        node.subcategories.forEach((sub: CategoryData) => {
            packages.push(...extractPackages(sub, categorySlug, tags));
        });
    }

    return packages;
}

/**
 * Flattens a catalog structure into a single array of packages, each enriched with an id and filterTags based on their category and subcategory hierarchy.
 * 
 * @param {*} categories An array of category objects, each potentially containing packages and subcategories.
 * @returns {Array} A flat array of package objects, each with an id and filterTags.
 */
export function flattenCatalogPackages(categories: CategoryData[] = []): PackageData[] {
    return categories.flatMap((cat: CategoryData) => {
        const catSlug = String(cat.id ?? cat.slug);
        return extractPackages(cat, catSlug, [catSlug]);
    });
}
import type { CategoryData, PackageData } from '../../types.ts';