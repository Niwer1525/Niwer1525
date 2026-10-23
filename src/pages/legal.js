import { defaultLayout } from '../components/layout.js';
import { jumpBar } from '../components/nav.js';
import { loadMd, translate } from '../utils.js';

export async function render(lang, langDict) {
	const legalDir = 'src/data/langs/' + lang + '/';
	const copyrightHtml = await loadMd(legalDir, 'copyright_notice.md');
	const tosHtml = await loadMd(legalDir, 'terms_of_service.md');
	const termsOfSaleHtml = await loadMd(legalDir, 'terms_of_sale.md');
	const privacyHtml = await loadMd(legalDir, 'privacy_policy.md');
	const content = `
		${jumpBar(langDict, 'Legal Sections', translate(langDict, 'title.legal'), [
			{ id: 'copyright_notice', label: translate(langDict, 'btn.copyright_notice') },
			{ id: 'terms_of_service', label: translate(langDict, 'btn.terms_of_service') },
			{ id: 'terms_of_sale', label: translate(langDict, 'btn.terms_of_sale') },
			{ id: 'privacy_policy', label: translate(langDict, 'btn.privacy_policy') }
		])}
		<section id="copyright_notice" class="text-content">
			<h1>${translate(langDict, 'title.legal')}</h1>
			${copyrightHtml}
		</section>
		<hr>
		<!-- Terms Of Service -->
		<section id="terms_of_service" class="text-content">
			<h2>${translate(langDict, 'btn.terms_of_service')}</h2>
			${tosHtml}
		</section>
		<hr>
		<!-- Terms of Sale -->
		<section id="terms_of_sale" class="text-content">
			<h2>${translate(langDict, 'btn.terms_of_sale')}</h2>
			${termsOfSaleHtml}
		</section>
		<hr>
		<!-- Privacy Policy -->
		<section id="privacy_policy" class="text-content">
			<h2>${translate(langDict, 'btn.privacy_policy')}</h2>
			${privacyHtml}
		</section>
	`;

	return defaultLayout({
		lang,
    	langDict,
		title: 'Terms of Service & Privacy Policy | Erwin Redoté',
		description: 'Legal notices, terms of service, terms of sale, and privacy policies for niwer.dev.',
		canonical: 'https://niwer.dev/legal.html',
		content
	});
}