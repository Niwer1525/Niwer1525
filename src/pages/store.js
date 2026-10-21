import { defaultLayout } from '../components/layout.js';
import { loadJson, getValueWithFallback } from '../utils.js';
import { renderPackageCard } from '../components/store/packageCard.js';
import { jumpBar } from '../components/nav.js';
import { sectionAlert } from '../components/section_alerts.js';

// Recursive helper to render sections and collect anchor links
async function renderCategorySections(node, parentPath, context, outLinks) {
    const id = String(node.id ?? node.slug);
    const currentPath = parentPath ? `${parentPath}-${id}` : id;
    const sectionId = `section-${currentPath}`;
    const displayName = node.name || id;

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
                <div class="articles-grid">
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

export async function render(lang = 'en', langDict = {}) {
    const catalog = await loadJson('src/data/', 'store_catalog.json');
    const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
    const context = {
        lang,
        langDict,
        defaultCurrency: catalog.currency || 'EUR',
        catalogPaymentLink: catalog.paymentLink || ''
    };

    const jumpLinks = [];
    let sectionsHtml = '';

    for (const cat of categories) sectionsHtml += await renderCategorySections(cat, '', context, jumpLinks);
    
    const alertActionButon = `
        <a href="/panel" class="button" onclick="showPopupAndSwitchTab('auth-popup', 'login')">
            ${getValueWithFallback(langDict, 'store.alert.action', 'Sign In')} <i class="fa-solid fa-arrow-right"></i>
        </a>
    `;

    const content = `
        <div class="store-container">
            ${jumpLinks.length > 0 ? jumpBar(langDict, 'Store Sections', getValueWithFallback(langDict, 'store.categories', 'Categories'), jumpLinks) : ''}
            <div class="store-sections-wrapper">
                ${sectionsHtml || `<article class="store-empty-card"><header><h2>${getValueWithFallback(langDict, 'store.no_packages', 'No packages available')}</h2></header><p>${getValueWithFallback(langDict, 'store.no_packages_copy', 'Try another category or come back later.')}</p></article>`}
            </div>
        </div>
        <section>
            ${sectionAlert(
                'fa-solid fa-basket-shopping', 
                getValueWithFallback(langDict, 'store.alert.title', 'Already bought or subscribed to a product?'),
                getValueWithFallback(langDict, 'store.alert.description', 'Sign in to access your downloads and licenses.'),
                alertActionButon
        )}
        </section>
    `;

    return defaultLayout({
        lang,
        langDict,
        title: `${getValueWithFallback(langDict, 'btn.store', 'Store')} | Erwin Redoté (Niwer)`,
        description: 'Explore software products, Minecraft mods, and development services by Erwin Redoté.',
        canonical: 'https://niwer.dev/store.html',
        content,
        additionalScripts: [
            {
                file: '/js/store.js',
                defer: true,
                type: 'module'
            }
        ]
    });
}