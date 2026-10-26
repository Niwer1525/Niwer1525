import { formatDefaultTitle, loadMd, translate } from '../../utils.js';
import { formatCurrency } from './catalogHelper.js';

export async function renderPackageCard(pkg, { lang, langDict, defaultCurrency, catalogPaymentLink, stripePrices }) {
    const paymentLink = pkg.paymentLink || pkg.payment_link || catalogPaymentLink || '';
    if (!paymentLink) return '';

    const packageSlug = String(pkg.slug).replace(/-/g, '_');
    const productKey = Object.keys(stripePrices?.byProduct || {})
        .find(key => packageSlug === key || packageSlug.startsWith(`${key}_`));
    const productPrices = stripePrices?.byProduct?.[productKey] || [];
    const stripePrice = stripePrices?.byId?.[pkg.price_id]
        || productPrices.find(price => price.isDefault && !/developer/i.test(pkg.name || ''))
        || productPrices.sort((a, b) => a.amount - b.amount)[/developer/i.test(pkg.name || '') ? productPrices.length - 1 : 0];
    const price = formatCurrency(
        stripePrice?.amount ?? pkg.displayed_price ?? pkg.price ?? 0,
        stripePrice?.currency || pkg.currency || defaultCurrency
    );
    const descriptionHtml = await loadMd(`src/data/store/${pkg.slug}/`, `store_description_${lang}.md`)
        .catch(() => `<p>${translate(langDict, 'description.unavailable')}</p>`);

    const images = Array.isArray(pkg.images) && pkg.images.length > 0 
        ? pkg.images 
        : (pkg.image ? [pkg.image] : []);

    const carouselHtml = images.length > 0 ? `
        <div class="image-carousel">
            <div class="carousel-track">
                ${images.map((src, idx) => `
                    <div class="carousel-slide">
                        <img src="${src}" alt="${pkg.name || 'Package'} preview${idx + 1}" loading="lazy" draggable="false">
                    </div>
                `).join('')}
            </div>

            ${images.length > 1 ? `
                <button type="button" class="carousel-button prev" data-carousel-prev aria-label="Previous image">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" class="carousel-button next" data-carousel-next aria-label="Next image">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>

                <div class="carousel-dots">
                    ${images.map((_, idx) => `
                        <button type="button" class="carousel-dot ${idx === 0 ? 'is-active' : ''}" data-carousel-dot="${idx}" aria-label="Slide ${idx + 1}"></button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    ` : '';

    const isSubscription = pkg.payment_type === 'subscription';
    const buttonLabel = isSubscription
        ? translate(langDict, 'btn.subscribe_now')
        : translate(langDict, 'btn.buy_now');

    return `
        <article class="store-package-card" data-package-id="${pkg.id}" ${pkg.price_id ? `data-price-id="${pkg.price_id}"` : ''}>
            <header class="store-package-header">
                <div>
                    <h3>${pkg.name || formatDefaultTitle(pkg.slug || 'Package')}</h3>
                </div>
            </header>
            ${carouselHtml}
            <main>
                <div class="text-content">${descriptionHtml}</div>
            </main>
            <footer>
                <div class="store-price">${price}</div>
                <a class="button" href="${paymentLink}" rel="noopener noreferrer" target="_blank">${buttonLabel}</a>
            </footer>
        </article>
    `;
}