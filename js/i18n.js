// Load the saved or default language on page load.
window.addEventListener('DOMContentLoaded', async (event) => {
    const LANG = localStorage.getItem('language') || 'en';
    const LANG_DATA = await fetchLanguageData(LANG);
    await updateContent(LANG_DATA);
});

/**
 * Update the content of the page with the provided language data.
 * @param {*} langData The language data to update the page with.
 */
async function updateContent(langData) {
    // document.querySelectorAll('[data-i18n]').forEach(element => {
    //     const key = element.getAttribute('data-i18n');
    //     element.innerHTML = langData[key];
    // });

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        element.innerHTML = langData[element.dataset.i18n];
    });
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

/**
 * Change the language of the page.
 * @param {*} lang The language to change to.
 */
async function changeLanguage(lang) {
    await setLanguagePreference(lang);
    
    const langData = await fetchLanguageData(lang);
    await updateContent(langData);
}