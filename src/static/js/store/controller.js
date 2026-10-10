// src/static/js/store/controller.js
const STRIPE_DATA_URL = 'https://raw.githubusercontent.com/Niwer1525/Niwer1525/data/stripe_catalog.json';

// 1. Sync category badge counters directly from the rendered cards
function updateCategoryCounters() {
    const cards = Array.from(document.querySelectorAll('.store-package-card'));

    // Top-level categories
    document.querySelectorAll('.store-category-select').forEach(btn => {
        const catId = btn.dataset.categoryId;
        const count = cards.filter(card => {
            const path = card.dataset.categoryPath || '';
            return path === catId || path.startsWith(`${catId}/`);
        }).length;
        const badge = btn.querySelector('small');
        if (badge) badge.textContent = count;
    });

    // Subcategories
    document.querySelectorAll('.store-subcategory-button').forEach(btn => {
        const fullPath = `${btn.dataset.categoryId}/${btn.dataset.subcategoryPath}`;
        const count = cards.filter(card => {
            const path = card.dataset.categoryPath || '';
            return path === fullPath || path.startsWith(`${fullPath}/`);
        }).length;
        const badge = btn.querySelector('small');
        if (badge) badge.textContent = count;
    });
}

// 2. Filter package cards matching the selected path
function filterPackages(selectedPath) {
    const cards = document.querySelectorAll('.store-package-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const cardPath = card.dataset.categoryPath || '';
        // Matches exact or any deeper path
        const isMatch = selectedPath === 'all' || cardPath === selectedPath || cardPath.startsWith(`${selectedPath}/`);
        card.style.display = isMatch ? '' : 'none';
        if (isMatch) visibleCount++;
    });

    const emptyMsg = document.querySelector('.store-empty-card');
    if (emptyMsg) {
        emptyMsg.style.display = visibleCount === 0 ? '' : 'none';
    }
}

// 3. Update the active button style
function setActiveButton(selectedPath) {
    document.querySelectorAll('[data-action="select-category"]').forEach(btn => {
        const btnPath = btn.dataset.subcategoryPath 
            ? `${btn.dataset.categoryId}/${btn.dataset.subcategoryPath}` 
            : (btn.dataset.categoryId || 'all');
        btn.classList.toggle('is-active', btnPath === selectedPath);
    });
}

// 4. Open parent rows so the active subcategory is visible
function expandActiveAncestors(selectedPath) {
    if (!selectedPath || selectedPath === 'all') return;
    const parts = selectedPath.split('/');
    let current = parts[0];
    
    // Find and expand top-level row
    const topBtn = document.querySelector(`.store-category-select[data-category-id="${current}"]`);
    topBtn?.closest('.store-category-row')?.classList.add('is-open');

    // Expand intermediate rows
    for (let i = 1; i < parts.length; i++) {
        const subPath = parts.slice(1, i + 1).join('/');
        const subBtn = document.querySelector(`.store-subcategory-button[data-subcategory-path="${subPath}"]`);
        subBtn?.closest('.store-category-row')?.classList.add('is-open');
    }
}

// 5. Fetch dynamic Stripe prices
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

// 6. Handle click events
document.addEventListener('click', (e) => {
    // Chevron toggle
    const toggleBtn = e.target.closest('[data-action="toggle-category-dropdown"]');
    if (toggleBtn) {
        const row = toggleBtn.closest('.store-category-row');
        if (row) {
            row.classList.toggle('is-open');
            const isOpen = row.classList.contains('is-open');
            toggleBtn.setAttribute('aria-expanded', isOpen);
            const arrow = toggleBtn.querySelector('span');
            if (arrow) arrow.textContent = isOpen ? '▴' : '▾';
        }
        return;
    }

    // Category or Subcategory selection
    const selectBtn = e.target.closest('[data-action="select-category"]');
    if (selectBtn) {
        const path = selectBtn.dataset.subcategoryPath
            ? `${selectBtn.dataset.categoryId}/${selectBtn.dataset.subcategoryPath}`
            : (selectBtn.dataset.categoryId || 'all');

        // Automatically expand the clicked row if it has subcategories
        selectBtn.closest('.store-category-row')?.classList.add('is-open');

        localStorage.setItem('niwer-store-category', path);
        setActiveButton(path);
        filterPackages(path);
    }
});

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    updateCategoryCounters();
    const saved = localStorage.getItem('niwer-store-category') || 'all';
    expandActiveAncestors(saved);
    setActiveButton(saved);
    filterPackages(saved);
    hydrateStripePrices();
});