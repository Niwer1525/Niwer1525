import { panelLayout } from '../components/layout.js';
import { servers } from '../components/panel/servers.js';
import { purchaseAlert } from '../components/section_alerts.js';

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