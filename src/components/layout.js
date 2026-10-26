import { footer } from './footer.js';
import { authModal } from './modals/auth_modal.js';
import { contactModal } from './modals/contact_modal.js';
import { defaultNavigation, panelNavigation } from './nav.js';
import { seasonal } from './seasonal.js';

function addScripts(scripts) {
    return scripts.map(script => {
        const attrs = Object.entries(script)
            .filter(([key]) => key !== 'file')
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        return `<script src="${script.file}" ${attrs}></script>`;
    }).join('\n');
}

function layout({ title = 'Default Title', description = '', canonical = '', lang = 'en', body = '', additionalScripts = [], scripts = ['/js/public.js'], headScripts = [] }) {
    const SEASONAL = seasonal();
    return `
        <!DOCTYPE html>
        <html lang="${lang}"${SEASONAL.glow ? ` style="--seasonal-glow:${SEASONAL.glow}"` : ''}>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <meta name="description" content="${description}">
                <link rel="canonical" href="${canonical}">
                <link rel="shortcut icon" href="/assets/profile.webp">
                ${headScripts.map(script => `<script ${script}></script>`).join('\n')}

                <!-- Open Graph -->
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:url" content="${canonical}">
                <meta property="og:image" content="https://niwer.dev/assets/profile.webp">

                <link rel="stylesheet" href="/assets/main.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.1/css/all.min.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css">
            </head>
            <body>
                ${body}

                <!-- Scripts -->
                ${addScripts(scripts.map(file => ({ file, defer: true, type: 'module' })))}
                ${addScripts(additionalScripts)}
            </body>
        </html>
    `;
}

export function emptyLayout({ lang = 'en', langDict = [], title, description, canonical, content, additionalScripts = [], scripts = [] }) {
    return layout({
        title,
        description,
        canonical,
        lang,
        body: `
            <main>
                ${content}
            </main>
        `,
        additionalScripts,
        scripts
    });
}

export function defaultLayout({ page, lang = 'en', langDict = [], title, description, canonical, content, additionalScripts = [], scripts = ['/js/public.js'], headScripts = [] }) {
    return layout({
        title,
        description,
        canonical,
        lang,
        body: `
            ${defaultNavigation(page, lang, langDict)}
            <main>
                ${content}
                ${contactModal(langDict)}
            </main>
            ${footer(lang, langDict, seasonal())}
        `,
        scripts,
        additionalScripts,
        headScripts
    });
}

export function panelLayout({ page, lang = 'en', langDict = [], title, description, canonical, content, additionalScripts = [] }) {
    return layout({
        title,
        description,
        canonical,
        lang,
        body: `
            ${panelNavigation(page, lang, langDict)}
            <main>
                ${content}
                ${contactModal(langDict)}
                ${authModal(langDict)}
            </main>
            ${footer(lang, langDict, seasonal())}
        `,
        scripts: ['/js/panel.js'],
        additionalScripts: [],
    });
}

export function errorLayout({ lang = 'en', langDict = [], title, description, canonical, content, additionalScripts = [] }) {
    return layout({
        title,
        description,
        canonical,
        lang,
        body: `
            <main>
                ${content}
                ${contactModal(langDict)}
            </main>
            ${footer(lang, langDict, seasonal())}
        `,
        additionalScripts
    });
}