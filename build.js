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
  const dataFile = path.join(rootDir, 'src/data/global.json');

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

  // Load global data
  let globalData = {};
  try {
    const rawData = await fs.readFile(dataFile, 'utf8');
    globalData = JSON.parse(rawData);
  } catch (err) {
    console.warn('Warning: No global.json found or failed to parse. Proceeding with empty data.');
  }

  // Render and write HTML pages
  const pages = [
    { filename: 'index.html', renderer: () => renderIndex(globalData) },
    { filename: 'store.html', renderer: () => renderStore(globalData) },
    { filename: 'legal.html', renderer: () => renderLegal() }
  ];

  for (const page of pages) {
    const rawHtml = await page.renderer();
    const minifiedHtml = await minify(rawHtml, minifyOptions);
    await fs.writeFile(path.join(distDir, page.filename), minifiedHtml, 'utf8');
    console.log(`✓ Generated ${page.filename} (minified)`);
  }

  console.log('✓ Build complete! Static assets and pre-rendered pages ready in ./dist');
}

build().catch((err) => {
  console.error('Build process failed:', err);
  process.exit(1);
});