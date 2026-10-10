import fs from 'node:fs/promises';
import path from 'node:path';
import { minify } from 'html-minifier-terser';
import { bundle } from 'lightningcss';

/* Import page renderers */
import { render as renderIndex } from './src/pages/index.js';
import { render as renderStore } from './src/pages/store.js';
import { render as renderLegal } from './src/pages/legal.js';

const minifyOptions = {
	collapseWhitespace: true,
	removeComments: true,
	removeRedundantAttributes: true,
	minifyCSS: true,
	minifyJS: true
};

async function build() {
	const rootDir = process.cwd();
	const distDir = path.join(rootDir, 'dist');
	const staticDir = path.join(rootDir, 'src/static');

	console.log('Building website...');

	// Reset dist directory
	await fs.rm(distDir, { recursive: true, force: true });
	await fs.mkdir(distDir, { recursive: true });

	// Copy static assets (excluding raw CSS if any were in static)
	try {
		await fs.cp(staticDir, distDir, { recursive: true });
	} catch (err) {
		console.warn('Warning: Could not copy static assets from src/static:', err.message);
	}

	/* Copy store catalog */
	const catalogFilePath = path.join(rootDir, 'src/data/store_catalog.json');
	try {
		await fs.copyFile(catalogFilePath, path.join(distDir, 'store_catalog.json'));
	} catch (err) {
		console.warn('Warning: Could not copy store catalog:', err.message);
	}

	// Render and write HTML pages first
	const languages = ['en', 'fr'];
	for (const lang of languages) {
		const jsonPath = path.join(rootDir, `src/data/langs/${lang}/global.json`);
		const rawData = await fs.readFile(jsonPath, 'utf8');
		const dict = JSON.parse(rawData);

		const outFolder = lang === 'en' ? distDir : path.join(distDir, lang);
		await fs.mkdir(outFolder, { recursive: true });

		const pages = [
			{ filename: 'index.html', html: await renderIndex(lang, dict) },
			{ filename: 'store.html', html: await renderStore(lang, dict) },
			{ filename: 'legal.html', html: await renderLegal(lang, dict) }
		];

		for (const page of pages) {
			const minifiedHtml = await minify(page.html, minifyOptions);
			await fs.writeFile(path.join(outFolder, page.filename), minifiedHtml, 'utf8');
			console.log(`✓ [${lang.toUpperCase()}] Generated ${path.join(lang === 'en' ? '' : lang, page.filename)}`);
		}
	}
	
	// Bundle all modular CSS files into a single CSS string
	console.log('Bundling modular CSS...');
	const entryCssPath = path.join(rootDir, 'src/styles/main.css');
	
	const { code: bundledCssBuffer } = bundle({
		filename: entryCssPath,
		minify: true
	});
	const bundledCssString = bundledCssBuffer.toString('utf8');

	// Minify the purged result and write to dist/assets/main.css
	const outCssDir = path.join(distDir, 'assets');
	await fs.mkdir(outCssDir, { recursive: true });

	const distCssPath = path.join(outCssDir, 'main.css');
	await fs.writeFile(distCssPath, bundledCssString, 'utf8');
	console.log('✓ CSS bundled, purged, and written to dist/css/main.css');

	console.log('✓ Build complete! Static assets and pre-rendered pages ready in ./dist');
}

build().catch((err) => {
	console.error('Build process failed:', err);
	process.exit(1);
});