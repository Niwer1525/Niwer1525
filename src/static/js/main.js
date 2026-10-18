/* Environement variables */
export const GITHUB_USERNAME = 'Niwer1525';

/**
 * Formats a value for display in the UI.
 * If the value is null or empty, it returns a dash.
 * If the value is an object, it returns its JSON string representation.
 * Otherwise, it converts the value to a string.
 * 
 * @param {*} v - The value to format.
 * @returns {string} - The formatted value.
 */
export function formatVal(v) {
    if (v == null || v === '') return '—';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

/**
 * Formats a date value for display in the UI.
 * 
 * @param {*} v - The date value to format. 
 * @returns {string} - The formatted date string or a dash if the value is invalid.
 */
export function formatDate(v) {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleString();
}

/**
 * Utility function to get a CSS variable's value
 * 
 * @param {*} name - The name of the CSS variable (e.g., '--accent-color')
 * @returns {string} The value of the CSS variable, or an empty string if not found
 * @author Niwer
 */
export function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Utility function to get an element by ID and set its text content
 * 
 * @param {*} id - The ID of the element to find
 * @param {*} content - The text content to set on the element
 * @author Niwer
 */
export function getElementByIdAndSetContent(id, content) {
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
export function trimAndMinifyHTML(html) {
    return html.trim().replace(/\s+/g, ' ');
}

/**
 * Escapes special HTML characters in a string to prevent XSS vulnerabilities when inserting user-generated content into the DOM.
 * 
 * @param {*} value - The string value to be escaped for safe HTML insertion.
 * @returns {string} The escaped string, safe for HTML insertion.
 * @author Niwer
 */
export function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

/**
 * This will make the first letter of each word in the productId uppercase and replace underscores with spaces.
 * 
 * @param {*} productId The productId to format.
 */
export function formatProductId(productId) {
    if (!productId) return 'Unknown';
    return productId
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}