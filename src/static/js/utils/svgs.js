export const SVGS = {
    pumpkin: `
        <svg viewBox="0 0 200 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M92 35 C90 15, 105 5, 118 12 C110 20, 108 28, 108 35 Z" fill="#2d6a4f"/>
            <ellipse cx="60" cy="105" rx="45" ry="60" fill="#e85d04"/>
            <ellipse cx="140" cy="105" rx="45" ry="60" fill="#e85d04"/>
            <ellipse cx="100" cy="105" rx="52" ry="65" fill="#f48c06"/>
            <!-- Lit eyes and mouth -->
            <polygon points="75,75 90,95 65,95" fill="#ffba08" class="pumpkin-face"/>
            <polygon points="125,75 135,95 110,95" fill="#ffba08" class="pumpkin-face"/>
            <path d="M65 115 L80 125 L92 115 L100 125 L108 115 L120 125 L135 115 L122 140 L100 132 L78 140 Z" fill="#ffba08" class="pumpkin-face"/>
        </svg>`,
    candyCane: `
        <svg viewBox="0 0 140 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="stripes" width="30" height="30" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <rect width="15" height="30" fill="#ffffff"/>
                    <rect x="15" width="15" height="30" fill="#e63946"/>
                </pattern>
            </defs>
            <path d="M40 70 A35 35 0 0 1 110 70 L110 180" fill="none" stroke="url(#stripes)" stroke-width="26" stroke-linecap="round"/>
        </svg>`,
    christmasTree: `
        <svg viewBox="0 0 160 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Tree trunk -->
            <rect x="70" y="180" width="20" height="20" fill="#8d5524"/>
            
            <!-- Snow on trunk -->
            <path d="M70,180 Q80,185 90,180 Z" fill="#ffffff" />

            <!-- Main Tree Body -->
            <polygon points="80,20 40,80 60,80 30,130 50,130 20,180 140,180 110,130 130,130 100,80 120,80" fill="#2a9d8f"/>

            <!-- Star on top -->
            <polygon points="80,5 83,12 90,12 85,16 87,23 80,19 73,23 75,16 70,12 77,12" fill="#ffd166" stroke="#f4a261" stroke-width="1"/>

            <!-- Garland with class for lighting up -->
            <path class="garland-lit" d="M 65,60 Q 80,75 95,60" fill="none" stroke="#e9c46a" stroke-width="2.5" stroke-dasharray="4,2"/>
            <path class="garland-lit" d="M 45,105 Q 80,125 115,105" fill="none" stroke="#e9c46a" stroke-width="2.5" stroke-dasharray="4,2"/>
            <path class="garland-lit" d="M 35,155 Q 80,175 125,155" fill="none" stroke="#e9c46a" stroke-width="2.5" stroke-dasharray="4,2"/>

            <!-- Ornaments / Baubles -->
            <circle cx="70" cy="50" r="4" fill="#e76f51" />
            <circle cx="95" cy="70" r="4.5" fill="#f4a261" />
            <circle cx="60" cy="95" r="4" fill="#e76f51" />
            <circle cx="90" cy="110" r="4.5" fill="#457b9d" />
            <circle cx="75" cy="145" r="4" fill="#e76f51" />
            <circle cx="105" cy="150" r="4.5" fill="#f4a261" />
            <circle cx="45" cy="160" r="4" fill="#457b9d" />
        </svg>`,
    easterEgg_purple: `
        <svg viewBox="0 0 160 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M80 15 C35 15, 20 95, 20 135 C20 175, 48 190, 80 190 C112 190, 140 175, 140 135 C140 95, 125 15, 80 15 Z" fill="#9d4edd"/>
            <path d="M24 105 L50 85 L80 105 L110 85 L136 105 L139 125 L110 105 L80 125 L50 105 L21 125 Z" fill="#e0aaff"/>
            <circle cx="80" cy="60" r="8" fill="#ff9e00"/>
            <circle cx="55" cy="150" r="10" fill="#ff9e00"/>
            <circle cx="105" cy="150" r="10" fill="#ff9e00"/>
        </svg>`,
    easterEgg: `
        <svg viewBox="0 0 160 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M80 15 C35 15, 20 95, 20 135 C20 175, 48 190, 80 190 C112 190, 140 175, 140 135 C140 95, 125 15, 80 15 Z" fill="#b7e4c7" />
            <path d="M22 100 Q 80 120, 138 100 L 140 130 Q 80 150, 20 130 Z" fill="#f8f9fa" />
            
            <!-- Flowers-->
            <circle cx="80" cy="60" r="12" fill="#ffafcc" />
            <circle cx="80" cy="60" r="4" fill="#ffd166" />
            <circle cx="50" cy="160" r="10" fill="#ffafcc" />
            <circle cx="50" cy="160" r="3" fill="#ffd166" />
            <circle cx="110" cy="160" r="10" fill="#ffafcc" />
            <circle cx="110" cy="160" r="3" fill="#ffd166" />
        </svg>
    `
};