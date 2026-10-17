import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section id="page-downloads" class="page">
            <div class="panel">
                <div class="panel-header">
                    <h2><i class="fa-solid fa-download text-accent"></i> Downloads</h2>
                </div>
                <div id="downloadsGrid">
                    <p class="text-secondary">Loading downloads...</p>
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