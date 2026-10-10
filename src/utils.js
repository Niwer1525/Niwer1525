import path from 'node:path';
import fs from 'node:fs/promises';
import { marked } from 'marked';

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