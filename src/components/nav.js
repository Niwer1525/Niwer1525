import { getValueWithFallback } from '../utils.js';

function navigation(lang = 'en', langDict, buttons, additionalActionsContent = '') {
    return `
        <header id="top">
            <nav>
                <!-- Mobile Navigation -->
                <input type="checkbox" id="menu-toggle">
                <label for="menu-toggle" class="menu-icon"><i class="fas fa-bars"></i></label> <!-- Mobile menu icon for navigation -->
                
                <!-- Navigation Links -->
                <ul id="nav-links">
                    <!-- Navigation buttons -->
                    ${buttons.map(button => `
                        <li id="${button.id || ''}"><a href="${button.url}" ${button.onClick ? `onclick="${button.onClick}"` : ''}>${getValueWithFallback(langDict, button.labelKey, button.defaultLabel)}</a></li>
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

export function defaultNavigation(lang = 'en', langDict) {
    const indexUrl = lang === 'en' ? '/index.html' : `/${lang}/index.html`;
    const storeUrl = lang === 'en' ? '/store.html' : `/${lang}/store.html`;
    return navigation(lang, langDict, [
        { url: `${indexUrl}#presentation`, labelKey: 'btn.about', defaultLabel: 'About' },
        { url: `${indexUrl}#skills`, labelKey: 'btn.skills', defaultLabel: 'Skills' },
        { url: `${indexUrl}#stats`, labelKey: 'btn.github_stats', defaultLabel: 'Statistics' },
        { url: `${indexUrl}#projects`, labelKey: 'btn.projects', defaultLabel: 'Projects' },
        { url: `${indexUrl}#gists`, labelKey: 'btn.gists', defaultLabel: 'Gists' },
        { url: storeUrl, labelKey: 'btn.store', defaultLabel: 'Store' },
        { url: '#', labelKey: 'btn.contact', defaultLabel: 'Contact', onClick: "showPopup('contact-popup')" }
    ]);
}

export function panelNavigation(lang = 'en', langDict) {
    const indexUrl = lang === 'en' ? '/index.html' : `/${lang}/index.html`;
    const panelUrl = lang === 'en' ? '/panel.html' : `/${lang}/panel.html`;
    const downloadsUrl = lang === 'en' ? '/panel/downloads.html' : `/${lang}/panel/downloads.html`;
    const licensesUrl = lang === 'en' ? '/panel/licenses.html' : `/${lang}/panel/licenses.html`;
    const adminUrl = lang === 'en' ? '/panel/admin.html' : `/${lang}/panel/admin.html`;
    return navigation(lang, langDict, [
        { url: `${indexUrl}`, labelKey: 'btn.home', defaultLabel: 'Home' },
        { url: `${panelUrl}`, labelKey: 'btn.overview', defaultLabel: 'Overview' },
        { url: `${downloadsUrl}`, labelKey: 'btn.downloads', defaultLabel: 'Downloads' },
        { url: `${licensesUrl}`, labelKey: 'btn.licenses', defaultLabel: 'Licenses' },
        { url: `${adminUrl}`, labelKey: 'btn.admin', defaultLabel: 'Admin' },
    ], `
        <div class="dashboard-actions-grid">
            <!-- Sign In button will be shown when the user is not authenticated, while the Profile and Logout buttons will be shown when the user is authenticated. -->
            <button id="nav-signin-btn" onclick="showPopupAndSwitchTab('auth-popup', 'login')">Sign In</button>
            <button id="nav-profile-btn" title="Profile" onclick="window.location.href='/panel/profile.html'">
                <i class="fa-solid fa-user"></i>
            </button>
            <button id="nav-logout-btn" title="Logout" onclick="logout()">
                <i class="fa-solid fa-sign-out-alt"></i>
            </button>
        </div>
    `);
}