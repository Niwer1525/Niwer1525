class TermsOfService extends HTMLElement {
    connectedCallback() {
        this.innerHTML = 
            addSubCategory("tos_use", "1. Use of the Website", `By accessing this website, you agree to use it for lawful purposes only. You are prohibited from attempting to disrupt the website’s security or using automated scripts to scrape data.`)
            + addSubCategory("tos_limitations", "2. Limitation of Liability", `This website and its portfolio are provided "as is" without any warranties. While I strive to keep the information accurate, I cannot guarantee that the site will always be error-free or uninterrupted.`)
            + addSubCategory("tos_applicable_law", "3. Applicable Law", "These terms are governed by and construed in accordance with the laws of Belgium. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts of Belgium.")
        ;
    }
}
customElements.define('terms-of-service-inc', TermsOfService);

class TermsOfSale extends HTMLElement {
    connectedCallback() {
        this.innerHTML =
            addSubCategory("sale_information", "1. Company information", ``,
                `<strong>Operator:</strong> Erwin Redoté (Niwer)`,
                `<strong>Registered Office:</strong> Located in Belgium (Registered with the Crossroads Bank for Enterprises / BCE). Full physical address is available upon immediate request via the contact form or consultable via the official BCE registry.`,
                `<strong>Enterprise Number:</strong> Soon`,
                `<strong>VAT Number:</strong> Soon `,
                `<strong>Contact Email:</strong> contact@niwer.dev`
            )
            + addSubCategory("sale_scope", "2. Scope of Products and Services", `This shop offers different categories of products and services, each subject to specific delivery and licensing terms:`,
                `<strong>Minecraft Mods:</strong> Sold as standalone digital products. Delivery is completed instantly via a download link or email after successful payment.`,
                `<strong>Steam Games:</strong> These products are displayed on this website for informational and promotional purposes only. The actual purchase and delivery are handled exclusively by the third-party platform <strong>Steam</strong>. I am not responsible for transactions made on Steam.`,
                `<strong>Software Framework (Subscription):</strong> Access to the framework is provided via a recurring monthly subscription license. Upon successful payment through Stripe, the user is redirected to an external control panel hosted on my dedicated server to manage their access.`,
                `<strong>Freelance Services:</strong> Development and custom services are not sold directly on this shop. Clients must initiate contact via email or the contact form. Every project is subject to a separate, legally binding freelance contract detailing the specific quote, deadlines, and deliverables.`
            )
            + addSubCategory("sale_prices_payment", "3. Prices and Payment", `
                All prices displayed on the shop are in Euros (€) and are VAT inclusive. 
                Subscriptions are automatically billed every month until canceled by the user. 
                Payments are securely processed through Stripe. We do not store or have access to your financial information.
            `)
            + addSubCategory("sale_refund", "4. Right of Withdrawal & Refund Policy", `In accordance with Belgian and EU consumer protection laws, the rules for digital content and services apply as follows:`,
                `<strong>Digital Downloads & Licenses:</strong> By purchasing a Minecraft mod or subscribing to the framework, you explicitly request immediate access to the digital content and acknowledge that <strong>you waive your 14-day right of withdrawal</strong> once the download link is provided or access to the server panel is granted. All digital sales are final and non-refundable.`,
                `<strong>Subscriptions:</strong> You can cancel your framework subscription at any time via the user panel. The cancellation will take effect at the end of the current billing cycle. No partial refunds are issued for unused days.`,
                `<strong>Freelance Services:</strong> Cancellation and refund terms for custom projects are strictly governed by the individual contract signed between the parties before the project begins.`
            )
            + addSubCategory("sale_delivery", "5. Delivery and Server Availability", `While I strive to maintain 100% uptime for the dedicated server hosting the framework panel, I cannot be held liable for temporary service interruptions due to maintenance, network failures, or hosting provider issues.`)
            + addSubCategory("sale_applicable_law", "6. Governing Law and Disputes", `These Terms of Sale are governed by the laws of Belgium. In the event of any issue or complaint, please contact me directly at <strong>contact@niwer.dev</strong> so we can seek an amicable solution. If no resolution can be reached, any legal dispute shall be subject to the exclusive jurisdiction of the courts of Belgium.`)
        ;
    }
}
customElements.define('terms-of-sale-inc', TermsOfSale);

class PrivacyPolicy extends HTMLElement {
    connectedCallback() {
        this.innerHTML = 
            addSubCategory("data_controller", "1. Data Controller", `The data controller for this website is Erwin Redoté. For any privacy-related questions or to exercise your rights, you can contact me at <strong>contact@niwer.dev</strong>.`)
            + addSubCategory("data_collection", "2. Data We Collect", `We only collect personal data that is strictly necessary to run this website and process your orders:`,
                `<strong>Contact and Order Data:</strong> Name, email address, and billing address when you make a purchase.`,
                `<strong>Technical Data:</strong> IP address and essential cookies required for basic website functionality and analytics.`
            )
            + addSubCategory("data_sharing", "3. Purpose and Sharing", `
                Your data is used solely to deliver your purchases, process payments, and respond to your messages.
                Your personal information is <strong>never</strong> sold, rented, or shared with third parties for marketing purposes.
            `)
            + addSubCategory("data_rights", "4. Your Rights (GDPR)", `
                Under the GDPR, you have the right to access, rectify, or request the deletion of the personal data we hold (such as your emails).
                Please note that data stored by third-party payment processors or information required to be kept by Belgian law for legal or accounting purposes cannot be deleted immediately.
                To exercise your rights, contact me at <strong>contact@niwer.dev</strong>.
            `)
        ;
    }
}
customElements.define('privacy-policy-inc', PrivacyPolicy);

/**
 * This function generates the HTML code for a sub-category in order to be used in different notices and policies
 * @param {*} i18nId The identifier. Will be used to get the language key.
 * @param {*} title The title of the sub-category
 * @param {*} content The content (Can contain HTML) of the sub-category (Generally the legal information for this category and sub-category).
 * @param {*} elements Elements you want to be listed (Using <ul> tag)
 * @returns The HTML code to be added into an innerHTML
 */
function addSubCategory(i18nId, title, content, ...elements) {
    /* Create the default HTML content */
    let html = `
        <h3 data-i18n="legal.title.${i18nId}">$${title}</h3>
        <p data-i18n="legal.content.${i18nId}">${content}</p>
    `;

    /* Add all list elements */
    if(elements && elements.length > 0) {
        let counter = 1;
        html += `<ul>`
        for(e of elements) {
            html += `<li data-i18n="legal.list.${i18nId}.${counter}">${e}</li>`
            counter++;
        }
        html += `</ul>`
    }

    return html;
}