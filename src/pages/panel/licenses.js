import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section id="page-licenses" class="page">
            <div class="panel">
                <div class="panel-header">
                    <h2><i class="fa-solid fa-key text-accent"></i> License Management</h2>
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
                        <tbody id="licensesTableBody">
                            <tr><td colspan="5" class="text-secondary text-center">Loading licenses...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    `;

    return panelLayout({
        lang,
        langDict,
        title: 'Dashboard | Erwin Redoté',
        description: 'The dashboard for niwer.dev, where you can manage your account, view your purchases, and access exclusive content.',
        canonical: 'https://niwer.dev/panel.html',
        content,
        additionalScripts: [
            'js/panel.js'
        ]
    });
}