import { panelLayout } from '../../components/layout.js';
import { deleteAccountModal } from '../../components/modals/delete_account_modal.js';
import { editProfileModal } from '../../components/modals/edit_profile_modal.js';
import { totpModal } from '../../components/modals/totp_setup_modal.js';
import { jumpBar } from '../../components/nav.js';
import { getValueWithFallback } from '../../utils.js';

function profileDetailTemplte() {
    return `
        <template id="tmpl-profile-detail">
            <article>
                <header>
                    <h2 class="detail-key"></h2>
                </header>
                <main class="detail-val"></main>
                <footer class="detail-footer">
                    <button class="btn icon-btn copy-btn" title="Copy">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </footer>
            </article>
        </template>
    `;
}

function entitlementTemplte() {
    return `
        <template id="tmpl-entitlement-card">
            <article>
                <header>
                    <h2 class="entitlement-name"></h2>
                    <span class="text-secondary entitlement-type"></span>
                </header>
                <footer>
                    <span class="text-secondary entitlement-expiry"></span>
                    <span class="license-badge entitlement-status"></span>
                </footer>
            </article>
        </template>
    `;
}

export async function render(lang, langDict) {
    const content = `
        ${jumpBar(langDict, 'User Profile Sections', getValueWithFallback(langDict, 'panel.user_profile', 'User Profile Sections'), [
            { id: 'user-products', label: getValueWithFallback(langDict, 'panel.user_products', 'Your Products') },
            { id: 'profile-details', label: getValueWithFallback(langDict, 'panel.profile_details', 'Your Profile') }
        ])}
        <section id="user-products">
            <h2>Your Products</h2>
            <div class="panel">
                <div class="articles-grid" id="entitlements-grid">
                    <p class="text-secondary">Sign in to view your products.</p>
                </div>
            </div>
        </section>
        <section id="profile-details">
            <h2>Your Profile</h2>
            <div class="section-actions">
                <button id="btn-setup-2FA" title="Configure 2FA" onclick="open2FASetup()">
                    <i class="fa-solid fa-shield-halved"></i>
                </button>
                <button title="Edit Profile" onclick="showPopup('edit-profile-popup')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="danger-button" title="Delete Account" onclick="showPopup('delete-account-popup')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="articles-grid" id="profile-details-grid"></div>
        </section>
        <!-- Templates -->
        ${profileDetailTemplte()}
        ${entitlementTemplte()}

        <!-- Modals -->
        ${editProfileModal(langDict)}
        ${deleteAccountModal(langDict)}

        <!-- 2FA Setup Modal -->
        ${totpModal(langDict)}
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