import { getValueWithFallback } from '../../utils.js';

export function purchaseAlert(langDict) {
    return `
        <section id="purchase-alert" class="alert-section hidden">
            <div>
                <h3>
                    <i class="fa-solid fa-basket-shopping"></i>
                    Purchase Detected
                </h3>
                <p>
                    We noticed you have a pending checkout session.
                    Sign in or register to link it automatically.
                </p>
                <button onclick="showPopupAndSwitchTab('auth-popup', 'register')">Link Account</button>
            </div>
        </section>
    `;
}