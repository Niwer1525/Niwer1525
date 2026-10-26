import { emptyLayout } from '../components/layout.js';

function createBubble(iconClass, link, text) {
	return `
		<div class="bubble">
			<div class="bubble-content">
				<i class="${iconClass}"></i>
				<a href="${link}" target="_blank">${text}</a>
			</div>
		</div>
	`;
}

export async function render(lang, langDict) {
	const content = `
		<section class="bubbles-container">
			${createBubble('fa-solid fa-globe', 'https://niwer.dev', 'niwer.dev')}
			${createBubble('fa-brands fa-github', 'https://git.niwer.dev', 'git.niwer.dev')}
			${createBubble('fa-regular fa-file-code', 'https://gist.niwer.dev', 'gist.niwer.dev')}
			${createBubble('fa-solid fa-clock', 'https://wakatime.niwer.dev', 'wakatime.niwer.dev')}
			${createBubble('fa-brands fa-stack-overflow', 'https://stackoverflow.niwer.dev', 'stackoverflow.niwer.dev')}
			${createBubble('fa-brands fa-youtube', 'https://youtube.niwer.dev', 'youtube.niwer.dev')}
			${createBubble('fa-solid fa-box', 'https://modrinth.niwer.dev', 'modrinth.niwer.dev')}
			${createBubble('fa-solid fa-envelope', 'mailto:contact@niwer.dev', 'contact@niwer.dev')}
			${createBubble('fa-solid fa-star', 'https://sponsor.niwer.dev', 'sponsor.niwer.dev')}
		</section>
	`;

	return emptyLayout({
		lang,
		langDict,
		title: 'Erwin Redoté (Niwer) - Links and Digital ID',
		description: 'Digital ID and links for Erwin Redoté (Niwer)',
		canonical: 'https://niwer.dev',
		content,
		scripts: [ '/js/print.js' ]
	});
}