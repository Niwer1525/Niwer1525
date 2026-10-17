import { panelLayout } from '../components/layout.js';

export async function render(lang, langDict) {
	const content = `
        <section id="dashboard-overview">
            <div id="purchaseAlert" class="panel hidden" style="border-color: var(--accent-color); background: var(--accent-glow);">
                <div class="flex-between">
                    <div>
                        <h3 class="text-accent"><i class="fa-solid fa-basket-shopping"></i> Purchase Detected</h3>
                        <p class="text-sm">We noticed you have a pending checkout session. Sign in or register to link it automatically.</p>
                    </div>
                    <button class="btn primary">Link Account</button>
                </div>
            </div>
            <div class="panel">
                <div class="panel-header">
                    <h2><i class="fa-solid fa-server text-accent"></i> Public Servers</h2>
                    <span class="badge" id="serverCount">0 <i class="fa-solid fa-globe"></i></span>
                </div>
                <div class="grid grid-cols-3" id="serverGrid">
                    <!-- Servers injected here -->
                    <p class="text-secondary">Loading servers...</p>
                </div>
            </div>
        </section>
	`;

	return panelLayout({
		lang,
    	langDict,
		title: 'Dashboard | Erwin Redoté',
		description: 'The dashboard for niwer.dev, where you can manage your account, view your purchases, and access exclusive content.',
		canonical: 'https://niwer.dev/panel.html',
		content,
        additionalScripts: [
            'js/panel.js'
        ]
	});
}