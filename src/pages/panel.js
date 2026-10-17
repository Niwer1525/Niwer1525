import { panelLayout } from '../components/layout.js';
import { servers } from '../components/panel/servers.js';
import { purchaseAlert } from '../components/panel/purhcase_alert.js';

export async function render(lang, langDict) {
	return panelLayout({
		lang,
    	langDict,
		title: 'Dashboard | Erwin Redoté',
		description: 'The dashboard for niwer.dev, where you can manage your account, view your purchases, and access exclusive content.',
		canonical: 'https://niwer.dev/panel.html',
		content: `
			${purchaseAlert(langDict)}
			${servers(langDict)}
		`,
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
			}
        ]
	});
}