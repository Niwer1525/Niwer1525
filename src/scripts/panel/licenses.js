import { escapeHtml, formatDate, handleFormSubmit } from '../main.js';
import { api, panelState } from '../panel.js';
import { closeModals } from '../utils/modals.js';
import { createNotification } from '../utils/toast.js';
import { copyToClipboardWithNotification } from '../utils/clipboard.js';

/**
 * Sets up a license row with the provided data.
 */
function setupLicenseRow(root, license) {
    const status = String(license.status || license.state || 'UNKNOWN').toUpperCase();
    const isExpired = status === 'EXPIRED' || (license.expiresAt && new Date(license.expiresAt) < new Date());
    const isRevoked = status === 'REVOKED';
    const key = license.licenseKey || license.key || '';

    // Populate text content safely
    root.querySelector('.license-name').textContent = license.name || license.customerName || '—';
    root.querySelector('.license-product').textContent = license.productId || license.product_id || '—';
    root.querySelector('.license-created').textContent = formatDate(license.createdAt || license.created_at).split(',')[0];
    root.querySelector('.license-expires').textContent = formatDate(license.expiresAt || license.expires_at).split(',')[0];
    root.querySelector('.license-key').textContent = key || '—';

    // Status Badge
    const badge = root.querySelector('.license-badge');
    badge.textContent = status;
    if (status === 'ACTIVE') badge.classList.add('active');
    else if (isRevoked) badge.classList.add('revoked');
    else if (isExpired) badge.classList.add('expired');

    // Actions & dataset binding
    const actions = root.querySelector('.license-actions');
    if (isRevoked || isExpired) actions.remove();
    else {
        const copyBtn = root.querySelector('.copy-key-btn');
        const revokeBtn = root.querySelector('.revoke-key-btn');
        if (copyBtn) copyBtn.dataset.key = key;
        if (revokeBtn) revokeBtn.dataset.key = key;
    }

    return root;
}

/**
 * Loads licenses from the API and populates the licenses table.
 * 
 * @returns {Promise<void>} 
 */
export async function loadLicenses() {
    const tbody = document.getElementById('licenses-table-body');
    const tmpl = document.getElementById('tmpl-license-row');
    if (!tbody || !tmpl) return;

    if (!tbody.dataset.bound) {
        tbody.onclick = (e) => {
            const copyBtn = e.target.closest('.copy-key-btn');
            if (copyBtn?.dataset.key) {
                copyToClipboardWithNotification(copyBtn.dataset.key, `Copied license key: ${copyBtn.dataset.key}`);
                return;
            }

            const revokeBtn = e.target.closest('.revoke-key-btn');
            if (revokeBtn?.dataset.key) revokeLicense(revokeBtn.dataset.key);
        };
        tbody.dataset.bound = 'true';
    }

    try {
        await loadLicenseProducts();
        const licenses = await api('/accounts/licenses');

        /* Populate the licenses table */
        if (!licenses?.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-secondary text-center">No licenses found.</td></tr>';
            return;
        }

        /* Create a document fragment to hold the new rows */
        const fragment = document.createDocumentFragment();
        licenses.forEach((lic) => {
            fragment.append(setupLicenseRow(tmpl.content.cloneNode(true), lic));
        });

        tbody.replaceChildren(fragment);
    } catch (e) {
        console.error('Failed to load licenses:', e);
        createNotification('Failed to load licenses', 'error');
    }
}

async function loadLicenseProducts() {
    const select = document.getElementById('licenseProductSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Loading products...</option>';
    try {
        const products = await api('/accounts/license-products');
        panelState.licenseProducts = Array.isArray(products) ? products : [];
        select.innerHTML = panelState.licenseProducts.length
            ? panelState.licenseProducts.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name || p.id)}</option>`).join('')
            : '<option value="">No products available</option>';
    } catch (error) {
        panelState.licenseProducts = [];
        select.innerHTML = '<option value="">Unable to load products</option>';
        console.error('Failed to load license products:', error);
        createNotification('Failed to load license products', 'error');
    }
}

/**
 * Creates a new license.
 * 
 * @param {*} e The form submission event. 
 */
export async function createLicense(e) {
    handleFormSubmit(e, async (form, formData) => {
        const payload = { name: formData.get('name'), product_id: formData.get('product_id') };
        if (formData.get('duration_days')) payload.duration_days = Number(formData.get('duration_days'));

        try {
            await api('/accounts/licenses/create', { method: 'POST', body: JSON.stringify(payload) });
            closeModals();
            form.reset();
            createNotification('License created', 'success');
            loadLicenses();
        } catch (e) {
            console.error('Failed to create license:', e);
            createNotification('Failed to create license', 'error');
        }
    });
}

async function revokeLicense(key) {
    console.log('Attempting to revoke license:', key);
    if (!confirm('Revoke this license?')) return;
    try {
        await api('/accounts/licenses/revoke', { method: 'POST', body: JSON.stringify({ license_key: key }) });
        createNotification('License revoked', 'success');
        loadLicenses();
    } catch (err) {
        createNotification(err.message, 'error');
    }
}