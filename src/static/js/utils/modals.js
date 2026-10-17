/**
 * Utility function to get a popup element by its ID.
 * 
 * @param {string} id - The ID of the popup element to find.
 * @returns {HTMLElement} The popup element.
 * @author Niwer
 */
const popup = (id) => document.getElementById(id);

/**
 * Appends an image or video element based on the project's properties.
 * 
 * @param {string} id - The ID of the project element to append the media to.
 * @author Niwer
 */
function showPopup(id) { popup(id).style.display = "flex"; }

/**
 * Hides the contact popup by setting its display style to "none".
 * 
 * @param {string} id - The ID of the contact popup element to hide.
 * @author Niwer
 */
function hidePopup(id) { popup(id).style.display = "none"; }
