const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const websiteURL = isDev ? './' : 'https://niwer1525.github.io/Niwer1525/';

function copyDiscordId() {
    navigator.clipboard.writeText('niwerbis').then(() => createNotification('Discord ID copied to clipboard!'));
}

/**
 * Creates a temporary notification at the bottom of the screen.
 * @param {string} message - The message to display in the notification.
 */
function createNotification(message) {
    let notifications = document.querySelectorAll('.notification');
    let offset = 20 + notifications.length * 60; // 20px base, 60px per notification
    let msg = document.createElement('div');
    msg.textContent = message;
    msg.className = 'notification';
    msg.style.top = 'auto';
    msg.style.bottom = `${offset}px`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}

/* Prevent CTRL+S (Saving) & CTRL+P (Printing) */
window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') e.preventDefault();
    if (e.ctrlKey && e.key === 'p') e.preventDefault();
});

const popup = () => document.getElementById("contact-popup");

function showContactPopup() { popup().style.display = "flex"; }

function hideContactPopup() { popup().style.display = "none"; }

function isContactPopupVisible() { return popup().style.display === "flex"; }

document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'contact-form') {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: json
        })
        .then(async response => {
            let json = await response.json();
            if (response.status == 200) createNotification('Message sent successfully!');
            else createNotification(json.message || 'An error occurred while sending the message.');
        })
        .catch(error => createNotification('An error occurred while sending the message.'))
        .then(() => form.reset());
    }
});