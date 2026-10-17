import { panelLayout } from '../components/layout.js';

export async function render(lang, langDict) {
	const content = `
        
	`;

	return panelLayout({
		lang,
    	langDict,
		title: 'Terms of Service & Privacy Policy | Erwin Redoté',
		description: 'Legal notices, terms of service, terms of sale, and privacy policies for niwer.dev.',
		canonical: 'https://panel.niwer.dev',
		content,
        additionalScripts: [
            'js/panel.js'
        ]
	});
}