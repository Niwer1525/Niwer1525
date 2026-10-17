import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section>
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
                file: '/js/panel.js',
                defer: true
            },
			{
				file: '/js/panel/public.js',
				defer: true
			},
			{
				file: '/js/panel/auth.js',
				defer: true
			}
        ]
    });
}