import { projects } from '../components/projects.js';
import { skillsCards } from '../components/skills.js';
import { gists } from '../components/gists.js';
import { stats } from '../components/stats.js';
import { defaultLayout } from '../components/layout.js';
import { getValueWithFallback } from '../utils.js';

export async function render(lang, langDict) {
  const content = `
    <section id="presentation">
      <div>
        <h1>REDOTÉ Erwin</h1>
        <p>${getValueWithFallback(langDict, 'content_aboute_me', 'Self-taught developer, passionate about code and backend architecture.')}</p>
        
        <!-- Open to Work Badge -->
        <div class="flex-center-wrap open-to-work-badge">
            <span class="badge-item">
                <i class="fa-solid fa-briefcase"></i>
                <span>${getValueWithFallback(langDict, 'badge.open_to_work', 'Open to Work')}</span>
            </span>
            <span class="badge-item">
                <i class="fa-solid fa-globe"></i>
                <span>${getValueWithFallback(langDict, 'badge.remote', 'Remote')}</span>
            </span>
            <span class="badge-item">
                <i class="fa-solid fa-handshake"></i>
                <span>${getValueWithFallback(langDict, 'badge.freelance', 'Freelance')}</span>
            </span>
            <span class="badge-item">
                <i class="fa-solid fa-clock"></i>
                <span>${getValueWithFallback(langDict, 'badge.available', 'Available: Immediately')}</span>
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
          defer: true
      }
    ]
  });
}