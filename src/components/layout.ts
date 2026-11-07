import type { LangDict } from '../types.ts';
import { footer } from './footer.ts';
import { authModal } from './modals/auth_modal.ts';
import { contactModal } from './modals/contact_modal.ts';
import { logoutModal } from './modals/logout_modal.ts';
import { defaultNavigation, panelNavigation } from './nav.ts';
import { seasonal } from './seasonal.ts';

interface LayoutOptions {
    title?: string;
    description?: string;
    canonical?: string;
    lang?: string;
    body?: string;
    headCss?: string[];
    scripts?: string[];
    headScripts?: string[];
}

function addScripts(scripts: { file: string; [key: string]: unknown }[]): string {
    return scripts.map(script => {
        const attrs = Object.entries(script)
            .filter(([key]) => key !== 'file')
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        return `<script src="${script.file}" ${attrs}></script>`;
    }).join('\n');
}

function addStylesheets(stylesheets: string[]): string {
    return stylesheets
        .map(stylesheet => `<link rel="stylesheet" href="${stylesheet}">`)
        .join('\n');
}

function layout({ title = 'Default Title', description = '', canonical = '', lang = 'en', body = '', headCss = [], scripts = ['/js/public.js'], headScripts = [] }: LayoutOptions): string {
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
                <link rel="stylesheet" href="/vendor/fontawesome/css/all.min.css">
                ${addStylesheets(headCss)}
            </head>
            <body>
                ${body}

                <!-- Scripts -->
                ${addScripts(scripts.map(file => ({ file, defer: true, type: 'module' })))}
            </body>
        </html>
    `;
}

interface PageLayoutOptions extends LayoutOptions { page?: string; langDict?: LangDict; content?: string; }

export function emptyLayout({ lang = 'en', langDict = {}, title, description, canonical, content = '', headCss = [], scripts = [] }: PageLayoutOptions): string {
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
        headCss,
        scripts
    });
}

export function defaultLayout({ page = 'index', lang = 'en', langDict = {}, title, description, canonical, content = '', headCss = [], scripts = ['/js/public.js'], headScripts = [] }: PageLayoutOptions): string {
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
        headCss,
        headScripts
    });
}

export function panelLayout({ page = 'panel', lang = 'en', langDict = {}, title, description, canonical, content = '', headCss = [] }: PageLayoutOptions): string {
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
                ${logoutModal(langDict)}
            </main>
            ${footer(lang, langDict, seasonal())}
        `,
        scripts: ['/js/panel.js'],
        headCss,
    });
}

export function errorLayout({ lang = 'en', langDict = {}, title, description, canonical, content = '', headCss = [] }: PageLayoutOptions): string {
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
        headCss
    });
}