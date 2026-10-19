import { escapeHtml, formatDate, formatVal, formatCamelCasedString, formatProductId } from '../main.js';
import { panelState } from '../panel.js';
import { copyToClipboard } from '../utils/clipboard.js';

export function loadProfileDetails() {
    const editUser = document.getElementById('editUsername');
    const editEmail = document.getElementById('editEmail');
    if (editUser) editUser.value = panelState.account.username || '';
    if (editEmail) editEmail.value = panelState.account.email || '';

    // Render Account Grid
    const grid = document.getElementById('profileDetailsGrid');
    if (grid) {
        const copyable = ['username', 'uuid', 'email', 'discordAuthCode', 'discordId'];

        grid.innerHTML = Object.entries(panelState.account)
            .map(([key, val]) => {
                const v = formatVal(val);
                const isCopyable = copyable.includes(key) && val;
                return `
                    <article>
                        <header>
                            <h2>${escapeHtml(key)}</h2>
                        </header>
                        <main>${escapeHtml(v)}</main>
                        ${isCopyable ? `
                            <footer>
                                <button class="btn icon-btn copy-btn" data-copy="${escapeHtml(String(val))}" title="Copy">
                                    <i class="fa-regular fa-copy"></i>
                                </button>
                            </footer>
                        ` : ''}
                    </article>
                `;
            }).join('');

        grid.querySelectorAll('.copy-btn').forEach((btn) => {
            btn.addEventListener('click', () => copyToClipboard(btn.dataset.copy));
        });
    }

    // Render Entitlements
    const entitlementsGrid = document.getElementById('entitlementsGrid');
    if (entitlementsGrid) {
        entitlementsGrid.innerHTML = panelState.entitlements.length ? panelState.entitlements.map((entitlement) => {
            const isActive = String(entitlement.status || '').toUpperCase() === 'ACTIVE';
            const type = entitlement.type === 'ONE_TIME' ? 'One-time purchase' : 'Subscription';
            const expiryText = entitlement.type === 'SUBSCRIPTION' 
                ? (entitlement.expiresAt ? formatDate(entitlement.expiresAt) : 'No expiry date')
                : (entitlement.expiresAt ? formatDate(entitlement.expiresAt) : null);

            return `
                <article>
                    <header>
                        <h2>${escapeHtml(formatProductId(entitlement.productId) || 'Unknown product')}</h2>
                        <span class="text-secondary">${type}</span>
                    </header>
                    <footer>
                        ${expiryText ? `<span class="text-secondary">Expires: ${escapeHtml(expiryText)}</span>` : ''}
                        <span class="license-badge ${isActive ? 'active' : 'inactive'}">
                            ${escapeHtml(entitlement.status || 'UNKNOWN')}
                        </span>
                    </footer>
                </article>
            `;
        }).join('') : '<p class="text-secondary">No products linked to this account.</p>';
    }

    // Configure 2FA Button State
    const btn2fa = document.getElementById('btnSetup2FA');
    if (btn2fa && panelState.account) {
        const isEnabled = !!panelState.account.totpEnabled;
        btn2fa.style.color = isEnabled ? 'var(--success-color)' : 'var(--text-secondary)';
        btn2fa.title = isEnabled ? '2FA Enabled (Click to disable)' : 'Enable 2FA';
        btn2fa.innerHTML = isEnabled 
            ? '<i class="fa-solid fa-shield"></i>' 
            : '<i class="fa-solid fa-shield-halved"></i>';
    }
}