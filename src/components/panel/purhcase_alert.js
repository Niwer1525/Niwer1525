import { getValueWithFallback } from '../../utils.js';

export function purchaseAlert(langDict) {
    return `
        <section id="purchase-alert hidden" class="alert-section">
            <div>
                <h3>
                    <i class="fa-solid fa-basket-shopping"></i>
                    Purchase Detected
                </h3>
                <p>
                    We noticed you have a pending checkout session.
                    Sign in or register to link it automatically.
                </p>
                <button onclick="showPopup('auth-popup')">Link Account</button>
            </div>
        </section>
    `;
}