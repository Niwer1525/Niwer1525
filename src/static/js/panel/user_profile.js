import { formatDate, formatVal, formatCamelCasedString, formatProductId } from '../main.js';
import { panelState } from '../panel.js';
import { copyToClipboardWithNotification } from '../utils/clipboard.js';

const COPYABLE_FIELDS = ['username', 'uuid', 'email', 'discordAuthCode', 'discordId'];

/**
 * Sets up a profile detail card with the provided key and value.
 */
function setupProfileDetail(root, [key, val]) {
    root.querySelector('.detail-key').textContent = formatCamelCasedString(key) || key; // Or formatCamelCasedString(key) if desired
    root.querySelector('.detail-val').textContent = formatVal(val);

    const footer = root.querySelector('.detail-footer');
    if (COPYABLE_FIELDS.includes(key) && val) root.querySelector('.copy-btn').dataset.copy = String(val);
    else if (footer) footer.remove();

    return root;
}

/**
 * Sets up an entitlement card with the provided entitlement object.
 */
function setupEntitlementCard(root, entitlement) {
    const isActive = String(entitlement.status || '').toUpperCase() === 'ACTIVE';
    const type = entitlement.type === 'ONE_TIME' ? 'One-time purchase' : 'Subscription';
    const expiryText = entitlement.type === 'SUBSCRIPTION'
        ? (entitlement.expiresAt ? formatDate(entitlement.expiresAt) : 'No expiry date')
        : (entitlement.expiresAt ? formatDate(entitlement.expiresAt) : null);

    root.querySelector('.entitlement-name').textContent = formatProductId(entitlement.productId) || 'Unknown product';
    root.querySelector('.entitlement-type').textContent = type;

    const expiryEl = root.querySelector('.entitlement-expiry');
    if (expiryEl) {
        if (expiryText) expiryEl.textContent = `Expires: ${expiryText}`;
        else expiryEl.remove();
    }

    const statusBadge = root.querySelector('.entitlement-status');
    if (statusBadge) {
        statusBadge.textContent = entitlement.status || 'UNKNOWN';
        statusBadge.classList.add(isActive ? 'active' : 'inactive');
    }

    return root;
}

export function loadProfileDetails() {
    const editUser = document.getElementById('editUsername');
    const editEmail = document.getElementById('editEmail');
    if (editUser) editUser.value = panelState.account.username || '';
    if (editEmail) editEmail.value = panelState.account.email || '';

    /* Render Profile Details */
    const grid = document.getElementById('profile-details-grid');
    const detailTmpl = document.getElementById('tmpl-profile-detail');
    if (grid && detailTmpl) {
        if (!grid.dataset.bound) {
            grid.onclick = (e) => {
                const btn = e.target.closest('.copy-btn');
                if (btn?.dataset.copy) copyToClipboardWithNotification(btn.dataset.copy, `Copied ${btn.dataset.copy} to clipboard!`);
            };
            grid.dataset.bound = 'true';
        }

        const fragment = document.createDocumentFragment();
        Object.entries(panelState.account || {}).forEach((entry) => {
            fragment.append(setupProfileDetail(detailTmpl.content.cloneNode(true), entry));
        });
        grid.replaceChildren(fragment);
    }

    /* Render Entitlements */
    const entitlementsGrid = document.getElementById('entitlements-grid');
    const entitlementTmpl = document.getElementById('tmpl-entitlement-card');
    if (entitlementsGrid && entitlementTmpl) {
        const entitlements = panelState.entitlements || [];
        if (!entitlements.length) entitlementsGrid.innerHTML = '<p class="text-secondary">No products linked to this account.</p>';
        else {
            const fragment = document.createDocumentFragment();
            entitlements.forEach((e) => {
                fragment.append(setupEntitlementCard(entitlementTmpl.content.cloneNode(true), e));
            });
            entitlementsGrid.replaceChildren(fragment);
        }
    }

    /* 2FA Button State */
    const btn2fa = document.getElementById('btn-setup-2FA');
    if (btn2fa && panelState.account) {
        const has2FA = Boolean(panelState.account.totpEnabled);
        btn2fa.style.color = has2FA ? 'var(--success-color)' : 'var(--text-secondary)';
        btn2fa.title = has2FA ? '2FA Enabled (Click to disable)' : 'Enable 2FA';
        btn2fa.innerHTML = has2FA ? '<i class="fa-solid fa-shield"></i>' : '<i class="fa-solid fa-shield-halved"></i>';
    }
}