import { SVGS } from './svgs.js';
import { escapeHtml } from '../main.js';

const SEASONS = {
    halloween: {
        glow: 'rgba(255, 123, 0, 0.7)',
        emoji: '🎃',
        from: { day: 20, month: 10 }, // October 20th
        to: { day: 2, month: 11 }, // November 2nd
        items: [
            { svg: SVGS.pumpkin, width: '160px', height: '145px', left: '5%', top: '-40px', rotate: '-10deg', clickable: true },
            { svg: SVGS.pumpkin, width: '110px', height: '100px', left: '14%', rotate: '8deg', clickable: true },
            { svg: SVGS.pumpkin, width: '180px', height: '165px', right: '7%', top: '-50px', rotate: '12deg', clickable: true }
        ]
    },
    christmas: {
        glow: 'rgba(230, 57, 70, 0.6)',
        emoji: '🎄',
        from: { day: 15, month: 12 }, // December 15th
        to: { day: 31, month: 12 }, // December 31st
        items: [
            { svg: SVGS.candyCane, width: '120px', height: '170px', left: '6%', top: '-50px', rotate: '-15deg', clickable: false },
            { svg: SVGS.christmasTree, width: '150px', height: '200px', right: '1%', top: '-110px', rotate: '0deg', clickable: true },
            { svg: SVGS.candyCane, width: '130px', height: '185px', right: '12%', top: '-80px', rotate: '18deg', clickable: false },
        ]
    },
    easter: {
        glow: 'rgba(157, 78, 221, 0.6)',
        emoji: '🥚',
        from: { day: 1, month: 4 }, // April 1st
        to: { day: 15, month: 4 }, // April 15th
        items: [
            { svg: SVGS.easterEgg_purple, width: '130px', height: '160px', left: '7%', top: '-40px', rotate: '-12deg', clickable: false },
            { svg: SVGS.easterEgg, width: '95px', height: '120px', left: '15%', top: '-20px', rotate: '10deg', clickable: false },
            { svg: SVGS.easterEgg_purple, width: '140px', height: '175px', right: '8%', top: '-60px', rotate: '8deg', clickable: false }
        ]
    },
    programmer_day: {
        glow: 'rgba(0, 255, 255, 0.6)',
        emoji: '💻',
        dayOfYear: 256, // September 12th or 13th in leap years
        items: []
    },
};

function detectSeason() {
    // Allow overriding the season via URL parameter for testing purposes
    const urlSeason = new URLSearchParams(window.location.search).get('season');
    if (urlSeason && SEASONS[urlSeason]) return urlSeason;

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

    for (const [key, season] of Object.entries(SEASONS)) {
        if (season.from && season.to) {
            const fromDate = new Date(now.getFullYear(), season.from.month - 1, season.from.day);
            const toDate = new Date(now.getFullYear(), season.to.month - 1, season.to.day);
            if (now >= fromDate && now <= toDate) return key;
        }
        else if (season.dayOfYear && dayOfYear === season.dayOfYear) return key;
    }
    return null;
}

function initSeasonal() {
    const seasonKey = detectSeason();
    if (!seasonKey) return;

    const season = SEASONS[seasonKey];
    document.documentElement.style.setProperty('--seasonal-glow', season.glow);

    /* Replace the heart emoji in the footer with the seasonal emoji */
    const madeBy = document.getElementById('footer-made-by');
    if (madeBy) madeBy.innerHTML = madeBy.innerHTML.replace('❤️', season.emoji);

    /* Inject the large SVGs around the footer */
    const container = document.getElementById('seasonal-bg');
    if (!container) return;

    /* Special themes for each season */
    switch (seasonKey) {
        case 'programmer_day':
            /* Make the page look like a terminal */
            // const htmlElement = document.querySelector('body');
            // htmlElement.style.fontFamily = 'monospace';
        
            /* Add the terminal */
            const terminalBg = document.createElement('div');
            terminalBg.className = 'terminal-rain-bg';
            terminalBg.innerHTML = generateTerminalCodeSnippet();
            container.appendChild(terminalBg);
            break;
        case 'halloween': break;
        case 'christmas': break;
        case 'easter': break;
    }

    /* Add decorative elements */
    season.items.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'seasonal-svg';
        wrapper.style.width = item.width;
        wrapper.style.height = item.height;
        if (item.left) wrapper.style.left = item.left;
        if (item.right) wrapper.style.right = item.right;
        wrapper.style.top = item.top;
        wrapper.style.transform = `rotate(${item.rotate})`;
        wrapper.innerHTML = item.svg;
        if(item.clickable) wrapper.addEventListener('click', () => wrapper.classList.toggle('is-lit')); // Why not giving a bit of interactivity? ;)
        container.appendChild(wrapper);
    });
}

function generateTerminalCodeSnippet() {
    const codeLines = [
        'niwer@erwin-main:~/Documents$ cd /home/niwer/Documents/Developpement/ProjectA/',
        'niwer@erwin-main:~/Documents/Developpement/ProjectA$ git pull origin main',
        'niwer@erwin-main:~/Documents/Developpement/ProjectA$ java --version',
        'openjdk 25.0.4.1 2026-08-18',
        'OpenJDK Runtime Environment (Red_Hat-25.0.4.1.1-1) (build 25.0.4.1+1)',
        'OpenJDK 64-Bit Server VM (Red_Hat-25.0.4.1.1-1) (build 25.0.4.1+1, mixed mode, sharing)',
        'niwer@erwin-main:~/Documents/Developpement/ProjectA$ ./gradlew clean test build',
        'niwer@erwin-main:~/Documents/Developpement/ProjectA$ clear',
        'niwer@erwin-main:~/Documents/Developpement/ProjectA$ echo "Hello, World!"'
    ];
    const duplicatedLines = [...codeLines, ...codeLines]; // Duplicate the lines to create a continuous scrolling effect
    return `
        <div class="code-stream">
            ${duplicatedLines.map(line => `<div>${escapeHtml(line)}</div>`).join('')}
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', initSeasonal);