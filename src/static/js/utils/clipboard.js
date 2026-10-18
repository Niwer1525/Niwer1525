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