class IncNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <!-- Basic Navigation -->
            <nav>
                <!-- Mobile Navigation -->
                <input type="checkbox" id="menu-toggle">
                <label for="menu-toggle" class="menu-icon"><i class="fas fa-bars"></i></label> <!-- Mobile menu icon for navigation -->
                <!-- Navigation Links -->
                <ul id="nav-links">
                    <li><a href="./#presentation" data-i18n="btn.about">About</a></li>
                    <li><a href="./#storyline" data-i18n="btn.timeline">Time line</a></li>
                    <li><a href="./#skills" data-i18n="btn.skills">Skills</a></li>
                    <li><a href="./#stats" data-i18n="btn.github_stats">Statistics</a></li>
                    <li><a href="./#projects" data-i18n="btn.projects">Projects</a></li>
                    <li><a href="./#gists" data-i18n="btn.gists">Gists</a></li>
                    <li><a href="./store.html" data-i18n="btn.store">Store</a></li>
                    <li><a href="#links" data-i18n="btn.contact">Contact</a></li>
                    <li>
                        <button id="theme-toggle" type="button" aria-label="Theme mode" title="Theme mode">
                            <i class="fa-solid fa-circle-half-stroke"></i>
                            <span id="theme-toggle-label">System</span>
                        </button>
                    </li>
                    <li class="languages-grid">
                        <a href="./index.html" onclick="changeLanguage('en')">
                            <img loading="lazy" draggable="false" src="./assets/icons/united-kingdom.webp" alt="united_kingdom_logo">
                        </a>
                        <a href="./index.html" onclick="changeLanguage('fr')">
                            <img loading="lazy" draggable="false" src="./assets/icons/france.webp" alt="france_logo">
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    }
}
customElements.define('inc-nav', IncNav); 

/* Contact Modal */
class IncContact extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div id="contact-popup">
                <form id="contact-form">
                    <input type="hidden" name="access_key" value="f18de961-019b-4e2a-ad3d-dffbb5136e1f">
                    <button type="button" id="close" onclick="hideContactPopup()">X</button>
                    <h2 data-i18n="form.title">
                        Got a project or questions?<br>
                        Let's talk!
                    </h2>
                    <!-- The form should be fixed thank to Web3Forms -->
                    <!-- <h3 data-i18n="form.subtitle">
                        This form may not work due to Github Pages limitations.<br>
                        If so, please contact me on discord !
                    </h3> -->
                    <label>
                        <i class="fa fa-user"></i>
                        <input type="text" name="name" placeholder="Name" required>
                    </label>
                    <label>
                        <i class="fa fa-envelope"></i>
                        <input type="email" name="email" placeholder="Email" required>
                    </label>
                    <label>
                        <i class="fa fa-comment"></i>
                        <textarea name="message" placeholder="Message" required></textarea>
                    </label>
                    <div>
                        <button type="submit" data-i18n="btn.send"><i class="fa fa-paper-plane"></i>Send</button>
                        <a class="link-button" onclick="copyDiscordId()" title="📋 Discord ID">
                            <i class="fa-brands fa-discord"></i>
                            Discord
                        </a>
                    </div>
                    <a href="mailto:contact@niwer.dev" class="link-button" data-i18n="btn.open_email">
                        <i class="fa fa-envelope"></i>
                        Open email application
                    </a>
                    <a onclick="copyEmail()" class="email-link">
                        contact@niwer.dev
                    </a>
                </form>
            </div>
        `;
    }
}
customElements.define('inc-contact', IncContact); 

/* Footer */
class IncFooterContent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <inc-contact></inc-contact>
            <div class="links" id="links">
                <a class="link-button" onclick="showContactPopup()">
                    <i class="fa fa-envelope"></i>
                    Contact
                </a>
                <a class="link-button" onclick="copyDiscordId()">
                    <i class="fa-brands fa-discord"></i>
                    Discord
                </a>
                <a class="link-button" href="https://git.niwer.dev" target="_blank">
                    <i class="fa-brands fa-github"></i>
                    Github
                </a>
                <a class="link-button" href="https://stackoverflow.niwer.dev" target="_blank">
                    <i class="fa-brands fa-stack-overflow"></i>
                    Stack Overflow
                </a>
                <a class="link-button" href="https://wakatime.niwer.dev" target="_blank">
                    <!-- <i class="fa-brands fa-wakatime"></i> --> <!-- Wakatime doesn't have an official icon, so we can use a custom one or just text -->
                    Wakatime
                </a>
                <a class="link-button" href="https://youtube.niwer.dev" target="_blank">
                    <i class="fa-brands fa-youtube"></i>
                    Youtube
                </a>
                <a class="link-button" href="https://modrinth.niwer.dev" target="_blank">
                    <!-- <i class="fa-brands fa-modrinth"></i> --> <!-- Modrinth doesn't have an official icon, so we can use a custom one or just text -->
                    Modrinth
                </a>
            </div>
            <div>
                <a href="#top" class="back-to-top" title="Back to top" aria-label="Back to top">
                    <i class="fa fa-arrow-up" aria-hidden="true"></i>
                    <span class="sr-only">Back to top</span>
                </a>
            </div>
            <p data-i18n="made_by">Made with ❤️ by Niwer</p>
            <a href="./license.html" data-i18n="copyright">Copyright - All rights reserved</a>
        `;
    }
}
customElements.define('inc-footer-content', IncFooterContent); 