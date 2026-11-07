import { panelLayout } from '../components/layout.ts';
import { servers } from '../components/panel/servers.ts';
import { purchaseAlert } from '../components/section_alerts.ts';

export async function render(lang, langDict) {
	return panelLayout({
		page: 'panel',
		lang,
    	langDict,
		title: 'Dashboard | Erwin Redoté',
		description: 'The dashboard for niwer.dev, where you can manage your account, view your purchases, and access exclusive content.',
		canonical: 'https://niwer.dev/panel.html',
		content: `
			${purchaseAlert(langDict)}
			${servers(langDict)}
		`
	});
}