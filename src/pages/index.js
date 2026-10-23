import { projects } from '../components/projects.js';
import { skillsCards } from '../components/skills.js';
import { gists } from '../components/gists.js';
import { stats } from '../components/stats.js';
import { defaultLayout } from '../components/layout.js';
import { translate } from '../utils.js';

export async function render(lang, langDict) {
  const content = `
    <section id="presentation">
      <div>
        <h1>REDOTÉ Erwin</h1>
        <p>${translate(langDict, 'content_aboute_me')}</p>
        
        <!-- Open to Work Badge -->
        <div class="flex-center-wrap open-to-work-badge">
            <span class="badge-item">
                <i class="fa-solid fa-briefcase"></i>
                <span>${translate(langDict, 'badge.open_to_work')}</span>
            </span>
            <span class="badge-item">
                <i class="fa-solid fa-globe"></i>
                <span>${translate(langDict, 'badge.remote')}</span>
            </span>
            <span class="badge-item">
                <i class="fa-solid fa-handshake"></i>
                <span>${translate(langDict, 'badge.freelance')}</span>
            </span>
            <span class="badge-item">
                <i class="fa-solid fa-clock"></i>
                <span>${translate(langDict, 'badge.available')}</span>
            </span>
        </div>
      </div>
      <img src="/assets/profile.webp" alt="REDOTÉ Erwin" fetchpriority="high">
    </section>

    <!-- Skills -->
    ${skillsCards(langDict)}

    <!-- Github/Wakatime stats -->
    ${stats(langDict)}

    <!-- Projects -->
    ${await projects(lang, langDict)}

    <!-- Gists -->
    ${gists(langDict)}
  `;

  return defaultLayout({
    lang,
    langDict,
    title: 'Erwin Redoté (Niwer) - Developer Portfolio',
    description: 'Portfolio of Erwin Redoté, a Java and Web developer showcasing recent work and open source projects.',
    canonical: 'https://niwer.dev',
    content,
    additionalScripts: [
      {
          file: '/js/gists.js',
          defer: true,
          type: 'module'
      }
    ]
  });
}