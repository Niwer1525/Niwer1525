export const STATE_STORAGE_KEY = 'niwer.dev-dashboard-state';

/**
 * Loads the application state from localStorage, merging it with the provided default state.
 * 
 * @param {*} defaultState - The default state object to merge with the loaded state. 
 * @returns {*} - The merged state object containing the loaded state and default values.
 */
export function loadState(defaultState) {
    try {
        const saved = localStorage.getItem(STATE_STORAGE_KEY);
        return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
    } catch {
        return { ...defaultState };
    }
}

/**
 * Saves the provided state object to localStorage under the key defined by STORAGE_KEY.
 * 
 * @param {*} data - The state object to be saved in localStorage. 
 */
export function saveState(data) {
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Clears the application state from localStorage by removing the item associated with STORAGE_KEY.
 */
export function clearState() {
    localStorage.removeItem(STATE_STORAGE_KEY);
}

/**
 * Safe helper to load values from localStorage
 * 
 * @param {*} key - The key to retrieve from localStorage 
 * @param {*} fallback - The fallback value to return if the key is not found or is invalid
 * @returns {*} - The value retrieved from localStorage or the fallback value
 */
export function loadFromStorage(key, fallback = null) {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === 'undefined' || item === 'null') return fallback;
        return typeof fallback === 'object' ? JSON.parse(item) : item;
    } catch {
        return fallback;
    }
}

/**
 * Safe helper to save values to localStorage
 * 
 * @param {*} key - The key to store in localStorage
 * @param {*} val - The value to store in localStorage. If null or undefined, the key will be removed.
 */
export function saveToStorage(key, val) {
    try {
        if (val === null || val === undefined || val === '') localStorage.removeItem(key);
        else localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
    } catch (e) {
        console.warn(`Failed to save ${key} to storage`, e);
    }
}