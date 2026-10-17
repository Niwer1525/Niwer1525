async function loadPublicServers() {
    const grid = document.getElementById('servers-grid');
    const cardTmpl = document.getElementById('tmpl-server-card');
    if (!grid || !cardTmpl) return;

    try {
        const servers = await api('/api/status/servers');
        if (!servers || servers.length === 0) {
            grid.innerHTML = '<p>No servers online.</p>';
            return;
        }
        
        // Build DOM fragments using SSG templates
        const fragment = document.createDocumentFragment();
        for (const server of servers) {
            const cardNode = cardTmpl.content.cloneNode(true);

            // Name
            const nameEl = cardNode.querySelector('.card-name');
            nameEl.textContent = server.serverName || 'Unknown Server';
            nameEl.title = server.serverName || 'Unknown';

            // Project ID
            const projectIdEl = cardNode.querySelector('.card-project-id');
            projectIdEl.textContent = formatProductId(server.productId || server.projectId || 'Unknown Product');
            projectIdEl.title = formatProductId(server.productId || server.projectId || 'Unknown');

            // MOTD (Message of the Day)
            cardNode.querySelector('.card-motd').textContent = server.serverMOTD || 'No MOTD provided';

            // Copy IP button
            const copyBtn = cardNode.querySelector('.copy-ip-btn');
            copyBtn.dataset.ip = `${server.serverIP}:${server.serverPort}`;
            copyBtn.onclick = () => {
                copyToClipboardWithNotification(copyBtn.dataset.ip, `Copied IP: ${copyBtn.dataset.ip}`);
            }

            // for optional links, we populate href or remove element if not present
            const siteLink = cardNode.querySelector('.site-btn');
            if (server.site) siteLink.href = server.site;
            else siteLink.remove();

            const discordLink = cardNode.querySelector('.discord-btn');
            if (server.discord) discordLink.href = server.discord;
            else discordLink.remove();

            fragment.appendChild(cardNode);
        }

        grid.replaceChildren(fragment); // Single DOM paint
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
        console.log('Fetched repositories:', repositories);
        const sections = Object.entries(repositories || {}).map(([repository, data]) => {
            const releases = (data && data.releases) || [];
            const tags = (data && data.tags) || [];
            const tagMap = new Map(tags.map((t) => [t.tag || t.name, t]));

            const rows = releases.flatMap((release) => {
                const tagName = release.tagName || release.tag_name;
                const associatedTag = tagMap.get(tagName);
                const tagMessage = associatedTag ? associatedTag.message || '' : '';

                return (release.assets || [])
                    .filter((asset) => asset.name)
                    .map((asset) => `
                        <tr>
                            <td>${escapeHtml(release.name || tagName || 'Unreleased')}</td>
                            <td>${escapeHtml(release.prerelease ? 'Yes' : 'No')}</td>
                            <td>${escapeHtml(asset.name)}</td>
                            <td>${escapeHtml(tagMessage || release.body || asset.body || '-')}</td>
                            <td class="download-action">
                                <a class="btn" title="Download" href="/download?product=${encodeURIComponent(repository)}&assetName=${encodeURIComponent(asset.name || 'Unknown')}&assetId=${asset.id}" target="_blank">
                                    <i class="fa-solid fa-cloud-arrow-down"></i>
                                </a>
                            </td>
                        </tr>
                    `);
            }).join('');

            return `
                <section class="download-repository">
                    <div class="download-repository-header">
                        <h3><i class="fa-solid fa-code-branch text-accent"></i> ${escapeHtml(repository)}</h3>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead><tr>
                                <th>Release</th>
                                <th>Pre-Release</th>
                                <th>Asset</th>
                                <th>Description</th>
                                <th>Download</th>
                            </tr></thead>
                            <tbody>${rows || '<tr><td colspan="5" class="text-secondary">No downloadable assets found.</td></tr>'}</tbody>
                        </table>
                    </div>
                </section>
            `;
        });

        grid.innerHTML = sections.length ? sections.join('') : '<p class="text-secondary">No downloadable assets found.</p>';
    } catch {
        grid.innerHTML = '<p class="text-secondary text-danger">Failed to load downloads.</p>';
    }
}