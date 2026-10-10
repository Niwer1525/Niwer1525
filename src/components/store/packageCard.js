import { formatDefaultTitle, loadMd, getValueWithFallback } from '../../utils.js';
import { formatCurrency } from './catalogHelper.js';

export async function renderPackageCard(pkg, { lang, langDict, defaultCurrency, catalogPaymentLink }) {
    const paymentLink = pkg.paymentLink || pkg.payment_link || catalogPaymentLink || '';
    if (!paymentLink) return '';

    const price = formatCurrency(pkg.displayed_price ?? pkg.price ?? 0, pkg.currency || defaultCurrency);
    const descriptionHtml = await loadMd(`src/data/store/${pkg.slug}/`, `store_description_${lang}.md`)
        .catch(() => `<p>${getValueWithFallback(langDict, 'description.unavailable', 'Description unavailable.')}</p>`);

    const images = Array.isArray(pkg.images) && pkg.images.length > 0 
        ? pkg.images 
        : (pkg.image ? [pkg.image] : []);

    const carouselHtml = images.length > 0 ? `
        <div class="store-image-carousel">
            <div class="store-carousel-track">
                ${images.map((src, idx) => `
                    <div class="store-carousel-slide">
                        <img src="${src}" alt="${pkg.name || 'Package'} preview${idx + 1}" loading="lazy" draggable="false">
                    </div>
                `).join('')}
            </div>

            ${images.length > 1 ? `
                <button type="button" class="store-carousel-button prev" data-carousel-prev aria-label="Previous image">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" class="store-carousel-button next" data-carousel-next aria-label="Next image">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>

                <div class="store-carousel-dots">
                    ${images.map((_, idx) => `
                        <button type="button" class="store-carousel-dot ${idx === 0 ? 'is-active' : ''}" data-carousel-dot="${idx}" aria-label="Slide ${idx + 1}"></button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    ` : '';

    const isSubscription = pkg.payment_type === 'subscription';
    const buttonLabel = isSubscription
        ? getValueWithFallback(langDict, 'btn.subscribe_now', 'Subscribe')
        : getValueWithFallback(langDict, 'btn.buy_now', 'Buy');

    return `
        <article class="store-package-card" data-package-id="${pkg.id}" ${pkg.price_id ? `data-price-id="${pkg.price_id}"` : ''}>
            <header class="store-package-header">
                <div>
                    <h3>${pkg.name || formatDefaultTitle(pkg.slug || 'Package')}</h3>
                </div>
                <div class="store-price">${price}</div>
            </header>

            ${carouselHtml}

            <div class="store-package-description">${descriptionHtml}</div>

            <footer>
                <a class="link-button" href="${paymentLink}" rel="noopener noreferrer" target="_blank">${buttonLabel}</a>
            </footer>
        </article>
    `;
}