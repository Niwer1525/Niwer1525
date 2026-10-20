import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section id="page-admin">
            <h2><i class="fa-solid fa-terminal text-accent"></i> Safe SQL</h2>
            <div class="section-actions">
                <button>Run SQL</button>
            </div>
            <div class="flex-center-wrap">
                <textarea class="badge-card large-card" id="adminSql" rows="4" maxlength="2000" placeholder="SELECT * FROM Account LIMIT 10"></textarea>
                <textarea class="badge-card large-card" id="adminSqlResult" readonly placeholder="Results will appear here..."></textarea>
            </div>
        </section>
        <section>
            <h2><i class="fa-solid fa-database text-accent"></i> Data Table Viewer</h2>
            <div class="section-actions">
                <select class="button" id="tableSelector" style="width: 190px;" onchange="loadTableData()"></select>
                <input class="button" type="number" id="tableLimit" value="100" style="width: 190px;" onchange="loadTableData()" title="Row Limit">
                <button onclick="loadTableData()" title="Refresh"><i class="fa-solid fa-rotate-right"></i></button>
            </div>
            <div class="table-container">
                <table id="dataTableEl">
                    <thead id="dataTableHead"><tr><th>Select a table</th></tr></thead>
                    <tbody id="dataTableBody"></tbody>
                </table>
            </div>
        </section>
        <section>
            <h2>Blog Posts</h2>
            <p>This section is under construction. You can view and manage blog posts here in the future.
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
				file: '/js/panel/admin.js',
				defer: true,
                type: 'module'
			}
        ]
    });
}