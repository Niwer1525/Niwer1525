import { panelLayout } from '../../components/layout.js';

export async function render(lang, langDict) {
    const content = `
        <section id="page-user" class="page">
            <div class="panel">
                <div class="panel-header">
                    <h2><i class="fa-solid fa-box-open text-accent"></i> Your Products</h2>
                </div>
                <div class="grid grid-cols-3" id="entitlementsGrid">
                    <p class="text-secondary">Sign in to view your products.</p>
                </div>
            </div>
            <div class="panel">
                <div class="panel-header">
                    <h2><i class="fa-solid fa-user text-accent"></i> Your Profile</h2>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn icon-btn" id="btnSetup2FA" title="Configure 2FA" onclick="App.open2FASetup()">
                            <i class="fa-solid fa-shield-halved"></i>
                        </button>
                        <button id="btnEditProfile" class="btn primary icon-btn" title="Edit Profile">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button id="btnDeleteAccount" class="btn danger icon-btn" title="Delete Account" style="color: var(--danger-color, #ef4444);">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2" id="profileDetailsGrid"></div>
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