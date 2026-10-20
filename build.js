import fs from 'node:fs/promises';
import path from 'node:path';
import { minify } from 'html-minifier-terser';
import { bundle } from 'lightningcss';
import { transform as transformJs } from 'esbuild';

/* Import page renderers */
import { render as renderIndex } from './src/pages/index.js';
import { render as renderStore } from './src/pages/store.js';
import { render as renderLegal } from './src/pages/legal.js';
import { render as renderPanel } from './src/pages/panel.js';
import { render as renderPanelDownloads } from './src/pages/panel/downloads.js';
import { render as renderPanelLicenses } from './src/pages/panel/licenses.js';
import { render as renderPanelAdmin } from './src/pages/panel/admin.js';
import { render as renderPanelProfile } from './src/pages/panel/user_profile.js';

const MINIFY_OPTIONS = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    minifyCSS: true,
    minifyJS: true
};

const PAGES = [
    { file: 'index.html', render: renderIndex },
    { file: 'store.html', render: renderStore },
    { file: 'legal.html', render: renderLegal },
    { file: 'panel.html', render: renderPanel },
    { file: 'panel/downloads.html', render: renderPanelDownloads },
    { file: 'panel/licenses.html', render: renderPanelLicenses },
    { file: 'panel/admin.html', render: renderPanelAdmin },
    { file: 'panel/profile.html', render: renderPanelProfile }
];

async function processStaticFiles(srcDir, destDir) {
    try {
        const entries = await fs.readdir(srcDir, { withFileTypes: true });
        await fs.mkdir(destDir, { recursive: true });

        for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);

            if (entry.isDirectory()) await processStaticFiles(srcPath, destPath); // Recursively process subdirectories
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
				if(ext !== '.html' && ext !== '.css' && ext !== '.js') { 
					await fs.copyFile(srcPath, destPath); // Copy other files as-is
					continue;
				}

				/* Process files based on their extension */
				switch (ext) {
					case '.html':
						const html = await fs.readFile(srcPath, 'utf8');
						const minifiedHtml = await minify(html, MINIFY_OPTIONS);
						await fs.writeFile(destPath, minifiedHtml, 'utf8');
						break;
					case '.css':
						const { code: cssCode } = bundle({ filename: srcPath, minify: true });
						await fs.writeFile(destPath, cssCode, 'utf8');
						break;
					case '.js':
						// const jsCode = await fs.readFile(srcPath, 'utf8');
						// const { code: minifiedJs } = await transformJs(jsCode, {
						// 	minify: true,
						// 	target: 'esnext'
						// });
						// await fs.writeFile(destPath, minifiedJs, 'utf8');
                        await fs.copyFile(srcPath, destPath); // Copy JS files as-is for now
						break;
				}
            }
        }
    } catch (err) {
        console.warn('Warning: Could not process static assets:', err.message);
    }
}

async function build() {
    const rootDir = process.cwd();
    const distDir = path.join(rootDir, 'dist');

    console.log('Building website...');

    /* Reset dist directory & copy static assets & process/minify static assets */
    await fs.rm(distDir, { recursive: true, force: true });
    await processStaticFiles(path.join(rootDir, 'src/static'), distDir);

    /* Render and write HTML pages for each language */
    for (const lang of ['en', 'fr']) {
        const jsonPath = path.join(rootDir, `src/data/langs/${lang}/global.json`);
        const dict = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
        const outFolder = lang === 'en' ? distDir : path.join(distDir, lang);

        for (const { file, render } of PAGES) {
            const html = await render(lang, dict);
            const minifiedHtml = await minify(html, MINIFY_OPTIONS);
            const destPath = path.join(outFolder, file);

            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, minifiedHtml, 'utf8');
            
            console.log(`✓ [${lang.toUpperCase()}] Generated ${path.join(lang === 'en' ? '' : lang, file)}`);
        }
    }
    
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