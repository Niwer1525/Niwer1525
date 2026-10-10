/* Client script */
const STRIPE_DATA_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_USERNAME}/data/stripe_catalog.json`;

function initCarousels() {
    // Delegated click handler: Prevents full page jumps
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-carousel-prev], [data-carousel-next], [data-carousel-dot]');
        if (!btn) return;

        const carousel = btn.closest('.store-image-carousel');
        const track = carousel?.querySelector('.store-carousel-track');
        if (!track) return;

        const slideWidth = track.clientWidth;

        if (btn.hasAttribute('data-carousel-prev')) {
            track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        } else if (btn.hasAttribute('data-carousel-next')) {
            track.scrollBy({ left: slideWidth, behavior: 'smooth' });
        } else if (btn.hasAttribute('data-carousel-dot')) {
            const index = Number(btn.getAttribute('data-carousel-dot'));
            track.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
        }
    });

    // Sync the active purple pill indicator when scrolling or swiping
    document.addEventListener('scroll', (e) => {
        const track = e.target;
        if (!track?.classList?.contains('store-carousel-track')) return;

        const carousel = track.closest('.store-image-carousel');
        const dots = carousel?.querySelectorAll('.store-carousel-dot');
        if (!dots?.length) return;

        const activeIndex = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((dot, idx) => {
            dot.classList.toggle('is-active', idx === activeIndex);
        });
    }, { capture: true, passive: true });
}

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
    document.addEventListener('DOMContentLoaded', initCarousels, { once: true });
    document.addEventListener('DOMContentLoaded', hydrateStripePrices, { once: true });
} else {
    hydrateStripePrices();
    initCarousels();
}
