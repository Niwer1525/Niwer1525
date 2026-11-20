import { translate } from '../utils.ts';
import type { LangDict, SeasonalData } from '../types.ts';

export function footer(lang = 'en', langDict: LangDict = {}, seasonal: SeasonalData = { background: '', glow: '', emoji: '' }) {
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
            <a class="button" href="https://wakatime.niwer.dev" target="_blank" title="Wakatime Profile" aria-label="Wakatime Profile">
                <!-- Wakatime doesn't have an official icon, then we use a custom SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" class="wakatime" width="100%" height="100%" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256"><path d="M128 0C57.308 0 0 57.308 0 128s57.308 128 128 128 128-57.307 128-128C256 57.308 198.693 0 128 0m0 33.805c51.939 0 94.195 42.256 94.195 94.195 0 51.94-42.256 94.195-94.195 94.195S33.805 179.94 33.805 128 76.061 33.805 128 33.805m-12.5 121.838h-.113a6.34 6.34 0 0 1-4.953-2.528L81.56 114.732a6.34 6.34 0 0 1 10.131-7.62l23.993 31.893 6.863-8.478a6.34 6.34 0 0 1 4.926-2.35h.008a6.33 6.33 0 0 1 4.93 2.364l6.59 8.187 37.692-48.594a6.338 6.338 0 0 1 10.015 7.77L144.1 152.837a6.34 6.34 0 0 1-4.95 2.453h-.057a6.34 6.34 0 0 1-4.938-2.364l-6.697-8.319-7.033 8.686a6.34 6.34 0 0 1-4.926 2.35"/></svg>
                Wakatime
            </a>
            <a class="button" href="https://youtube.niwer.dev" target="_blank" title="YouTube Channel" aria-label="YouTube Channel">
                <i class="fa-brands fa-youtube"></i>
                Youtube
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
        <p>
            ${translate(langDict, "made_by").replace('{emoji}', seasonal.emoji || '❤️')} - <a href="https://sponsor.niwer.dev">${translate(langDict, "sponsor")}</a>
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