/* Environement variables */
const GITHUB_USERNAME = 'Niwer1525';

/* On document loaded */
document.addEventListener('DOMContentLoaded', async () => {
    console.log(`%c Niwer's Portfolio - Made with ❤️`, 'background: #000000; color: #d8b4fe; padding: 4px 8px; border-radius: 4px; font-size: 14px;');
});

/**
 * Copies the email address to the clipboard and shows a notification.
 * 
 * @author Niwer
 */
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
    if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'p')) e.preventDefault();
});

/**
 * Utility function to get a popup element by its ID.
 * 
 * @param {string} id - The ID of the popup element to find.
 * @returns {HTMLElement} The popup element.
 * @author Niwer
 */
const popup = (id) => document.getElementById(id);

/**
 * Appends an image or video element based on the project's properties.
 * 
 * @param {string} id - The ID of the project element to append the media to.
 * @author Niwer
 */
function showPopup(id) {
    console.log(id)
    popup(id).style.display = "flex"; }

/**
 * Hides the contact popup by setting its display style to "none".
 * 
 * @param {string} id - The ID of the contact popup element to hide.
 * @author Niwer
 */
function hidePopup(id) { popup(id).style.display = "none"; }

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
 * 
 * @param {*} name - The name of the CSS variable (e.g., '--accent-color')
 * @returns {string} The value of the CSS variable, or an empty string if not found
 * @author Niwer
 */
function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Utility function to get an element by ID and set its text content
 * 
 * @param {*} id - The ID of the element to find
 * @param {*} content - The text content to set on the element
 * @author Niwer
 */
function getElementByIdAndSetContent(id, content) {
    const ELEMENT = document.getElementById(id);
    if(ELEMENT) ELEMENT.textContent = content;
}

/**
 * Removes extra whitespace and newlines from the HTML string to optimize it for faster rendering.
 * 
 * @param {*} html The HTML string to be trimmed and minified.
 * @returns {string} The trimmed and minified HTML string.
 * @author Niwer
 */
function trimAndMinifyHTML(html) {
    return html.trim().replace(/\s+/g, ' ');
}

/**
 * Escapes special HTML characters in a string to prevent XSS vulnerabilities when inserting user-generated content into the DOM.
 * 
 * @param {*} value - The string value to be escaped for safe HTML insertion.
 * @returns {string} The escaped string, safe for HTML insertion.
 * @author Niwer
 */
function escapeHtml(value) {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/**
 * This will make the first letter of each word in the productId uppercase and replace underscores with spaces.
 * 
 * @param {*} productId The productId to format.
 */
function formatProductId(productId) {
    if (!productId) return 'Unknown';
    return productId
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}