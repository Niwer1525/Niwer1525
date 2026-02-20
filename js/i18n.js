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
    // location.reload(); // Should not be necessary anymore with dynamic content update
}

/**
 * Fetch the language data for the specified language.
 * @param {*} lang The language to fetch the data for.
 */
async function fetchLanguageData(lang) {
    try {
        const response = await fetch(`${WEBSITE_URL}/langs/${lang}.json`);
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

window.applyLanguage = applyLanguage;