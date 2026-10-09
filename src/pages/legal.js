import { layout } from '../components/layout.js';
import { loadMd } from '../utils.js';

export async function render() {
	const legalDir = 'src/data/legal';
	const copyrightHtml = await loadMd(legalDir, 'copyright_notice.md');
	const tosHtml = await loadMd(legalDir, 'terms_of_service.md');
	const termsOfSaleHtml = await loadMd(legalDir, 'terms_of_sale.md');
	const privacyHtml = await loadMd(legalDir, 'privacy_policy.md');
	const content = `
		<section>
			<h1 data-i18n="title.legal">Legal Notice</h1>
			${copyrightHtml}
		</section>
		<hr>
		<!-- Terms Of Service -->
		<section id="terms_of_service">
			<h2 data-i18n="btn.terms_of_service">Terms of Service</h2>
			${tosHtml}
		</section>
		<hr>
		<!-- Terms of Sale -->
		<section id="terms_of_sale">
			<h2 data-i18n="btn.terms_of_sale">Terms of Sale</h2>
			${termsOfSaleHtml}
		</section>
		<hr>
		<!-- Privacy Policy -->
		<section id="privacy_policy">
			<h2 data-i18n="btn.privacy_policy">Privacy Policy</h2>
			${privacyHtml}
		</section>
	`;

	return layout({
		title: 'Terms of Service & Privacy Policy | Erwin Redoté',
		description: 'Legal notices, terms of service, terms of sale, and privacy policies for niwer.dev.',
		canonical: 'https://niwer.dev/legal.html',
		content
	});
}