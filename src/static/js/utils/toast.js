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
