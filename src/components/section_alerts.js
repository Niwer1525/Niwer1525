import { translate } from '../utils.js';

export function sectionAlert(iconClass, title, message, actionButton = '') {
    return `
        <div class="alert-section">
            <div class="alert-content">
                <div class="alert-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="alert-text">
                    <h3>${title}</h3>
                    <span class="text-secondary">${message}</span>
                </div>
            </div>
            ${actionButton}
        </div>
    `;
}

export function purchaseAlert(langDict) {
    const actionButon = `
        <a href="/panel" class="button" onclick="showPopupAndSwitchTab('auth-popup', 'login')">
            Sign In <i class="fa-solid fa-arrow-right"></i>
        </a>
    `;
    return `
        <section id="purchase-alert" class="hidden">
            ${sectionAlert(
                'fa-solid fa-basket-shopping',
                translate(langDict, 'store.purchase_detected'),
                translate(langDict, 'store.pending_checkout'),
                actionButon
            )}
        </section>
    `;
}