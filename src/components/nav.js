import { translate, getAccessClassForType } from '../utils.js';

function getHrefForPage(page, lang) {
    const isDefaultLang = lang === 'en';
    switch (page) {
        case 'index': return isDefaultLang ? '/index.html' : `/${lang}/index.html`;
        case 'store': return isDefaultLang ? '/store.html' : `/${lang}/store.html`;
        case 'blog': return isDefaultLang ? '/blog/' : `/${lang}/blog/`;
        case 'legal': return isDefaultLang ? '/legal.html' : `/${lang}/legal.html`;

        /* Panel Pages */
        case 'panel': return isDefaultLang ? '/panel.html' : `/${lang}/panel.html`;
        case 'downloads': return isDefaultLang ? '/panel/downloads.html' : `/${lang}/panel/downloads.html`;
        case 'licenses': return isDefaultLang ? '/panel/licenses.html' : `/${lang}/panel/licenses.html`;
        case 'admin': return isDefaultLang ? '/panel/admin.html' : `/${lang}/panel/admin.html`;
        case 'profile': return isDefaultLang ? '/panel/profile.html' : `/${lang}/panel/profile.html`;
        default: return isDefaultLang ? '/index.html' : `/${lang}/index.html`;
    }
}

function navigation(page, lang = 'en', langDict, buttons, additionalActionsContent = '') {
    return `
        <header id="top">
            <nav>
                <!-- Mobile Navigation -->
                <input type="checkbox" id="menu-toggle">
                <label for="menu-toggle" class="menu-icon">
                    <i class="fas fa-bars"></i>
                </label>
                
                <!-- Navigation Links -->
                <ul id="nav-links">
                    <!-- Navigation buttons -->
                    ${buttons.map(button => `
                        <li id="${button.id || ''}" class="${getAccessClassForType(button.accessType)}"><a href="${button.url}" ${button.onClick ? `onclick="${button.onClick}"` : ''}>${translate(langDict, button.labelKey)}</a></li>
                    `).join('')}

                    <!-- Theme Toggle and Language Selection -->
                    <li class="nav-actions">
                        <!-- Additional content can be added here -->
                        ${additionalActionsContent}

                        <!-- Theme Toggle Button -->
                        <button id="theme-toggle" type="button" aria-label="Theme mode" title="System">
                            <i class="fa-solid fa-circle-half-stroke"></i>
                        </button>

                        <!-- Language Selection -->
                        <div class="languages-grid">
                            <a href="${getHrefForPage(page, 'en')}" title="English">
                                <img loading="lazy" draggable="false" src="/assets/icons/united-kingdom.webp" alt="united_kingdom_logo">
                            </a>
                            <a href="${getHrefForPage(page, 'fr')}" title="Français">
                                <img loading="lazy" draggable="false" src="/assets/icons/france.webp" alt="france_logo">
                            </a>
                        </div>
                    </li>
                </ul>
            </nav>
        </header>
    `;
}

export function defaultNavigation(page, lang = 'en', langDict) {
    const indexUrl = getHrefForPage('index', lang);
    return navigation(page, lang, langDict, [
        { url: `${indexUrl}#presentation`, labelKey: 'btn.about' },
        { url: `${indexUrl}#skills`, labelKey: 'btn.skills' },
        { url: `${indexUrl}#stats`, labelKey: 'btn.github_stats' },
        { url: `${indexUrl}#projects`, labelKey: 'btn.projects' },
        { url: `${indexUrl}#gists`, labelKey: 'btn.gists' },
        { url: getHrefForPage('store', lang), labelKey: 'btn.store' },
        { url: getHrefForPage('blog', lang), labelKey: 'btn.blog' },
        { url: '#', labelKey: 'btn.contact', onClick: "showPopup('contact-popup')" }
    ]);
}

export function panelNavigation(page, lang = 'en', langDict) {
    return navigation(page, lang, langDict, [
        { url: getHrefForPage('index', lang), labelKey: 'btn.home' },
        { url: getHrefForPage('panel', lang), labelKey: 'btn.overview' },
        { url: getHrefForPage('downloads', lang), labelKey: 'btn.download' },
        { url: getHrefForPage('licenses', lang), labelKey: 'btn.licenses', accessType: 'buyer' },
        { url: getHrefForPage('admin', lang), labelKey: 'btn.admin', accessType: 'admin' },
    ], `
        <div class="dashboard-actions-grid">
            <!-- Sign In button will be shown when the user is not authenticated, while the Profile and Logout buttons will be shown when the user is authenticated. -->
            <button id="nav-signin-btn" onclick="showPopupAndSwitchTab('auth-popup', 'login')">${translate(langDict, "btn.signin")}</button>
            <button id="nav-profile-btn" title="Profile" onclick="window.location.href='${getHrefForPage('profile', lang)}'">
                <i class="fa-solid fa-user"></i>
            </button>
            <button id="nav-logout-btn" title="Logout" onclick="logout()">
                <i class="fa-solid fa-sign-out-alt"></i>
            </button>
        </div>
    `);
}

export function jumpBar(langDict, hoverLabel = 'Sub Sections', title, jumpLinks = []) {
    return `
        <div class="jump-bar-container">
            <nav class="jump-bar" aria-label="${hoverLabel}">
                <span class="jump-title">${title}:</span>
                <div class="jump-links">
                    ${jumpLinks.map(link => `
                        <a href="#${link.id}" class="jump-pill">
                            <span>${link.label}</span>
                            ${link.count ? `<small>${link.count}</small>` : ''}
                        </a>
                    `).join('')}
                </div>
            </nav>
        </div>
    `;
}