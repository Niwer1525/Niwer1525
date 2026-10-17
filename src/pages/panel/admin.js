import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section id="page-admin" class="page">
            <div class="panel">
                <div class="panel-header">
                    <h2><i class="fa-solid fa-terminal text-accent"></i> Safe SQL</h2>
                </div>
                <textarea id="adminSql" rows="4" maxlength="2000" placeholder="SELECT * FROM Account LIMIT 10"></textarea>
                <button class="btn primary" id="btnExecuteAdminSql">Run SQL</button>
                <pre id="adminSqlResult" class="text-secondary" style="white-space: pre-wrap; max-height: 300px; overflow: auto;"></pre>
            </div>
            <div class="panel">
                <div class="panel-header">
                    <h2><i class="fa-solid fa-database text-accent"></i> Data Tables</h2>
                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                        <select id="tableSelector" onchange="App.loadTableData()" style="width: auto; min-width: 200px; cursor: pointer;"></select>
                        <input type="number" id="tableLimit" value="100" style="width: 90px;" onchange="App.loadTableData()" title="Row Limit">
                        <button class="btn icon-btn" onclick="App.loadTableData()" title="Refresh"><i class="fa-solid fa-rotate-right"></i></button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="dataTableEl">
                        <thead id="dataTableHead"><tr><th>Select a table</th></tr></thead>
                        <tbody id="dataTableBody"></tbody>
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