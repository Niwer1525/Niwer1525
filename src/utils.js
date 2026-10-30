import path from 'node:path';
import fs from 'node:fs/promises';
import { marked } from 'marked';

export const DEFAULT_LANGUAGE_COLOR = '#cccccc';
export const LANGUAGE_COLORS = {
    JSON: '#292929',
    Shell: '#89e051',
    Markdown: '#083fa1',
    SQL: '#e38c00',
    Groovy: '#e69f56',
    Java: '#b07219',
    'C#': '#178600',
    GLSL: '#5686a5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    JavaScript: '#f1e05a',
    TypeScript: '#2076bb',
    PHP: '#4F5D95',
    Python: '#3572A5',
    Rust: '#dea584'
};

/**
 * Formats a URL string into a more readable label, optionally limiting its length and/or returning only the domain.
 * 
 * @param {*} urlString The URL string to format. 
 * @param {*} param1 An object containing optional parameters:
 *   - maxLength: The maximum length of the returned label. Defaults to 45 characters.
 *   - onlyDomain: A boolean indicating whether to return only the domain part of the URL. Defaults to false.
 * @returns A formatted label for the URL, which may be truncated or limited to the domain based on the provided options.
 */
export function formatUrlLabel(urlString, { maxLength = 45, onlyDomain = false } = {}) {
    try {
        // Ensure scheme exists so new URL() parses bare domains like "statbel.fgov.be"
        const normalized = /^https?:\/\//i.test(urlString) ? urlString : `https://${urlString}`;
        const parsed = new URL(normalized);
        const domain = parsed.hostname.replace(/^www\./i, '');

        if (onlyDomain) return domain;

        const path = (parsed.pathname === '/' ? '' : parsed.pathname) + parsed.search;
        if (!path) return domain;

        const fullDisplay = `${domain}${path}`;
        if (fullDisplay.length <= maxLength) return fullDisplay;

        const remainingSpace = maxLength - domain.length - 3; // 3 chars for "…"
        if (remainingSpace > 6) return `${domain}${path.slice(0, remainingSpace)}…`;

        return domain;
    } catch {
        if (onlyDomain) {
            // Best-effort extraction without protocol
            const clean = urlString.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
            return clean.split(/[\/?#]/)[0];
        }

        return urlString.length > maxLength ? `${urlString.slice(0, maxLength - 1)}…` : urlString;
    }
}

/**
 * Loads a Markdown file from the specified folder and converts it to HTML using the marked library.
 * 
 * @param {*} folder The folder where the Markdown file is located. 
 * @param {*} fileName  The name of the Markdown file to load.
 * @returns The HTML content of the Markdown file, or an empty string if the file could not be loaded.
 */
export const loadMd = async (folderName, fileName) => {
    const folder = path.resolve(folderName);
    try {
        const text = await fs.readFile(path.join(folder, fileName), 'utf8');
        return marked.parse(text);
    } catch {
        return '';
    }
};

/**
 * Formats a project name into a default title by replacing hyphens and underscores with spaces and capitalizing the first letter of each word.
 * 
 * @param {*} projectName The name of the project to format.
 * @returns The formatted title.
 */
export function formatDefaultTitle(projectName) {
    return String(projectName || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Loads a JSON file from the specified folder.
 * 
 * @param {*} folderName The folder where the JSON file is located.
 * @param {*} fileName The name of the JSON file to load.
 * @returns The parsed JSON content, or an empty object if the file could not be loaded.
 */
export const loadJson = async (folderName, fileName) => {
    const folder = path.resolve(folderName);
    try {
        const text = await fs.readFile(path.join(folder, fileName), 'utf8');
        return JSON.parse(text);
    }
    catch {
        return {};
    }
};

/**
 * Retrieves a value from a dictionary using the specified key, returning a fallback value if the key is not found.
 * 
 * @param {*} dict The dictionary from which to retrieve the value.
 * @param {*} key The key to look up in the dictionary.
 * @param {*} fallback The value to return if the key is not found in the dictionary. Defaults to an empty string.
 * @returns The value associated with the key in the dictionary, or the fallback value if the key is not found.
 */
export const getValueWithFallback = (dict = {}, key, fallback = '') => {
    if (key in dict && dict[key] !== undefined && dict[key] !== '') return dict[key];
    return fallback;
};

/**
 * Retrieves a value from a dictionary using the specified key, returning a fallback value if the key is not found.
 * 
 * @param {*} dict The dictionary from which to retrieve the value.
 * @param {*} key The key to look up in the dictionary.
 * @param {*} fallback The value to return if the key is not found in the dictionary. Defaults to an empty string.
 * @returns The value associated with the key in the dictionary, or the fallback value if the key is not found.
 */
export const translate = (dict = {}, key, object = []) => {
    return getValueWithFallback(dict, key, key).replace(/%s/g, object || '');
};

/**
 * Returns a CSS class name based on the provided access type.
 * 
 * @param {*} type The access type (e.g., 'authenticated', 'buyer', 'admin').
 * @returns {string} The corresponding CSS class name for the access type, or an empty string if the type is unrecognized.
 */
export function getAccessClassForType(type) {
    const hiddenClass = 'hidden';
    switch (type) {
        case 'authenticated':
            return hiddenClass + ' ' + 'auth-required';
        case 'buyer':
            return hiddenClass + ' ' + 'buyer-required';
        case 'admin':
            return hiddenClass + ' ' + 'admin-required';
        default:
            return '';
    }
}

/**
 * Escapes special HTML characters in a string to prevent XSS attacks and ensure safe rendering in the browser.
 * 
 * @param {*} value - The string value to escape for safe HTML rendering.
 * @returns {string} - The escaped string, safe for HTML rendering.
 */
export function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}