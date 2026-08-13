class CopyrightNotice extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = await loadLegalDoc('copyright_notice');
    }
}
customElements.define('copyright-notice-inc', CopyrightNotice);

class TermsOfService extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = await loadLegalDoc('terms_of_service');
    }
}
customElements.define('terms-of-service-inc', TermsOfService);

class TermsOfSale extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = await loadLegalDoc('terms_of_sale');
    }
}
customElements.define('terms-of-sale-inc', TermsOfSale);

class PrivacyPolicy extends HTMLElement {
    async connectedCallback() {
        this.innerHTML = await loadLegalDoc('privacy_policy');
    }
}
customElements.define('privacy-policy-inc', PrivacyPolicy);