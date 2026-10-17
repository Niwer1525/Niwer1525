async function loadPublicServers() {
    const grid = document.getElementById('servers-grid');
    const groupTmpl = document.getElementById('tmpl-server-group');
    const cardTmpl = document.getElementById('tmpl-server-card');
    if (!grid || !groupTmpl || !cardTmpl) return;

    try {
        const servers = await api('/api/status/servers');
        if (!servers || servers.length === 0) {
            grid.innerHTML = '<p>No servers online.</p>';
            return;
        }

        // Group servers by productId
        const groupedServers = servers.reduce((acc, server) => {
            const key = formatProductId(server.productId || server.projectId) || 'Other / Community';
            (acc[key] = acc[key] || []).push(server);
            return acc;
        }, {});

        // Build DOM fragments using SSG templates
        const fragment = document.createDocumentFragment();
        for (const [productId, productServers] of Object.entries(groupedServers)) {
            const groupNode = groupTmpl.content.cloneNode(true);
            groupNode.querySelector('.group-title').textContent = productId;

            const cardsGrid = groupNode.querySelector('.server-cards-grid');
            for (const s of productServers) {
                const cardNode = cardTmpl.content.cloneNode(true);

                // Name & MOTD (textContent handles HTML escaping safely)
                const nameEl = cardNode.querySelector('.card-name');
                nameEl.textContent = s.serverName || 'Unknown Server';
                nameEl.title = s.serverName || 'Unknown';

                cardNode.querySelector('.card-motd').textContent = s.serverMOTD || 'No MOTD provided';

                // Copy IP button
                const copyBtn = cardNode.querySelector('.copy-ip-btn');
                copyBtn.dataset.ip = `${s.serverIP}:${s.serverPort}`;

                // for optional links, we populate href or remove element if not present
                const siteLink = cardNode.querySelector('.site-btn');
                if (s.site) siteLink.href = s.site;
                else siteLink.remove();

                const discordLink = cardNode.querySelector('.discord-btn');
                if (s.discord) discordLink.href = s.discord;
                else discordLink.remove();

                cardsGrid.appendChild(cardNode);
            }

            fragment.appendChild(groupNode);
        }

        grid.replaceChildren(fragment); // Single DOM paint
    } catch {
        grid.innerHTML = '<p>Failed to load servers.</p>';
    }
}

async function loadDownloads() {
    const grid = document.getElementById('downloadsGrid');
    if (!grid) return;

    try {
        const repositories = await api('/download/list');
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
                            <td><span class="font-mono text-sm">${escapeHtml(release.prerelease ? 'Yes' : 'No')}</span></td>
                            <td><span class="font-mono text-sm">${escapeHtml(asset.name)}</span></td>
                            <td><span class="font-mono text-sm">${escapeHtml(tagMessage || release.body || asset.body || '-')}</span></td>
                            <td class="download-action">
                                <a class="btn primary icon-btn" title="Download" href="/download?product=${encodeURIComponent(repository)}&assetName=${encodeURIComponent(asset.name || 'Unknown')}&assetId=${asset.id}" target="_blank">
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