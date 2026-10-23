import { panelLayout } from '../../components/layout.js';
import { deleteAccountModal } from '../../components/modals/delete_account_modal.js';
import { editProfileModal } from '../../components/modals/edit_profile_modal.js';
import { recoveryCodesModal } from '../../components/modals/recovery_codes_modal.js';
import { totpModal } from '../../components/modals/totp_setup_modal.js';
import { jumpBar } from '../../components/nav.js';
import { translate } from '../../utils.js';

function profileDetailTemplte(langDict) {
    return `
        <template id="tmpl-profile-detail">
            <article>
                <header>
                    <h2 class="detail-key"></h2>
                </header>
                <main class="detail-val"></main>
                <footer class="detail-footer">
                    <button class="btn icon-btn copy-btn" title="${translate(langDict, 'btn.title.copy')}"">
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
        ${jumpBar(langDict, 'User Profile Sections', translate(langDict, 'jumpbar.panel.profile.title'), [
            { id: 'user-products', label: translate(langDict, 'jumpbar.panel.profile.products') },
            { id: 'profile-details', label: translate(langDict, 'jumpbar.panel.profile.details') }
        ])}
        <section id="user-products">
            <h2>${translate(langDict, "title.products")}</h2>
            <div class="panel">
                <div class="articles-grid" id="entitlements-grid">
                    <p class="text-secondary">
                        ${translate(langDict, "description.sign_in_required")}
                    </p>
                </div>
            </div>
        </section>
        <section id="profile-details">
            <h2>${translate(langDict, "title.profile")}</h2>
            <div class="section-actions">
                <button id="btn-setup-2FA" title="${translate(langDict, 'btn.title.enable2fa')}" onclick="open2FASetup()">
                    <i class="fa-solid fa-shield-halved"></i>
                </button>
                <button title="${translate(langDict, 'btn.title.edit_profile')}" onclick="showPopup('edit-profile-popup')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="danger-button" title="${translate(langDict, 'btn.title.delete_account')}" onclick="showPopup('delete-account-popup')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="articles-grid" id="profile-details-grid"></div>
        </section>
        <!-- Templates -->
        ${profileDetailTemplte(langDict)}
        ${entitlementTemplte()}

        <!-- Modals -->
        ${editProfileModal(langDict)}
        ${deleteAccountModal(langDict)}

        <!-- 2FA Setup Modal -->
        ${totpModal(langDict)}
        ${recoveryCodesModal(langDict)}
    `;

    return panelLayout({
        page: 'profile',
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