import { getValueWithFallback } from '../utils.js';


export function gists(langDict) {
  return `
        <section id="gists">
            <h2>Gists</h2>
            <div id="gists-grid" class="articles-grid">
                <!-- There will be gists -->
            </div>
            <a class="button" href="https://gist.niwer.dev" target="_blank" rel="noopener noreferrer">${getValueWithFallback(langDict, 'explore.gists', 'Explore my Gists')}</a>
            <input type="number" id="gists-limit" min="1" max="100" value="6" placeholder="Number of gists to show">
        </section>    
    `;
}