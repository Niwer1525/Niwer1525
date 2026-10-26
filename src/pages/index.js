import { projects } from '../components/index/projects.js';
import { skillsCards } from '../components/index/skills.js';
import { gists } from '../components/index/gists.js';
import { stats } from '../components/index/stats.js';
import { defaultLayout } from '../components/layout.js';
import { translate } from '../utils.js';

async function fetchStatistics(apiBaseUrl) {
    try {
        const RESPONSE = await fetch(`${apiBaseUrl}/statistics`);
        if (!RESPONSE.ok) throw new Error(`Could not fetch statistics: ${RESPONSE.statusText}`);
        return await RESPONSE.json();
    } catch (error) {
        console.error('Error loading statistics:', error);
        return {};
    }
}

export async function render(lang, langDict, { apiBaseUrl = '' } = {}) {
	const STATISTICS = await fetchStatistics(apiBaseUrl);

	const content = `
		<section id="presentation">
			<div>
				<h1>REDOTÉ Erwin</h1>
				<p>${translate(langDict, 'content_aboute_me')}</p>

				<!-- Open to Work Badge -->
				<div class="flex-center-wrap open-to-work-badge">
					<span class="badge-item">
						<i class="fa-solid fa-briefcase"></i>
						<span>${translate(langDict, 'badge.open_to_work')}</span>
					</span>
					<span class="badge-item">
						<i class="fa-solid fa-globe"></i>
						<span>${translate(langDict, 'badge.remote')}</span>
					</span>
					<span class="badge-item">
						<i class="fa-solid fa-handshake"></i>
						<span>${translate(langDict, 'badge.freelance')}</span>
					</span>
					<span class="badge-item">
						<i class="fa-solid fa-clock"></i>
						<span>${translate(langDict, 'badge.available')}</span>
					</span>
				</div>
			</div>
			<img src="/assets/profile.webp" alt="REDOTÉ Erwin" fetchpriority="high">
		</section>

		<!-- Skills -->
		${skillsCards(langDict)}

		<!-- Github/Wakatime stats -->
		${await stats(langDict, STATISTICS)}

		<!-- Projects -->
		${await projects(lang, langDict)}

		<!-- Gists -->
		${gists(langDict, STATISTICS)}
	`;

	return defaultLayout({
		page: 'index',
		lang,
		langDict,
		title: 'Erwin Redoté (Niwer) - Developer Portfolio',
		description: 'Portfolio of Erwin Redoté, a Java and Web developer showcasing recent work and open source projects.',
		canonical: 'https://niwer.dev',
		content,
		scripts: ['/js/home.js'],
		headScripts: [
			'src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1/lite-youtube.min.js"'
		]
	});
}