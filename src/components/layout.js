import { nav } from './nav.js';
import { footer } from './footer.js';
import { contactModal } from './modals/contact_modal.js';

export function layout({ title, description, canonical, content }) {
  return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <meta name="description" content="${description}">
                <link rel="canonical" href="${canonical}">
                <link rel="shortcut icon" href="./assets/profile.webp">

                <!-- Open Graph -->
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:url" content="${canonical}">
                <meta property="og:image" content="https://niwer.dev/assets/profile.webp">

                <link rel="stylesheet" href="css/main.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css">
            </head>
            <body>
                ${nav()}
                <main>${content}</main>
                ${contactModal()}
                ${footer()}
                <script src="./js/stats.js" defer></script> <!-- Load stats script -->
                <script src="./js/i18n.js" defer></script> <!-- Load first to ensure languages are loaded -->
                <script src="./js/main.js" defer></script> <!-- Load main script -->
                <script src="./js/theme.js" defer></script> <!-- Load theme script -->
            </body>
        </html>
    `;
}