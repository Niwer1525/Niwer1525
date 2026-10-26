import { translate } from '../utils.js';

export function footer(lang = 'en', langDict, seasonal = {}) {
  const legalUrl = lang === 'en' ? '/legal.html' : `/${lang}/legal.html`;
  return `
    <div id="seasonal-bg" class="seasonal-bg" aria-hidden="true">${seasonal.background || ''}</div>
    <footer id="links">
        <div class="links">
            <span class="button" onclick="showPopup('contact-popup')" title="Contact" aria-label="Contact">
                <i class="fa fa-envelope"></i>
                Contact
            </span>
            <a class="button" href="https://git.niwer.dev" target="_blank" title="Github Profile" aria-label="Github Profile">
                <i class="fa-brands fa-github"></i>
                Github
            </a>
            <a class="button" href="https://stackoverflow.niwer.dev" target="_blank" title="Stack Overflow Profile" aria-label="Stack Overflow Profile">
                <i class="fa-brands fa-stack-overflow"></i>
                Stack Overflow
            </a>
            <a class="button" href="https://wakatime.niwer.dev" target="_blank" title="Wakatime Profile" aria-label="Wakatime Profile">
                <!-- <i class="fa-brands fa-wakatime"></i> --> <!-- Wakatime doesn't have an official icon, so we can use a custom one or just text -->
                Wakatime
            </a>
            <a class="button" href="https://youtube.niwer.dev" target="_blank" title="YouTube Channel" aria-label="YouTube Channel">
                <i class="fa-brands fa-youtube"></i>
                Youtube
            </a>
            <a class="button" href="https://modrinth.niwer.dev" target="_blank" title="Modrinth Profile" aria-label="Modrinth Profile">
                <!-- <i class="fa-brands fa-modrinth"></i> --> <!-- Modrinth doesn't have an official icon, so we can use a custom one or just text -->
                Modrinth
            </a>
            <a class="button" href="https://www.linkedin.com/in/niwerdev" target="_blank" title="LinkedIn Profile" aria-label="LinkedIn Profile">
                <i class="fa-brands fa-linkedin"></i>
                LinkedIn
            </a>
        </div>
        <ul>
            <li><a href="${legalUrl}#terms_of_service">${translate(langDict, "btn.terms_of_service")}</a></li>
            <li><a href="${legalUrl}#terms_of_sale">${translate(langDict, "btn.terms_of_sale")}</a></li>
            <li><a href="${legalUrl}#privacy_policy">${translate(langDict, "btn.privacy_policy")}</a></li>
        </ul>
        <hr>
        <p id="footer-made-by">
            ${translate(langDict, "made_by")} ${seasonal.emoji || '❤️'} - <a href="https://sponsor.niwer.dev">${translate(langDict, "sponsor")}</a>
        </p>
        <p>${translate(langDict, "copyright")}</p>
    </footer>

    <!-- Back to top button -->
    <div class="back-to-top-container hidden">
        <a href="#top" class="back-to-top button" title="Back to top" aria-label="Back to top">
            <i class="fa fa-arrow-up" aria-hidden="true"></i>
            <span class="sr-only">Back to top</span>
        </a>
    </div>
  `;
}

/* 
This may be added to the footer inside the panel page?
    <p>
    Powered by <a href="https://git.niwer.dev/Photon" target="_blank" rel="noopener noreferrer">Photon</a>, the open-source backend behind Niwer's products. Inspect our code and verify its security anytime.
    </p>
*/