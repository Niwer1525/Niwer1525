import fs from 'node:fs/promises';
import path from 'node:path';
import { minify } from 'html-minifier-terser';

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  minifyCSS: true,
  minifyJS: true
};

// Import page renderers
import { render as renderIndex } from './src/pages/index.js';
import { render as renderStore } from './src/pages/store.js';
import { render as renderLegal } from './src/pages/legal.js';

async function build() {
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');
  const staticDir = path.join(rootDir, 'src/static');

  console.log('Building website...');

  // Reset dist directory
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  // Copy static assets (css, client-side js, images) directly to dist
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

  const languages = ['en', 'fr'];
  for (const lang of languages) {
    const jsonPath = path.join(rootDir, `src/data/langs/${lang}/global.json`);
    const rawData = await fs.readFile(jsonPath, 'utf8');
    const dict = JSON.parse(rawData);

    // English goes to dist/, French goes to dist/fr/
    const outFolder = lang === 'en' ? distDir : path.join(distDir, lang);
    await fs.mkdir(outFolder, { recursive: true });

    // Render pages
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
  
  console.log('✓ Build complete! Static assets and pre-rendered pages ready in ./dist');
}

build().catch((err) => {
  console.error('Build process failed:', err);
  process.exit(1);
});