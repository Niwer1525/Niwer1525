import { layout } from '../components/layout.js';
import { loadJson, getValueWithFallback } from '../utils.js';
import { flattenCatalogPackages } from '../components/store/catalogHelper.js';
import { renderPackageCard } from '../components/store/packageCard.js';
import { renderCategoriesSidebar } from '../components/store/categoriesSidebar.js';

export async function render(lang = 'en', langDict = {}) {
    const catalog = await loadJson('src/data/', 'store_catalog.json');
    const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
    const defaultCurrency = catalog.currency || 'EUR';

    /* Process data */
    const allPackages = flattenCatalogPackages(categories);
    const visiblePackages = allPackages.filter(p => Boolean(String(p.paymentLink || p.payment_link || catalog.paymentLink || '').trim()));

    /* Render sidebar component */
    const sidebarHtml = renderCategoriesSidebar(categories, visiblePackages, langDict);

    /* Render package cards component */
    const packageCards = await Promise.all(
        allPackages.map(pkg => renderPackageCard(pkg, {
            lang,
            langDict,
            defaultCurrency,
            catalogPaymentLink: catalog.paymentLink
        }))
    );

    const emptyFallback = `
        <article class="store-empty-card">
            <header><h2>${getValueWithFallback(langDict, 'store.no_packages', 'No packages available')}</h2></header>
            <p>${getValueWithFallback(langDict, 'store.no_packages_copy', 'Try another category or come back later.')}</p>
        </article>
    `;

    const content = `
        <section class="store-shell" id="store-shell">
            ${sidebarHtml}
            <section class="store-content">
                <div id="projects-grid" class="articles-grid">
                    ${packageCards.filter(Boolean).join('') || emptyFallback}
                </div>
            </section>
        </section>
    `;

    return layout({
        lang,
        langDict,
        title: `${getValueWithFallback(langDict, 'btn.store', 'Store')} | Erwin Redoté (Niwer)`,
        description: 'Explore software products, Minecraft mods, and development services by Erwin Redoté.',
        canonical: 'https://niwer.dev/store.html',
        content,
        additionalScripts: [
            {
                file: '/js/store/controller.js',
                defer: true,
                type: 'module'
            }
        ]
    });
}