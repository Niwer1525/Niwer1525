/**
 * Copies the email address to the clipboard and shows a notification.
 * 
 * @author Niwer
 */
function copyEmail() {
    copyToClipboard('contact@niwer.dev').then(() => createNotification('Email copied to clipboard!'));
}

/**
 * Copies the provided text to the clipboard and shows a toast notification indicating success or failure.
 * 
 * @param {*} text - The text to copy to the clipboard.
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {}
}