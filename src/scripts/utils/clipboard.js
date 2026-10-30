import { createNotification } from './toast.js';

/**
 * Copies the email address to the clipboard and shows a notification.
 * 
 * @author Niwer
 */
export function copyEmail() {
    copyToClipboardWithNotification('contact@niwer.dev', 'Email copied to clipboard!');
}
window.copyEmail = copyEmail;

/**
 * Copies the provided text to the clipboard and shows a notification with the provided message.
 * 
 * @param {*} text - The text to copy to the clipboard. 
 * @param {*} notificationMessage - The message to display in the notification after copying.
 */
export function copyToClipboardWithNotification(text, notificationMessage) {
    copyToClipboard(text).then(() => createNotification(notificationMessage));
}
window.copyToClipboardWithNotification = copyToClipboardWithNotification;

/**
 * Copies the provided text to the clipboard and shows a toast notification indicating success or failure.
 * 
 * @param {*} text - The text to copy to the clipboard.
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {}
}
window.copyToClipboard = copyToClipboard;

/**
 * Handles sharing the provided title and URL using the Web Share API if available, or falls back to copying the URL to the clipboard with a notification.
 * 
 * @param {*} title - The title to share. If not provided, defaults to the document's title. 
 * @param {*} url  - The URL to share. If not provided, defaults to the current window's URL.
 * @param {*} message - The message to display in the notification if the Web Share API is not available and the URL is copied to the clipboard.
 */
export async function handleShare(title, url, message) {
    // Web Share API requires HTTPS and navigator.canShare check if supported
    if (navigator.share) {
        try {
            await navigator.share({
                title: title || document.title,
                url: url || window.location.href
            });
            return;
        } catch (err) {
            if (err.name === 'AbortError') return; // AbortError indicates user dismissed the share modal; ignore it
        }
    }

    copyToClipboardWithNotification(url || window.location.href, message); // Fallback
}
window.handleShare = handleShare;