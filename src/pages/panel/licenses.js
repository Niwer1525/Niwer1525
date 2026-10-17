import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section>
            <div class="panel-header">
                <h2>License Management</h2>
                <button id="btnCreateLicenseModal" class="btn primary"><i class="fa-solid fa-plus"></i> New License</button>
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
                        <tr><td colspan="5" class="text-secondary text-center">Loading licenses...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
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
                defer: true
            },
			{
				file: '/js/panel/auth.js',
				defer: true
			},
			{
				file: '/js/panel/licenses.js',
				defer: true
			}
        ]
    });
}