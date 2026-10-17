import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section id="page-downloads">
            <h2>Downloads</h2>
            <div id="downloads-grid">
                <p class="text-secondary">Loading downloads...</p>
            </div>
        </section>
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
                file: '/js/panel/panel_state.js',
                defer: true
            },
            {
                file: '/js/panel.js',
                defer: true
            },
			{
				file: '/js/panel/services/public.js',
				defer: true
			},
			{
				file: '/js/panel/services/auth.js',
				defer: true
			},
			{
				file: '/js/panel/services/licenses.js',
				defer: true
			},
			{
				file: '/js/panel/services/admin.js',
				defer: true
			}
        ]
    });
}