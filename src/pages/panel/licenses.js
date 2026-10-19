import { panelLayout } from '../../components/layout.js';
import { createLicenseModal } from '../../components/modals/create_license_modal.js';

function licenseRowTemplate(langDict) {
    return `
        <template id="tmpl-license-row">
            <tr>
                <td>
                    <strong class="license-name"></strong><br>
                    <span class="license-product text-secondary"></span>
                </td>
                <td>
                    <span>
                        <i class="fa-solid fa-arrow-right-to-bracket text-success" style="margin-right:4px;"></i>
                        <span class="license-created text-secondary"></span><br>
                        <i class="fa-solid fa-arrow-right-from-bracket text-danger" style="margin-right:4px;"></i>
                        <span class="license-expires text-secondary"></span>
                    </span>
                </td>
                <td>
                    <code class="license-key"></code>
                </td>
                <td>
                    <span class="license-badge"></span>
                </td>
                <td>
                    <div class="license-actions">
                        <button class="copy-key-btn" title="Copy Key">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                        <button class="revoke-key-btn danger-button" title="Revoke">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        </template>
    `;
}

export async function render(lang, langDict) {
    const content = `
        <section>
            <h2>License Management</h2>
            <div class="section-actions">
                <button onclick="showPopup('create-license-popup')"><i class="fa-solid fa-plus"></i> New License</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name / Product</th>
                            <th>Validity</th>
                            <th>License Key</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="licenses-table-body">
                        <tr><td colspan="5">Loading licenses...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
        ${licenseRowTemplate(langDict)}
        ${createLicenseModal(langDict)}
    `;

    return panelLayout({
        lang,
        langDict,
        title: 'Dashboard - Access keys | Erwin Redoté',
        description: 'Manage your licenses/access keys and view their details.',
        canonical: 'https://niwer.dev/panel/licenses.html',
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
				file: '/js/panel/licenses.js',
				defer: true,
                type: 'module'
			}
        ]
    });
}