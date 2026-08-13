let currentLang = null;
let currentLangData = null;

// Load the saved or default language on page load.
window.addEventListener('DOMContentLoaded', async () => {
    await applyLanguage();
});

/**
 * Update the content of the page with the provided language data.
 * @param {*} langData The language data to update the page with.
 */
async function updateContent(langData, root = document) {
    if (!langData) return;
    const elements = root.querySelectorAll('[data-i18n]');
    elements.forEach(element => element.innerHTML = langData[element.dataset.i18n]);
}

/**
 * Change the language preference of the user.
 * @param {*} lang The language to change to.
 */
async function setLanguagePreference(lang) {
    localStorage.setItem('language', lang);
}

/**
 * Fetch the language data for the specified language.
 * @param {*} lang The language to fetch the data for.
 */
async function fetchLanguageData(lang) {
    try {
        const response = await fetch(new URL(`langs/${lang}/global.json`, WEBSITE_URL));
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching language data:', error);
    }
}

async function applyLanguage(root = document) {
    const lang = localStorage.getItem('language') || 'en';

    if (currentLang !== lang || !currentLangData) {
        currentLangData = await fetchLanguageData(lang);
        currentLang = lang;
    }

    await updateContent(currentLangData, root);
    getElementByIdAndSetContent('current_age', calculateCurrentAge()); // Update the age after language is applied, in case it was changed by i18n
}

/**
 * Change the language of the page.
 * @param {*} lang The language to change to.
 */
async function changeLanguage(lang) {
    await setLanguagePreference(lang);
    currentLang = null; // force refresh cache when language changes
    await applyLanguage();
}

/**
 * Fetch and load a legal document in the current language.
 * 
 * @param {*} docName The name of the legal document to load (e.g., 'privacy_policy', 'terms_of_service').
 * @returns {Promise<string>} The HTML content of the legal document.
 */
async function loadLegalDoc(docName) {
    const lang = localStorage.getItem('language') || 'en';

    try {
        const response = await fetch(new URL(`langs/${lang}/${docName}.md`, WEBSITE_URL));
        if (!response.ok) return `Error loading document: ${response.status} ${response.statusText}`;

        const markdownText = await response.text();
        return marked.parse(markdownText);
    } catch (error) {
        console.error('Error loading legal document:', error);
        return `Error loading document: ${error.message}`;
    }
}

window.applyLanguage = applyLanguage;