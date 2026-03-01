/* Environement variables */
const IS_DEV_ENV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const GITHUB_USERNAME = 'Niwer1525';
const WEBSITE_URL = IS_DEV_ENV ? './' : `https://niwer1525.github.io/${GITHUB_USERNAME}/`;

function copyDiscordId() {
    navigator.clipboard.writeText('niwerbis').then(() => createNotification('Discord ID copied to clipboard!'));
}

function copyEmail() {
    navigator.clipboard.writeText('contact@niwer.dev').then(() => createNotification('Email copied to clipboard!'));
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

/**
 * Utility function to get a CSS variable's value
 * @param {*} name - The name of the CSS variable (e.g., '--accent-color')
 * @returns {string} The value of the CSS variable, or an empty string if not found
 */
function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Utility function to get an element by ID and set its text content
 * @param {*} id - The ID of the element to find
 * @param {*} content - The text content to set on the element
 */
function getElementByIdAndSetContent(id, content) {
    const ELEMENT = document.getElementById(id);
    if(ELEMENT) ELEMENT.textContent = content;
}

/**
 * Removes extra whitespace and newlines from the HTML string to optimize it for faster rendering.
 * @param {*} html The HTML string to be trimmed and minified.
 * @returns {string} The trimmed and minified HTML string.
 */
function trimAndMinifyHTML(html) {
    return html.trim().replace(/\s+/g, ' ');
}

/**
 * Escapes special HTML characters in a string to prevent XSS vulnerabilities when inserting user-generated content into the DOM.
 * @param {*} value - The string value to be escaped for safe HTML insertion.
 * @returns {string} The escaped string, safe for HTML insertion.
 */
function escapeHtml(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}