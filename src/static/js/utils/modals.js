/**
 * Utility function to get a popup element by its ID.
 * 
 * @param {string} id - The ID of the popup element to find.
 * @returns {HTMLElement} The popup element.
 * @author Niwer
 */
const getModal = (id) => document.getElementById(id);

/**
 * Appends an image or video element based on the project's properties.
 * 
 * @param {string} id - The ID of the project element to append the media to.
 * @author Niwer
 */
export function showPopup(id) { getModal(id).style.display = "flex"; }
window.showPopup = showPopup;

export function switchTab(modalId, tabId) {
    if (!modalId || !tabId) return;

    /* Try to get the modal by it's ID */
    const popupElement = getModal(modalId);
    if(!(popupElement instanceof HTMLElement)) return;

    popupElement.querySelectorAll('.modal-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tabId));
    popupElement.querySelectorAll('.modal-panel').forEach((p) => p.classList.remove('active'));

    popupElement.querySelectorAll('form').forEach((f) => f.classList.add('hidden'));
    popupElement.querySelector(`#${modalId}-${tabId}-form`)?.classList.remove('hidden');
}
window.switchTab = switchTab;

/**
 * Shows a popup and switches to a specific tab within that popup.
 */
export function showPopupAndSwitchTab(id, tabId) {
    showPopup(id);
    switchTab(id, tabId);
}
window.showPopupAndSwitchTab = window.showPopupAndSwitchTab = showPopupAndSwitchTab;;

/**
 * Hides the contact popup by setting its display style to "none".
 * 
 * @param {string} id - The ID of the contact popup element to hide.
 * @author Niwer
 */
export function hidePopup(id) { getModal(id).style.display = "none"; }
window.hidePopup = hidePopup;

export function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
        if (modal instanceof HTMLElement) modal.style.display = 'none';
    });
}