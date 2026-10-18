import { panelLayout } from '../../components/layout.js';

function repositoryTemplate() {
    return `
        <template id="tmpl-download-repo">
            <section class="download-repository">
                <div class="download-repository-header">
                    <h3><i class="fa-solid fa-code-branch text-accent"></i> <span class="repo-name"></span></h3>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Release</th>
                                <th>Pre-Release</th>
                                <th>Asset</th>
                                <th>Description</th>
                                <th>Download</th>
                            </tr>
                        </thead>
                        <tbody class="repo-rows"></tbody>
                    </table>
                </div>
            </section>
        </template>
    `
}

function assetRowTemplate() {
    return `
        <template id="tmpl-download-row">
            <tr>
                <td class="row-release"></td>
                <td class="row-prerelease"></td>
                <td class="row-asset"></td>
                <td class="row-desc"></td>
                <td class="download-action">
                    <a class="button download-link" title="Download" target="_blank">
                        <i class="fa-solid fa-cloud-arrow-down"></i>
                    </a>
                </td>
            </tr>
        </template>
    `
}

export async function render(lang, langDict) {
    const content = `
        <section>
            <h2>Downloads</h2>
            <div id="downloads-grid">
                <p class="text-secondary">Loading downloads...</p>
            </div>
        </section>
        ${repositoryTemplate()}
        ${assetRowTemplate()}
    `;

    return panelLayout({
        lang,
        langDict,
        title: 'Dashboard - Downloads | Erwin Redoté',
        description: 'Download the latest releases and assets for our projects. Stay up-to-date with the newest features and improvements.',
        canonical: 'https://niwer.dev/panel/downloads.html',
        content,
        additionalScripts: [
            {
                file: '/js/panel.js',
                defer: true,
                type: 'module'
            },
			{
				file: '/js/panel/public.js',
				defer: true,
                type: 'module'
			},
			{
				file: '/js/panel/auth.js',
				defer: true,
                type: 'module'
			}
        ]
    });
}