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
let isSharing = false;
export async function handleShare(event, title, url, message) {
    if (isSharing) return; // Prevent duplicate concurrent triggers
    isSharing = true;

    if (event?.currentTarget?.blur) event.currentTarget.blur(); // On iOS Safari, releasing focus from the tapped element prevents swallowed taps

    const shareData = { title: title || document.title, url: url || window.location.href };
    try {
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
        }
    } catch (err) {
        if (err.name === 'AbortError') return; // AbortError = user dismissed/cancelled the sheet
        console.warn('Share failed, using fallback:', err);
    } finally {
        setTimeout(() => { isSharing = false; }, 400); // Add a slight delay before releasing lock so the mobile OS cleans up
    }

    copyToClipboardWithNotification(shareData.url, message); // Fallback if navigator.share wasn't available or errored out (non-Abort)
}
window.handleShare = handleShare;