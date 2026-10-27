import fs from 'node:fs/promises';
import path from 'node:path';
import { minify } from 'html-minifier-terser';
import { bundle } from 'lightningcss';
import { build as buildJs, transform as transformJs } from 'esbuild';

/* Import page renderers */
import { render as renderIndex } from './src/pages/index.js';
import { render as renderStore } from './src/pages/store.js';
import { fetchPosts as fetchBlogPosts, render as renderBlog, renderPost as renderBlogPost } from './src/pages/blog.js';
import { render as renderLegal } from './src/pages/legal.js';
import { render as renderPanel } from './src/pages/panel.js';
import { render as renderPanelDownloads } from './src/pages/panel/downloads.js';
import { render as renderPanelLicenses } from './src/pages/panel/licenses.js';
import { render as renderPanelAdmin } from './src/pages/panel/admin.js';
import { render as renderPanelProfile } from './src/pages/panel/user_profile.js';
import { render as render404 } from './src/pages/errors/404.js';
import { render as renderDigitalId } from './src/pages/digital_id.js';

const MINIFY_OPTIONS = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    minifyCSS: true,
    minifyJS: true
};

const API_BASE_URL = process.env.API_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://panel.niwer.dev' : 'http://localhost:17070');

const BUILD_CONTEXT = Object.freeze({
    apiBaseUrl: API_BASE_URL
});

const PAGES = [
    { file: 'index.html', render: renderIndex },
    { file: 'store.html', render: renderStore },
    {
        file: 'blog/index.html',
        render: renderBlog,
        data: fetchBlogPosts,
        children: (posts, lang, dict) => posts.map(post => ({
            file: `blog/${encodeURIComponent(post.slug)}.html`,
            render: () => renderBlogPost(post, lang, dict)
        }))
    },
    { file: 'legal.html', render: renderLegal },
    { file: 'panel.html', render: renderPanel },
    { file: 'panel/downloads.html', render: renderPanelDownloads },
    { file: 'panel/licenses.html', render: renderPanelLicenses },
    { file: 'panel/admin.html', render: renderPanelAdmin },
    { file: 'panel/profile.html', render: renderPanelProfile },
    { file: '404.html', render: render404, locale: ['en'] },
    { file: 'digital-id.html', render: renderDigitalId, locale: ['en'] }
];

const JS_BUILD_OPTIONS = {
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'esnext',
    write: false
};

const MINIFIED_JS_OPTIONS = {
    minify: true,
    format: 'esm',
    target: 'esnext',
    define: { 'process.env.API_BASE_URL': JSON.stringify(API_BASE_URL) }
};

const logGeneratedPage = (lang, file) => {
    console.log(`✓ [${lang.toUpperCase()}] Generated ${path.join(lang === 'en' ? '' : lang, file)}`);
};

async function getScriptEntries(rootDir) {
    const entriesDir = path.join(rootDir, 'src/scripts/entries');
    const entries = await fs.readdir(entriesDir, { withFileTypes: true });

    return entries
        .filter(entry => entry.isFile() && path.extname(entry.name) === '.js')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(entry => [
            path.basename(entry.name, '.js'),
            path.join('src/scripts/entries', entry.name)
        ]);
}

async function writeMinifiedHtml(file, html) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, await minify(html, MINIFY_OPTIONS), 'utf8');
}

async function processStaticFile(srcPath, destPath) {
    const ext = path.extname(srcPath).toLowerCase();

    if (!['.html', '.css', '.js'].includes(ext)) return fs.copyFile(srcPath, destPath);
    if (ext === '.html') return writeMinifiedHtml(destPath, await fs.readFile(srcPath, 'utf8'));
    if (ext === '.css') {
        const { code } = bundle({ filename: srcPath, minify: true });
        return fs.writeFile(destPath, code, 'utf8');
    }

    if (srcPath.endsWith(path.join('static', 'js', 'stats.js'))) {
        const { outputFiles } = await buildJs({
            ...JS_BUILD_OPTIONS,
            entryPoints: [srcPath],
            define: MINIFIED_JS_OPTIONS.define
        });
        return fs.writeFile(destPath, outputFiles[0].text, 'utf8');
    }

    const source = await fs.readFile(srcPath, 'utf8');
    const { code } = await transformJs(source, MINIFIED_JS_OPTIONS);
    return fs.writeFile(destPath, code, 'utf8');
}

async function processStaticFiles(srcDir, destDir) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    await fs.mkdir(destDir, { recursive: true });

    await Promise.all(entries.map(async entry => {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) return processStaticFiles(srcPath, destPath);
        if (entry.isFile()) return processStaticFile(srcPath, destPath);
        return undefined;
    }));
}

async function bundleScripts(rootDir, distDir) {
    const outputDir = path.join(distDir, 'js');
    await fs.mkdir(outputDir, { recursive: true });
    const scriptEntries = await getScriptEntries(rootDir);

    await Promise.all(scriptEntries.map(async ([name, entry]) => {
        const { outputFiles } = await buildJs({
            ...JS_BUILD_OPTIONS,
            entryPoints: [path.join(rootDir, entry)],
            define: MINIFIED_JS_OPTIONS.define
        });
        await fs.writeFile(path.join(outputDir, `${name}.js`), outputFiles[0].text, 'utf8');
        console.log(`✓ Bundled ${name}.js`);
    }));
}

async function renderPage(page, lang, dict, outFolder) {
    const { file, render, locale, data, children } = page;
    if (locale && !locale.includes(lang)) return;

    const pageData = data ? await data(BUILD_CONTEXT.apiBaseUrl, lang) : undefined;
    await writeMinifiedHtml(
        path.join(outFolder, file),
        await render(lang, dict, BUILD_CONTEXT, pageData)
    );
    logGeneratedPage(lang, file);

    if (!children) return;
    await Promise.all(children(pageData, lang, dict).map(async child => {
        await writeMinifiedHtml(
            path.join(outFolder, child.file),
            await child.render()
        );
        logGeneratedPage(lang, child.file);
    }));
}

async function build() {
    const rootDir = process.cwd();
    const distDir = path.join(rootDir, 'dist');

    console.log('Building website...');

    /* Reset dist directory & copy static assets & process/minify static assets */
    await fs.rm(distDir, { recursive: true, force: true });
    await processStaticFiles(path.join(rootDir, 'src/static'), distDir);
    await bundleScripts(rootDir, distDir);

    /* Render and write HTML pages for each language */
    await Promise.all(['en', 'fr'].map(async lang => {
        const jsonPath = path.join(rootDir, `src/data/langs/${lang}/global.json`);
        const dict = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
        const outFolder = lang === 'en' ? distDir : path.join(distDir, lang);

        await Promise.all(PAGES.map(page => renderPage(page, lang, dict, outFolder)));
    }));
    
    /* Bundle CSS */
    console.log('Bundling modular CSS...');
    const { code: cssBuffer } = bundle({
        filename: path.join(rootDir, 'src/styles/main.css'),
        minify: true
    });

    const outCssDir = path.join(distDir, 'assets');
    await fs.mkdir(outCssDir, { recursive: true });
    await fs.writeFile(path.join(outCssDir, 'main.css'), cssBuffer.toString('utf8'), 'utf8');

    console.log('✓ Build complete! Static assets and pages ready in ./dist');
}

build().catch((err) => {
    console.error('Build process failed:', err);
    process.exit(1);
});