import { translate, getAccessClassForType } from '../utils.js';

function navigation(lang = 'en', langDict, buttons, additionalActionsContent = '') {
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
                            <a href="/" title="English">
                                <img loading="lazy" draggable="false" src="/assets/icons/united-kingdom.webp" alt="united_kingdom_logo">
                            </a>
                            <a href="/fr/" title="Français">
                                <img loading="lazy" draggable="false" src="/assets/icons/france.webp" alt="france_logo">
                            </a>
                        </div>
                    </li>
                </ul>
            </nav>
        </header>
    `;
}

export function defaultNavigation(lang = 'en', langDict) {
    const indexUrl = lang === 'en' ? '/index.html' : `/${lang}/index.html`;
    const storeUrl = lang === 'en' ? '/store.html' : `/${lang}/store.html`;
    return navigation(lang, langDict, [
        { url: `${indexUrl}#presentation`, labelKey: 'btn.about' },
        { url: `${indexUrl}#skills`, labelKey: 'btn.skills' },
        { url: `${indexUrl}#stats`, labelKey: 'btn.github_stats' },
        { url: `${indexUrl}#projects`, labelKey: 'btn.projects' },
        { url: `${indexUrl}#gists`, labelKey: 'btn.gists' },
        { url: storeUrl, labelKey: 'btn.store' },
        { url: '#', labelKey: 'btn.contact', onClick: "showPopup('contact-popup')" }
    ]);
}

export function panelNavigation(lang = 'en', langDict) {
    const indexUrl = lang === 'en' ? '/index.html' : `/${lang}/index.html`;
    const panelUrl = lang === 'en' ? '/panel.html' : `/${lang}/panel.html`;
    const downloadsUrl = lang === 'en' ? '/panel/downloads.html' : `/${lang}/panel/downloads.html`;
    const licensesUrl = lang === 'en' ? '/panel/licenses.html' : `/${lang}/panel/licenses.html`;
    const adminUrl = lang === 'en' ? '/panel/admin.html' : `/${lang}/panel/admin.html`;
    const profileUrl = lang === 'en' ? '/panel/profile.html' : `/${lang}/panel/profile.html`;
    return navigation(lang, langDict, [
        { url: `${indexUrl}`, labelKey: 'btn.home' },
        { url: `${panelUrl}`, labelKey: 'btn.overview' },
        { url: `${downloadsUrl}`, labelKey: 'btn.downloads' },
        { url: `${licensesUrl}`, labelKey: 'btn.licenses', accessType: 'buyer' },
        { url: `${adminUrl}`, labelKey: 'btn.admin', accessType: 'admin' },
    ], `
        <div class="dashboard-actions-grid">
            <!-- Sign In button will be shown when the user is not authenticated, while the Profile and Logout buttons will be shown when the user is authenticated. -->
            <button id="nav-signin-btn" onclick="showPopupAndSwitchTab('auth-popup', 'login')">Sign In</button>
            <button id="nav-profile-btn" title="Profile" onclick="window.location.href='${profileUrl}'">
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