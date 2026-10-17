import { getValueWithFallback } from '../../utils.js';

export function purchaseAlert(langDict) {
    return `
        <section id="purchase-alert">
            <div class="card purchase-alert hidden" style="border-color: var(--accent-color); background: var(--accent-glow);">
                <div class="flex-between">
                    <div>
                        <h3 class="text-accent"><i class="fa-solid fa-basket-shopping"></i> Purchase Detected</h3>
                        <p class="text-sm">We noticed you have a pending checkout session. Sign in or register to link it automatically.</p>
                    </div>
                    <button class="btn primary">Link Account</button>
                </div>
            </div>
        </section>
    `;
}