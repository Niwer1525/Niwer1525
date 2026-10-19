import { panelLayout } from '../../components/layout.js';
import { getValueWithFallback } from '../../utils.js';
import { jumpBar } from '../../components/nav.js';

export async function render(lang, langDict) {
    const content = `
        ${jumpBar(langDict, 'User Profile Sections', getValueWithFallback(langDict, 'panel.user_profile', 'User Profile Sections'), [
            { id: 'user-products', label: getValueWithFallback(langDict, 'panel.user_products', 'Your Products') },
            { id: 'profile-details', label: getValueWithFallback(langDict, 'panel.profile_details', 'Your Profile') }
        ])}
        <section id="section-user-products">
            <h2>Your Products</h2>
            <div class="panel">
                <div class="articles-grid" id="entitlementsGrid">
                    <p class="text-secondary">Sign in to view your products.</p>
                </div>
            </div>
        </section>
        <section id="section-profile-details">
            <h2>Your Profile</h2>
            <div class="section-actions">
                <button class="btn icon-btn" id="btnSetup2FA" title="Configure 2FA" onclick="App.open2FASetup()">
                    <i class="fa-solid fa-shield-halved"></i>
                </button>
                <button id="btnEditProfile" class="btn primary icon-btn" title="Edit Profile">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button id="btnDeleteAccount" class="btn danger icon-btn" title="Delete Account" style="color: var(--danger-color, #ef4444);">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="articles-grid" id="profileDetailsGrid"></div>
        </section>
    `;

    return panelLayout({
        lang,
        langDict,
        title: 'Dashboard - User Profile | Erwin Redoté',
        description: 'Manage your account, view your products, and configure your profile settings on the user profile page of the dashboard.',
        canonical: 'https://niwer.dev/panel/user_profile.html',
        content,
        additionalScripts: [
            {
                file: '/js/panel.js',
                defer: true,
                type: 'module'
            },
			{
				file: '/js/panel/auth.js',
				defer: true,
                type: 'module'
			},
			{
				file: '/js/panel/user_profile.js',
				defer: true,
                type: 'module'
			}
        ]
    });
}