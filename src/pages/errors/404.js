import { errorLayout } from '../../components/layout.js';
import { translate } from '../../utils.js';

export async function render(lang, langDict) {
	const content = `
		<div class="flex-center-wrap">
			<h1>${translate(langDict, '404_title')}</h1>
			<div class="error-page">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="100%" height="100%">
					<!-- Background Shape -->
					<circle cx="400" cy="200" r="140" class="accent" opacity="0.7" />

					<!-- Floor Shadows -->
					<ellipse cx="330" cy="255" rx="50" ry="6" class="shadow" opacity="0.7" />
					<ellipse cx="470" cy="255" rx="50" ry="6" class="shadow" opacity="0.7" />

					<!-- Left Cable (The Plug) -->
					<!-- Wire -->
					<path d="M 120 270 C 200 270, 240 200, 310 200" stroke="#475569" stroke-width="14" fill="none" stroke-linecap="round" />
					<!-- Plug Body -->
					<rect x="290" y="170" width="70" height="60" rx="10" fill="#334155" />
					<rect x="345" y="170" width="15" height="60" fill="#1e293b" /> <!-- Grip detail -->
					<!-- Metal Prongs -->
					<rect x="360" y="185" width="25" height="8" rx="2" fill="#cbd5e1" />
					<rect x="360" y="207" width="25" height="8" rx="2" fill="#cbd5e1" />

					<!-- Right Cable (The Socket) -->
					<!-- Wire -->
					<path d="M 680 270 C 600 270, 560 200, 490 200" stroke="#475569" stroke-width="14" fill="none" stroke-linecap="round" />
					<!-- Socket Body -->
					<rect x="440" y="165" width="70" height="70" rx="10" fill="#334155" />
					<rect x="440" y="165" width="15" height="70" fill="#1e293b" /> <!-- Grip detail -->
					<!-- Socket Holes -->
					<rect x="440" y="182" width="12" height="14" rx="3" fill="#0f172a" />
					<rect x="440" y="204" width="12" height="14" rx="3" fill="#0f172a" />
				</svg>
				<p>${translate(langDict, '404_description')}</p>
				<a href="/" class="button">
					<i class="fas fa-home"></i>
					${translate(langDict, 'btn.back_to_home')}
				</a>
			</div>
		</div>
	`;

	return errorLayout({
		lang,
		langDict,
		title: 'Oops! Page not found',
		description: 'The page you are looking for does not exist.',
		canonical: 'https://niwer.dev/error/404',
		content,
		additionalScripts: []
	});
}