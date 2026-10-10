import { getValueWithFallback } from '../utils.js';

export function footer(lang = 'en', langDict) {
  const currentYear = new Date().getFullYear();
  const legalUrl = lang === 'en' ? './legal.html' : `./${lang}/legal.html`;
  return `
    <footer id="links">
        <div class="links" id="links">
            <span class="link-button" onclick="showContactPopup()">
                <i class="fa fa-envelope"></i>
                Contact
            </span>
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
            <a class="link-button" href="https://www.linkedin.com/in/niwerdev" target="_blank">
                <i class="fa-brands fa-linkedin"></i>
                LinkedIn
            </a>
        </div>
        <div>
            <a href="#top" class="back-to-top" title="Back to top" aria-label="Back to top">
                <i class="fa fa-arrow-up" aria-hidden="true"></i>
                <span class="sr-only">Back to top</span>
            </a>
        </div>
        <ul>
            <li><a href="${legalUrl}#terms_of_service">${getValueWithFallback(langDict, "btn.terms_of_service", "Terms of Service")}</a></li>
            <li><a href="${legalUrl}#terms_of_sale">${getValueWithFallback(langDict, "btn.terms_of_sale", "Terms of Sale")}</a></li>
            <li><a href="${legalUrl}#privacy_policy">${getValueWithFallback(langDict, "btn.privacy_policy", "Privacy Policy")}</a></li>
        </ul>
        <hr>
        <p>${getValueWithFallback(langDict, "made_by", "Made with ❤️ by Niwer")}</p>
        <p>${getValueWithFallback(langDict, "copyright", `Copyright ${currentYear} - All rights reserved`)}</p>
        <a href="https://sponsor.niwer.dev">${getValueWithFallback(langDict, "sponsor", "Toss a coin to your Niwer")}</a>
    </footer>
  `;
}