import { getValueWithFallback } from '../utils.js';

export function nav(lang = 'en', langDict) {
    const indexUrl = lang === 'en' ? '/index.html' : `/${lang}/index.html`;
    const storeUrl = lang === 'en' ? '/store.html' : `/${lang}/store.html`;
    return `
        <header id="top">
            <nav>
                <!-- Mobile Navigation -->
                <input type="checkbox" id="menu-toggle">
                <label for="menu-toggle" class="menu-icon"><i class="fas fa-bars"></i></label> <!-- Mobile menu icon for navigation -->
                
                <!-- Navigation Links -->
                <ul id="nav-links">
                    <li><a href="${indexUrl}#presentation">${getValueWithFallback(langDict, 'btn.about', 'About')}</a></li>
                    <li><a href="${indexUrl}#skills">${getValueWithFallback(langDict, 'btn.skills', 'Skills')}</a></li>
                    <li><a href="${indexUrl}#stats">${getValueWithFallback(langDict, 'btn.github_stats', 'Statistics')}</a></li>
                    <li><a href="${indexUrl}#projects">${getValueWithFallback(langDict, 'btn.projects', 'Projects')}</a></li>
                    <li><a href="${indexUrl}#gists">${getValueWithFallback(langDict, 'btn.gists', 'Gists')}</a></li>
                    <li><a href="${storeUrl}">${getValueWithFallback(langDict, 'btn.store', 'Store')}</a></li>
                    <li><a href="#" onclick="showContactPopup()">${getValueWithFallback(langDict, 'btn.contact', 'Contact')}</a></li>
                    <li class="nav-actions">
                        <button id="theme-toggle" type="button" aria-label="Theme mode" title="Theme mode">
                            <i class="fa-solid fa-circle-half-stroke"></i>
                            <span id="theme-toggle-label">System</span>
                        </button>
                        <div class="languages-grid">
                            <a href="/">
                                <img loading="lazy" draggable="false" src="/assets/icons/united-kingdom.webp" alt="united_kingdom_logo">
                            </a>
                            <a href="/fr/">
                                <img loading="lazy" draggable="false" src="/assets/icons/france.webp" alt="france_logo">
                            </a>
                        </div>
                    </li>
                </ul>
            </nav>
        </header>
    `;
}