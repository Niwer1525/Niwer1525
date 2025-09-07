const isDev = window.location.hostname === 'localhost';
const websiteURL = isDev ? './' : 'https://niwer1525.github.io/Niwer1525/';

function copyDiscordId() {
    navigator.clipboard.writeText('niwerbis').then(() => {
        let notifications = document.querySelectorAll('.notification');
        let offset = 20 + notifications.length * 60; // 20px base, 60px per notification
        let msg = document.createElement('div');
        msg.textContent = 'Discord ID copied to clipboard!';
        msg.className = 'notification';
        msg.style.top = 'auto';
        msg.style.bottom = `${offset}px`;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
    });
}