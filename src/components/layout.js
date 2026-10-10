import { nav } from './nav.js';
import { footer } from './footer.js';
import { contactModal } from './modals/contact_modal.js';

// function addScripts(scripts) {
//     return scripts.map(script => `<script src="${script}" defer></script>`).join('\n');
// }

function addScripts(scripts) {
    return scripts.map(script => {
        const attrs = Object.entries(script)
            .filter(([key]) => key !== 'file')
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        return `<script src="${script.file}" ${attrs}></script>`;
    }).join('\n');
}

export function layout({ lang = 'en', langDict, title, description, canonical, content, additionalScripts = [] }) {
  return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <meta name="description" content="${description}">
                <link rel="canonical" href="${canonical}">
                <link rel="shortcut icon" href="/assets/profile.webp">
                <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
                <script type="module" src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1/lite-youtube.min.js"></script>

                <!-- Open Graph -->
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:url" content="${canonical}">
                <meta property="og:image" content="https://niwer.dev/assets/profile.webp">

                <link rel="stylesheet" href="/css/main.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css">
            </head>
            <body>
                <!-- Content -->
                ${nav(lang, langDict)}
                <main>${content}</main>
                ${contactModal(langDict)}
                ${footer(lang, langDict)}

                <!-- Scripts -->
                <script src="/js/main.js" defer></script> <!-- Load main script -->
                <script src="/js/stats.js" defer></script> <!-- Stats script, required by the theme script -->
                <script src="/js/theme.js" defer></script> <!-- Load theme script -->
                ${addScripts(additionalScripts)}
            </body>
        </html>
    `;
}