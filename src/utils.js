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