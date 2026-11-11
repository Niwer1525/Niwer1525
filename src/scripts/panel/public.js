import { formatProductId } from '../main.js';
import { api } from '../panel.js';
import { API_BASE } from '../utils/api.js';
import { createNotification } from '../utils/toast.js';

/**
 * Sets up a server card with the provided data.
 * 
 * @param {*} root - The root element of the card to be populated. 
 * @param {*} param1 - An object containing server properties such as serverName, projectId, serverMOTD, serverIP, serverPort, site, and discord.
 * @returns {HTMLElement} The populated card element.
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

export async function loadPublicServers() {
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
        const servers = await api('/servers/status');
        if (!servers?.length) return (grid.innerHTML = '<p>No servers online.</p>');

        const fragment = document.createDocumentFragment();
        servers.forEach(s => fragment.append(setupServerCard(tmpl.content.cloneNode(true), s)));
        grid.replaceChildren(fragment);
    } catch (e) {
        console.error('Failed to load public servers.', e);
        createNotification('Failed to load public servers', 'error');
    }
}

/**
 * Sets up a download row with the provided data.
 * 
 * @param {*} root - The root element of the row to be populated. 
 * @param {*} param1 - An object containing download properties such as releaseName, isPreRelease, assetName, description, repo, and assetId.
 * @returns {HTMLElement} The populated row element.
 */
function setupDownloadRow(root, { releaseName, isPreRelease, description, repo, assets }) {
    root.querySelector('.row-release').textContent = releaseName;
    root.querySelector('.row-prerelease').textContent = isPreRelease ? 'Yes' : 'No';
    root.querySelector('.row-desc').textContent = description;

    const select = root.querySelector('.asset-selector');
    const link = root.querySelector('.download-link');

    const updateLink = (asset) => {
        if (!asset || !link) return;
        link.href = `${API_BASE}/download?product=${encodeURIComponent(repo)}&assetName=${encodeURIComponent(asset.name)}&assetId=${asset.id}`;
    };

    // Populate dropdown with all assets in this release
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.id;
        option.textContent = asset.name;
        select.appendChild(option);
    });

    if (assets.length > 0) updateLink(assets[0]); // Default to first asset

    // Update link whenever the user picks another asset
    select.addEventListener('change', () => {
        const selected = assets.find(a => String(a.id) === select.value);
        updateLink(selected);
    });

    return root;
}

export async function loadDownloads() {
    const grid = document.getElementById('downloads-grid');
    const repoTmpl = document.getElementById('tmpl-download-repo');
    const rowTmpl = document.getElementById('tmpl-download-row');
    if (!grid || !repoTmpl || !rowTmpl) return;

    try {
        const repositories = await api('/download/list');
        const entries = Object.entries(repositories || {});
        if (!entries.length) {
            grid.innerHTML = '<p class="text-secondary">No downloadable assets found.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const [repo, data = {}] of entries) {
            const repoNode = repoTmpl.content.cloneNode(true);
            repoNode.querySelector('.repo-name').textContent = repo;
            const tbody = repoNode.querySelector('.repo-rows');

            const tagMap = new Map((data.tags || []).map(t => [t.tag || t.name, t.message || '']));
            const rowsFragment = document.createDocumentFragment();

            (data.releases || []).forEach(rel => {
                const tag = rel.tagName || rel.tag_name;
                const desc = tagMap.get(tag) || rel.body || '-';
                const assets = (rel.assets || []).filter(a => a?.name);

                if (assets.length === 0) return;

                const rowNode = setupDownloadRow(rowTmpl.content.cloneNode(true), {
                    releaseName: rel.name || tag || 'Unreleased',
                    isPreRelease: Boolean(rel.prerelease),
                    description: desc,
                    repo,
                    assets
                });
                rowsFragment.append(rowNode);
            });

            if (rowsFragment.children.length > 0) tbody.append(rowsFragment);
            else tbody.innerHTML = '<tr><td colspan="5" class="text-secondary">No downloadable assets found.</td></tr>';

            fragment.append(repoNode);
        }

        grid.replaceChildren(fragment);
    } catch (e) {
        console.error('Failed to load downloads.', e);
        createNotification('Failed to load downloads', 'error');
    }
}