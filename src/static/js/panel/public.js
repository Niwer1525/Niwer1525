/**
 * Sets up a server card with the provided data.
 * 
 * @param {*} root - The root element of the card to be populated. 
 * @param {*} param1 - An object containing server properties such as serverName, projectId, serverMOTD, serverIP, serverPort, site, and discord.
 * @returns 
 */
function setupServerCard(root, { serverName = 'Unknown Server', projectId, serverMOTD, serverIP, serverPort, site, discord }) {
    const formattedId = formatProductId(projectId || 'Unknown');
    const set = (sel, val) => {
        const el = root.querySelector(sel);
        if (el) el.textContent = el.title = val;
    };

    /* Set the card's name and project ID */
    set('.card-name', serverName);
    set('.card-project-id', formattedId);
    root.querySelector('.card-motd').textContent = serverMOTD || 'No MOTD provided';

    /* Set the IP and port for the copy button */
    const copyBtn = root.querySelector('.copy-ip-btn');
    if (copyBtn) copyBtn.dataset.ip = `${serverIP}:${serverPort}`;

    /* Attach links to the site and discord buttons */
    [['.site-btn', site], ['.discord-btn', discord]].forEach(([sel, href]) => {
        const el = root.querySelector(sel);
        if (el) href ? (el.href = href) : el.remove();
    });

    return root;
}

async function loadPublicServers() {
    const grid = document.getElementById('servers-grid');
    const tmpl = document.getElementById('tmpl-server-card');
    if (!grid || !tmpl) return;

    if (!grid.dataset.bound) {
        grid.onclick = (e) => {
            const btn = e.target.closest('.copy-ip-btn');
            if (btn?.dataset.ip) copyToClipboardWithNotification(btn.dataset.ip, `Copied IP: ${btn.dataset.ip}`);
        };
        grid.dataset.bound = 'true';
    }

    try {
        const servers = await api('/api/status/servers');
        if (!servers?.length) return (grid.innerHTML = '<p>No servers online.</p>');

        const fragment = document.createDocumentFragment();
        servers.forEach(s => fragment.append(setupServerCard(tmpl.content.cloneNode(true), s)));
        grid.replaceChildren(fragment);
    } catch (e) {
        console.error('Failed to load public servers.', e);
        grid.innerHTML = '<p>Failed to load servers.</p>';
    }
}

async function loadDownloads() {
    const grid = document.getElementById('downloads-grid');
    if (!grid) return;

    try {
        const repositories = await api('/download/list');
        const entries = Object.entries(repositories || {});
        if (!entries.length) return (grid.innerHTML = '<p class="text-secondary">No downloadable assets found.</p>');

        grid.innerHTML = entries.map(([repo, data = {}]) => {
            const tagMap = new Map((data.tags || []).map(t => [t.tag || t.name, t.message || '']));

            const rows = (data.releases || []).flatMap(rel => {
                const tag = rel.tagName || rel.tag_name;
                const desc = tagMap.get(tag) || rel.body || '-';

                return (rel.assets || []).filter(a => a?.name).map(a => `
                    <tr>
                        <td>${escapeHtml(rel.name || tag || 'Unreleased')}</td>
                        <td>${rel.prerelease ? 'Yes' : 'No'}</td>
                        <td>${escapeHtml(a.name)}</td>
                        <td>${escapeHtml(desc !== '-' ? desc : a.body || '-')}</td>
                        <td class="download-action">
                            <a class="button" title="Download" href="/download?product=${encodeURIComponent(repo)}&assetName=${encodeURIComponent(a.name)}&assetId=${a.id}" target="_blank">
                                <i class="fa-solid fa-cloud-arrow-down"></i>
                            </a>
                        </td>
                    </tr>`);
            }).join('');

            return `
                <section class="download-repository">
                    <div class="download-repository-header">
                        <h3><i class="fa-solid fa-code-branch text-accent"></i> ${escapeHtml(repo)}</h3>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead><tr><th>Release</th><th>Pre-Release</th><th>Asset</th><th>Description</th><th>Download</th></tr></thead>
                            <tbody>${rows || '<tr><td colspan="5" class="text-secondary">No downloadable assets found.</td></tr>'}</tbody>
                        </table>
                    </div>
                </section>`;
        }).join('');
    } catch {
        grid.innerHTML = '<p class="text-secondary text-danger">Failed to load downloads.</p>';
    }
}