export function nav() {
  return `
    <header id="top">
        <nav>
            <!-- Mobile Navigation -->
            <input type="checkbox" id="menu-toggle">
            <label for="menu-toggle" class="menu-icon"><i class="fas fa-bars"></i></label> <!-- Mobile menu icon for navigation -->
            
            <!-- Navigation Links -->
            <ul id="nav-links">
                <li><a href="./index.html#presentation" data-i18n="btn.about">About</a></li>
                <li><a href="./index.html#storyline" data-i18n="btn.timeline">Time line</a></li>
                <li><a href="./index.html#skills" data-i18n="btn.skills">Skills</a></li>
                <li><a href="./index.html#stats" data-i18n="btn.github_stats">Statistics</a></li>
                <li><a href="./index.html#projects" data-i18n="btn.projects">Projects</a></li>
                <li><a href="./index.html#gists" data-i18n="btn.gists">Gists</a></li>
                <li><a href="./store.html" data-i18n="btn.store">Store</a></li>
                <li><a href="./#links" data-i18n="btn.contact">Contact</a></li>
                <li class="nav-actions">
                    <button id="theme-toggle" type="button" aria-label="Theme mode" title="Theme mode">
                        <i class="fa-solid fa-circle-half-stroke"></i>
                        <span id="theme-toggle-label">System</span>
                    </button>
                    <div class="languages-grid">
                        <a href="#" onclick="changeLanguage('en')">
                            <img loading="lazy" draggable="false" src="./assets/icons/united-kingdom.webp" alt="united_kingdom_logo">
                        </a>
                        <a href="#" onclick="changeLanguage('fr')">
                            <img loading="lazy" draggable="false" src="./assets/icons/france.webp" alt="france_logo">
                        </a>
                    </div>
                </li>
            </ul>
        </nav>
    </header>
  `;
}