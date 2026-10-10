import { formatDefaultTitle, loadMd, getValueWithFallback } from '../../utils.js';
import { formatCurrency } from './catalogHelper.js';

export async function renderPackageCard(pkg, { lang, langDict, defaultCurrency, catalogPaymentLink }) {
    const paymentLink = pkg.paymentLink || pkg.payment_link || catalogPaymentLink || '';
    if (!paymentLink) return '';

    const price = formatCurrency(pkg.displayed_price ?? pkg.price ?? 0, pkg.currency || defaultCurrency);
    const descriptionHtml = await loadMd(`src/data/store/${pkg.slug}/`, `store_description_${lang}.md`)
        .catch(() => `<p>${getValueWithFallback(langDict, 'description.unavailable', 'Description unavailable.')}</p>`);

    const images = Array.isArray(pkg.images) ? pkg.images : (pkg.image ? [pkg.image] : []);
    const activeImage = images[0] || '';

    const isSubscription = pkg.payment_type === 'subscription';
    const buttonLabel = isSubscription
        ? getValueWithFallback(langDict, 'btn.subscribe_now', 'Subscribe')
        : getValueWithFallback(langDict, 'btn.buy_now', 'Buy');

    // Build the full path: e.g. "minecraft/tools-standalone" or "minecraft/niwer-engine/licenses"
    const fullCategoryPath = [pkg.categoryId, ...(pkg.subcategoryPath || [])].filter(Boolean).join('/');

    return `
        <article class="store-package-card" 
                 data-package-id="${pkg.id}" 
                 data-category-path="${fullCategoryPath}"
                 ${pkg.price_id ? `data-price-id="${pkg.price_id}"` : ''}>
            <header class="store-package-header">
                <div>
                    <h2>${pkg.name || formatDefaultTitle(pkg.slug || 'Package')}</h2>
                </div>
                <div class="store-price">${price}</div>
            </header>

            ${activeImage ? `
                <div class="store-image-carousel" data-package-carousel="${pkg.id}">
                    <img src="${activeImage}" alt="${pkg.name || 'Package'}" loading="lazy" draggable="false">
                </div>
            ` : ''}

            <div class="store-package-description">${descriptionHtml}</div>

            <footer>
                <a class="link-button" href="${paymentLink}" rel="noopener noreferrer" target="_blank">${buttonLabel}</a>
            </footer>
        </article>
    `;
}