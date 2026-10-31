import { defaultLayout } from '../components/layout.js';
import { loadJson, translate } from '../utils.js';
import { renderPackageCard } from '../components/store/packageCard.js';
import { jumpBar } from '../components/nav.js';
import { sectionAlert } from '../components/section_alerts.js';

function slugify(value) {
    return String(value)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'category';
}

// Recursive helper to render sections and collect anchor links
async function renderCategorySections(node, parentPath, context, outLinks) {
    const id = slugify(node.id ?? node.slug ?? node.name);
    const currentPath = parentPath ? `${parentPath}-${id}` : id;
    const sectionId = `section-${currentPath}`;
    const displayName = node.name || node.id || node.slug || id;

    let html = '';
    const validPackages = (node.packages || []).filter(p => Boolean(p.paymentLink || p.payment_link || context.catalogPaymentLink));

    // Render cards directly on this category or subcategory
    if (validPackages.length > 0) {
        outLinks.push({ id: sectionId, label: displayName, count: validPackages.length });

        const cardsHtml = (await Promise.all(
            validPackages.map(pkg => renderPackageCard({ ...pkg, categoryId: id }, context))
        )).join('');

        const headingTag = parentPath ? 'h3' : 'h2';

        html += `
            <section class="store-section" id="${sectionId}">
                <header class="store-section-header">
                    <${headingTag}>${displayName}</${headingTag}>
                </header>
                <div class="articles-grid large-card">
                    ${cardsHtml}
                </div>
            </section>
        `;
    }

    // Recurse into nested subcategories
    if (Array.isArray(node.subcategories) && node.subcategories.length > 0) {
        for (const sub of node.subcategories) html += await renderCategorySections(sub, currentPath, context, outLinks);
    }

    return html;
}

async function fetchStripePrices(apiBaseUrl) {
    try {
        const response = await fetch(`${apiBaseUrl}/stripe_prices`);
        if (!response.ok) throw new Error(`Could not fetch Stripe prices: ${response.statusText}`);

        const payload = await response.json();
        const prices = Array.isArray(payload) ? payload : payload.data;
        if (!Array.isArray(prices)) throw new Error('Stripe prices response does not contain a data array');

        const byId = {};
        const byProduct = {};
        for (const price of prices) {
            if (!price?.id || price.unit_amount == null) continue;

            const value = {
                amount: Number(price.unit_amount) / 100,
                currency: price.currency || 'EUR'
            };
            byId[price.id] = value;

            const productId = price.product?.metadata?.product_id;
            if (productId) {
                const productKey = String(productId).replace(/-/g, '_');
                (byProduct[productKey] ||= []).push({
                    ...value,
                    id: price.id,
                    isDefault: price.product.default_price === price.id
                });
            }
        }

        return { byId, byProduct };
    } catch (error) {
        console.error('Error loading Stripe prices:', error);
        return {};
    }
}

export async function render(lang = 'en', langDict = {}, { apiBaseUrl = '' } = {}) {
    const catalog = await loadJson('src/data/', 'store_catalog.json');
    const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
    const stripePrices = await fetchStripePrices(apiBaseUrl);
    const context = {
        lang,
        langDict,
        defaultCurrency: catalog.currency || 'EUR',
        catalogPaymentLink: catalog.paymentLink || '',
        stripePrices
    };

    const jumpLinks = [];
    let sectionsHtml = '';

    for (const cat of categories) sectionsHtml += await renderCategorySections(cat, '', context, jumpLinks);
    
    const alertActionButon = `
        <a href="/panel" class="button" onclick="showPopupAndSwitchTab('auth-popup', 'login')">
            ${translate(langDict, 'store.alert.action')} <i class="fa-solid fa-arrow-right"></i>
        </a>
    `;

    const content = `
        <div class="store-container">
            ${jumpLinks.length > 0 ? jumpBar(langDict, 'Store Sections', translate(langDict, 'store.categories'), jumpLinks) : ''}
            <div class="store-sections-wrapper">
                ${sectionsHtml || `<article class="store-empty-card"><header><h2>${translate(langDict, 'store.no_packages')}</h2></header><p>${translate(langDict, 'store.no_packages_copy')}</p></article>`}
            </div>
        </div>
        <section>
            ${sectionAlert(
                'fa-solid fa-basket-shopping', 
                translate(langDict, 'store.alert.title'),
                translate(langDict, 'store.alert.description'),
                alertActionButon
        )}
        </section>
    `;

    return defaultLayout({
        page: 'store',
        lang,
        langDict,
        title: `${translate(langDict, 'btn.store')} | Erwin Redoté (Niwer)`,
        description: 'Explore software products, Minecraft mods, and development services by Erwin Redoté.',
        canonical: 'https://niwer.dev/store.html',
        content
    });
}