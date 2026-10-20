import { getValueWithFallback } from '../../utils.js';

function cardTemplate() {
    return `
        <template id="tmpl-server-card">
            <article>
                <header>
                    <h2 class="card-name"></h2>
                    <span class="card-project-id text-secondary"></span>
                </header>
                <main class="card-motd"></main>
                <footer>
                    <button class="copy-ip-btn" title="Copy IP">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                    <a target="_blank" rel="noopener" class="button site-btn" title="Website">
                        <i class="fa-solid fa-link"></i>
                    </a>
                    <a target="_blank" rel="noopener" class="button discord-btn" title="Discord">
                        <i class="fa-brands fa-discord"></i>
                    </a>
                </footer>
            </article>
        </template>
    `
}

export function servers(langDict) {
    return `
        <section>
            <h2>${getValueWithFallback(langDict, 'title.servers', 'Public Servers')}</h2>
			<div id="servers-grid" class="articles-grid">
				<p>${getValueWithFallback(langDict, 'servers.loading', 'Loading servers...')}</p>
			</div>
            ${cardTemplate()}
        </section>
    `;
}