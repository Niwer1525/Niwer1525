export function productModal() {
    return `
        <div id="product-detail-popup" class="store-image-popup" hidden>
            <div class="store-image-popup-backdrop" data-action="close-detail-popup" aria-hidden="true"></div>
            <div class="store-image-popup-panel store-modal-content" role="dialog" aria-modal="true" aria-label="Product details">
                <button type="button" class="icon-button store-image-popup-close" data-action="close-detail-popup" aria-label="Close modal">&times;</button>
                <div class="store-modal-body">
                    <div class="store-modal-media">
                        <img id="product-modal-img" src="" alt="" draggable="false">
                    </div>
                    <div class="store-modal-info">
                        <header>
                            <h2 id="product-modal-title"></h2>
                            <div id="product-modal-price" class="store-price"></div>
                        </header>
                        <div id="product-modal-desc" class="store-package-description"></div>
                        <footer>
                            <a id="product-modal-buy" class="link-button" href="" target="_blank" rel="noopener noreferrer">Buy</a>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    `;
}