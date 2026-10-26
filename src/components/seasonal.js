const SVGS = {
    pumpkin: '<svg viewBox="0 0 200 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M92 35 C90 15, 105 5, 118 12 C110 20, 108 28, 108 35 Z" fill="#2d6a4f"/><ellipse cx="60" cy="105" rx="45" ry="60" fill="#e85d04"/><ellipse cx="140" cy="105" rx="45" ry="60" fill="#e85d04"/><ellipse cx="100" cy="105" rx="52" ry="65" fill="#f48c06"/><polygon points="75,75 90,95 65,95" fill="#ffba08" class="pumpkin-face"/><polygon points="125,75 135,95 110,95" fill="#ffba08" class="pumpkin-face"/><path d="M65 115 L80 125 L92 115 L100 125 L108 115 L120 125 L135 115 L122 140 L100 132 L78 140 Z" fill="#ffba08" class="pumpkin-face"/></svg>',
    candyCane: '<svg viewBox="0 0 140 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="stripes" width="30" height="30" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><rect width="15" height="30" fill="#ffffff"/><rect x="15" width="15" height="30" fill="#e63946"/></pattern></defs><path d="M40 70 A35 35 0 0 1 110 70 L110 180" fill="none" stroke="url(#stripes)" stroke-width="26" stroke-linecap="round"/></svg>',
    christmasTree: '<svg viewBox="0 0 160 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="70" y="180" width="20" height="20" fill="#8d5524"/><path d="M70,180 Q80,185 90,180 Z" fill="#ffffff"/><polygon points="80,20 40,80 60,80 30,130 50,130 20,180 140,180 110,130 130,130 100,80 120,80" fill="#2a9d8f"/><polygon points="80,5 83,12 90,12 85,16 87,23 80,19 73,23 75,16 70,12 77,12" fill="#ffd166" stroke="#f4a261" stroke-width="1"/><path class="garland-lit" d="M 65,60 Q 80,75 95,60 M 45,105 Q 80,125 115,105 M 35,155 Q 80,175 125,155" fill="none" stroke="#e9c46a" stroke-width="2.5" stroke-dasharray="4,2"/><circle cx="70" cy="50" r="4" fill="#e76f51"/><circle cx="95" cy="70" r="4.5" fill="#f4a261"/><circle cx="60" cy="95" r="4" fill="#e76f51"/><circle cx="90" cy="110" r="4.5" fill="#457b9d"/><circle cx="75" cy="145" r="4" fill="#e76f51"/><circle cx="105" cy="150" r="4.5" fill="#f4a261"/><circle cx="45" cy="160" r="4" fill="#457b9d"/></svg>',
    purpleEgg: '<svg viewBox="0 0 160 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M80 15 C35 15, 20 95, 20 135 C20 175, 48 190, 80 190 C112 190, 140 175, 140 135 C140 95, 125 15, 80 15 Z" fill="#9d4edd"/><path d="M24 105 L50 85 L80 105 L110 85 L136 105 L139 125 L110 105 L80 125 L50 105 L21 125 Z" fill="#e0aaff"/><circle cx="80" cy="60" r="8" fill="#ff9e00"/><circle cx="55" cy="150" r="10" fill="#ff9e00"/><circle cx="105" cy="150" r="10" fill="#ff9e00"/></svg>',
    egg: '<svg viewBox="0 0 160 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M80 15 C35 15, 20 95, 20 135 C20 175, 48 190, 80 190 C112 190, 140 175, 140 135 C140 95, 125 15, 80 15 Z" fill="#b7e4c7"/><path d="M22 100 Q 80 120, 138 100 L 140 130 Q 80 150, 20 130 Z" fill="#f8f9fa"/><circle cx="80" cy="60" r="12" fill="#ffafcc"/><circle cx="80" cy="60" r="4" fill="#ffd166"/><circle cx="50" cy="160" r="10" fill="#ffafcc"/><circle cx="50" cy="160" r="3" fill="#ffd166"/><circle cx="110" cy="160" r="10" fill="#ffafcc"/><circle cx="110" cy="160" r="3" fill="#ffd166"/></svg>'
};

const SEASONS = {
    halloween: {
        glow: 'rgba(255, 123, 0, 0.7)', emoji: '🎃',
        from: [10, 20], to: [11, 2],
        items: [
            ['pumpkin', '160px', '145px', '5%', '', '-40px', '-10deg', true],
            ['pumpkin', '110px', '100px', '14%', '', '', '8deg', true],
            ['pumpkin', '180px', '165px', '', '7%', '-50px', '12deg', true]
        ]
    },
    christmas: {
        glow: 'rgba(230, 57, 70, 0.6)', emoji: '🎄',
        from: [12, 15], to: [12, 31],
        items: [
            ['candyCane', '120px', '170px', '6%', '', '-50px', '-15deg', false],
            ['christmasTree', '150px', '200px', '', '1%', '-110px', '0deg', true],
            ['candyCane', '130px', '185px', '', '12%', '-80px', '18deg', false]
        ]
    },
    easter: {
        glow: 'rgba(157, 78, 221, 0.6)', emoji: '🥚',
        from: [4, 1], to: [4, 15],
        items: [
            ['purpleEgg', '130px', '160px', '7%', '', '-40px', '-12deg', false],
            ['egg', '95px', '120px', '15%', '', '-20px', '10deg', false],
            ['purpleEgg', '140px', '175px', '', '8%', '-60px', '8deg', false]
        ]
    },
    programmer_day: {
        glow: 'rgba(0, 255, 255, 0.6)', emoji: '💻',
        dayOfYear: 256,
        items: []
    }
};

function activeSeason(date = new Date()) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / 86400000) + 1;
    for (const [name, season] of Object.entries(SEASONS)) {
        if (season.dayOfYear === dayOfYear) return { name, ...season };
        if (!season.from || !season.to) continue;
        const from = new Date(date.getFullYear(), season.from[0] - 1, season.from[1]);
        const to = new Date(date.getFullYear(), season.to[0] - 1, season.to[1], 23, 59, 59);
        if (date >= from && date <= to) return { name, ...season };
    }
    return null;
}

export function seasonal(date = new Date()) {
    const season = activeSeason(date);
    if (!season) return { background: '', glow: '', emoji: '' };

    const terminal = season.name === 'programmer_day' ? `
        <div class="terminal-rain-bg"><div class="code-stream">${[
            'niwer@erwin-main:~/Documents$ cd /home/niwer/Documents/Developpement/ProjectA/',
            'niwer@erwin-main:~/Documents/Developpement/ProjectA$ git pull origin main',
            'niwer@erwin-main:~/Documents/Developpement/ProjectA$ java --version',
            'openjdk 25.0.4.1 2026-08-18',
            'niwer@erwin-main:~/Documents/Developpement/ProjectA$ ./gradlew clean test build',
            'niwer@erwin-main:~/Documents/Developpement/ProjectA$ echo "Hello, World!"'
        ].concat([
            'niwer@erwin-main:~/Documents$ clear',
            'niwer@erwin-main:~/Documents$ git status --short'
        ]).map(line => `<div>${line}</div>`).join('')}</div></div>
    ` : '';
    const items = season.items.map(([svg, width, height, left, right, top, rotate, clickable]) => `
        <div class="seasonal-svg${clickable ? ' seasonal-clickable' : ''}" style="width:${width};height:${height};${left ? `left:${left};` : ''}${right ? `right:${right};` : ''}top:${top};transform:rotate(${rotate});">${SVGS[svg]}</div>
    `).join('');

    return {
        background: terminal + items,
        glow: season.glow,
        emoji: season.emoji
    };
}
