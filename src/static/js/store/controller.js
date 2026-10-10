const STRIPE_DATA_URL = 'https://raw.githubusercontent.com/Niwer1525/Niwer1525/data/stripe_catalog.json';

async function hydrateStripePrices() {
    try {
        const res = await fetch(STRIPE_DATA_URL, { cache: 'no-store' });
        if (!res.ok) return;

        const { data = [] } = await res.json();
        const priceMap = new Map(data.map(item => [item.id, item]));

        document.querySelectorAll('.store-package-card[data-price-id]').forEach(card => {
            const priceId = card.dataset.priceId;
            const stripeItem = priceMap.get(priceId);

            if (stripeItem?.unit_amount != null) {
                const amount = stripeItem.unit_amount / 100;
                const currency = (stripeItem.currency || 'EUR').toUpperCase();
                const priceEl = card.querySelector('.store-price');

                if (priceEl) {
                    priceEl.textContent = new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency
                    }).format(amount);
                }
            }
        });
    } catch (e) {
        console.warn('Could not update live Stripe prices:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateStripePrices, { once: true });
} else {
    hydrateStripePrices();
}