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
    const shareUrl = typeof url === 'string' ? url : window.location.href;
    const shareTitle = typeof title === 'string' ? title : document.title; 
    
    const shareData = {
        title: shareTitle,
        url: shareUrl
    };

    // Fallback immediately if the browser doesn't support Web Share at all
    if (!navigator.share || !navigator.canShare || !navigator.canShare(shareData)) {
        copyToClipboardWithNotification(shareUrl, message);
        return;
    }

    try {
        await navigator.share(shareData);
    } catch (err) {
        if (err.name === 'AbortError') {
            // The user successfully cancelled/closed the modal normally. Do nothing.
            return; 
        } 
        
        if (err.name === 'InvalidStateError' || err.message.includes('usable')) {
            // BROWSER BUG CAUGHT: The browser is stuck from a previous share attempt.
            // Seamlessly fallback to copying the link so the user isn't left stranded.
            console.warn("Browser share state stuck. Falling back to clipboard.");
            copyToClipboardWithNotification(shareUrl, message);
        } else {
            // For other rare errors (like NotAllowedError if not triggered by a user click)
            console.error('Web Share API failed:', err.name, err.message);
            copyToClipboardWithNotification(shareUrl, message);
        }
    }
}
window.handleShare = handleShare;