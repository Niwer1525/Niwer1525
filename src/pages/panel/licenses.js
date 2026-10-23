import { panelLayout } from '../../components/layout.js';
import { createLicenseModal } from '../../components/modals/create_license_modal.js';
import { translate } from '../../utils.js';

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
                        <button class="copy-key-btn" title="${translate(langDict, "btn.title.copy")}">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                        <button class="revoke-key-btn danger-button" title="${translate(langDict, "btn.title.revoke_licenses")}">
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
            <h2>${translate(langDict, "title.licenses")}</h2>
            <div class="section-actions">
                <button onclick="showPopup('create-license-popup')">
                    <i class="fa-solid fa-plus"></i>
                    ${translate(langDict, "btn.new_license")}
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>${translate(langDict, "licenses.table_header.product")}</th>
                            <th>${translate(langDict, "licenses.table_header.validity")}</th>
                            <th>${translate(langDict, "licenses.table_header.license_key")}</th>
                            <th>${translate(langDict, "licenses.table_header.status")}</th>
                            <th>${translate(langDict, "licenses.table_header.actions")}</th>
                        </tr>
                    </thead>
                    <tbody id="licenses-table-body">
                        <tr><td colspan="5">${translate(langDict, "licenses.loading")}</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
        ${licenseRowTemplate(langDict)}
        ${createLicenseModal(langDict)}
    `;

    return panelLayout({
        page: 'licenses',
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