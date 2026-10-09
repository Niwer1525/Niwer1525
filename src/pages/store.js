import { layout } from '../components/layout.js';
import { getValueWithFallback } from '../utils.js';

export async function render(lang, langDict) {
    const content = ``;

    return layout({
        lang,
        langDict,
        title: 'Developer Store & Digital Tools | Erwin Redoté',
        description: 'Explore developer tools, code repositories, and software products by Erwin Redoté.',
        canonical: 'https://niwer.dev/store.html',
        content
    });
}