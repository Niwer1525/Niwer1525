/**
 * Creates a temporary notification at the bottom of the screen.
 * @param {string} message - The message to display in the notification.
 * @param {string} type - The type of notification ('info', 'success', 'error').
 */
function createNotification(message, type = 'info') {
    let notifications = document.querySelectorAll('.notification');
    let offset = 20 + notifications.length * 65; // 20px base, 65px per notification
    let msg = document.createElement('div');
    msg.textContent = message;
    msg.className = 'notification';
    msg.style.top = 'auto';
    msg.style.bottom = `${offset}px`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
}