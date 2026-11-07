import { projects } from '../components/index/projects.ts';
import { skillsCards } from '../components/index/skills.ts';
import { gists } from '../components/index/gists.ts';
import { stats } from '../components/index/stats.ts';
import { defaultLayout } from '../components/layout.ts';
import { translate } from '../utils.ts';
import type { LangDict, RenderContext, StatisticsData } from '../types.ts';

async function fetchStatistics(apiBaseUrl: string): Promise<StatisticsData> {
    try {
        const RESPONSE = await fetch(`${apiBaseUrl}/statistics`);
        if (!RESPONSE.ok) throw new Error(`Could not fetch statistics: ${RESPONSE.statusText}`);
        return await RESPONSE.json();
    } catch (error) {
        console.error('Error loading statistics:', error);
        return {};
    }
}

export async function render(lang: string, langDict: LangDict, { apiBaseUrl = '' }: RenderContext = {}): Promise<string> {
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
			<img src="/assets/profile.webp" alt="REDOTÉ Erwin" fetchpriority="high" decoding="async" loading="eager" draggable="false">
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
		headCss: [],
		headScripts: [
			'src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1/lite-youtube.min.js" type="module" defer'
		]
	});
}