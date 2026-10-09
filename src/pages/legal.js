import fs from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { layout } from '../components/layout.js';

export async function render() {
  const legalDir = path.resolve('src/data/legal');

  // Helper to safely load and convert a Markdown file
  const loadMd = async (fileName) => {
    try {
      const text = await fs.readFile(path.join(legalDir, fileName), 'utf8');
      return marked.parse(text);
    } catch {
      return '';
    }
  };

  const copyrightHtml = await loadMd('copyright_notice.md');
  const tosHtml = await loadMd('terms_of_service.md');
  const termsOfSaleHtml = await loadMd('terms_of_sale.md');
  const privacyHtml = await loadMd('privacy_policy.md');

  const content = `
    <article class="legal-notice">
      <section>
        <h1>Legal Notice</h1>
        ${copyrightHtml}
      </section>
      <hr>
      <section id="terms_of_service">
        <h2>Terms of Service</h2>
        ${tosHtml}
      </section>
      <hr>
      <section id="terms_of_sale">
        <h2>Terms of Sale</h2>
        ${termsOfSaleHtml}
      </section>
      <hr>
      <section id="privacy_policy">
        <h2>Privacy Policy</h2>
        ${privacyHtml}
      </section>
    </article>
  `;

  return layout({
    pageName: 'legal',
    title: 'Terms of Service & Privacy Policy | Erwin Redoté',
    description: 'Legal notices, terms of service, terms of sale, and privacy policies for niwer.dev.',
    canonical: 'https://niwer.dev/legal.html',
    content
  });
}