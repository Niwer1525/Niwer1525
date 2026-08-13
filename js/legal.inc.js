class TermsOfService extends HTMLElement {
    connectedCallback() {
        this.innerHTML = 
            addSubCategory("tos_use", "1. Use of the Website", `By accessing the niwer.dev domain and its associated subdomains (including but not limited to engine.niwer.dev, git.niwer.dev, modrinth.niwer.dev, wakatime.niwer.dev), you agree to use them for lawful purposes only. You are prohibited from attempting to disrupt the website’s security, bypassing authentication measures, or using automated scripts to scrape data.`)
            + addSubCategory("tos_account", "2. Account Registration", `To access specific services, including the software framework, you may be required to create an account on engine.niwer.dev. You are entirely responsible for maintaining the confidentiality of your account credentials (email and password) and for all activities that occur under your account. You agree to notify the administrator immediately of any unauthorized use of your account.`)
            + addSubCategory("tos_limitations", "3. Limitation of Liability", `This website and its portfolio are provided "as is" without any warranties. While I strive to keep the information accurate, I cannot guarantee that the site will always be error-free or uninterrupted.`)
            + addSubCategory("tos_applicable_law", "4. Applicable Law", "These terms are governed by and construed in accordance with the laws of Belgium. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts of Belgium.")
        ;
    }
}
customElements.define('terms-of-service-inc', TermsOfService);

class TermsOfSale extends HTMLElement {
    connectedCallback() {
        this.innerHTML =
            addSubCategory("sale_information", "1. Company Information", `The services, software, frameworks, and user management systems of this shop are operated under the niwer.dev domain and its subdomains.`,
                `<strong>Operator:</strong> Erwin Redoté (Niwer)`,
                `<strong>Registered Office:</strong> Located in Belgium (Registered with the Crossroads Bank for Enterprises / BCE). Address consultable via the official BCE registry or provided upon request.`,
                `<strong>Enterprise / VAT Number:</strong> BE1039107847`,
                `<strong>Contact Email:</strong> contact@niwer.dev`,
                `<strong>Third-Party Disclaimer:</strong> "Niwer's Engine" is an independent software framework and is not affiliated with, endorsed by, authorized, or commercially linked to Mojang Studios, Microsoft Corporation, or Steam. All trademarks belong to their respective owners.`
            )
            + addSubCategory("sale_scope", "2. Scope of Products, Licensing & Developer Access", `This shop offers digital products, software framework access, and developer licenses, each governed by specific terms:`,
                `<strong>Minecraft Mods & Standalone Assets:</strong> Sold as standalone digital products. Delivery is instant via download link or email after payment.`,
                `<strong>Software Framework (SaaS Subscription):</strong> Non-exclusive, non-transferable subscription granting access to operate the compiled framework on authorized servers managed via engine.niwer.dev.`,
                `<strong>Developer Access (Source Code License):</strong> An optional supplementary subscription granting limited, non-exclusive, non-transferable, and revocable access to the source code/repositories of Niwer's Engine strictly for study, customization, debugging, and integration into the Subscriber's own authorized projects.`,
                `<strong>Restrictions on Source Code:</strong> Developer Access DOES NOT constitute a transfer of ownership or sale of the source code. Subscribers are strictly prohibited from leaking, publishing, sublicensing, reselling, or distributing the source code, API, or included proprietary assets (e.g., /resources/assets, 3D models, audio, textures) to unauthorized third parties.`,
                `<strong>Contributions & Code Improvements:</strong> The Subscriber retains ownership of their independent custom scripts or modules. However, for any bug fixes, core adaptations, or contributions directly integrated or submitted to the core framework, the Subscriber grants Erwin Redoté a worldwide, perpetual, royalty-free, irrevocable license to use, adapt, commercialize, and redistribute such contributions within Niwer's Engine.`
            )
            + addSubCategory("sale_prices_payment", "3. Prices, Payment & Billing", `
                All prices are in Euros (€) and inclusive of VAT where applicable. 
                SaaS and Developer Access subscriptions are billed automatically on a recurring monthly basis through Stripe until canceled by the user. 
                We do not store or process your financial banking credentials directly.
            `)
            + addSubCategory("sale_refund", "4. Right of Withdrawal, Cancellation & Termination", `In accordance with Belgian and EU consumer protection laws (Article VI.53 of the Belgian Code of Economic Law regarding digital content):`,
                `<strong>Waiver of Withdrawal Right:</strong> By purchasing digital downloads, subscribing to the SaaS framework, or requesting Developer Access, you explicitly request immediate execution of the service and acknowledge waiving your 14-day right of withdrawal once access to downloads, control panels, or GitHub repositories has been granted. All sales are final.`,
                `<strong>Subscription Cancellation:</strong> Subscriptions can be canceled at any time via your user portal or Stripe billing manager. Cancellation takes effect at the end of the active billing period. No partial refunds are issued for unused days.`,
                `<strong>Termination of Access:</strong> Upon subscription cancellation or payment failure, technical access to private code repositories, developer APIs, and control panels will be automatically revoked. The user must cease developing with and delete local copies of uncompiled source code.`,
                `<strong>Termination for Material Breach:</strong> Any source code leak, unauthorized redistribution, or intellectual property violation will result in immediate termination of all services and access rights without refund, without prejudice to further legal remedies.`
            )
            + addSubCategory("sale_delivery", "5. Service Availability & Warranty Disclaimer", `While best efforts are made to ensure high uptime for repositories and management panels, service is provided on an "as is" and "as available" basis. Erwin Redoté shall not be held liable for temporary provider outages, downtime, or indirect damages resulting from custom code modifications made by the user.`)
            + addSubCategory("sale_applicable_law", "6. Governing Law & Jurisdiction", `These Terms of Sale are governed exclusively by Belgian law. Any dispute that cannot be resolved amicably shall be submitted to the exclusive jurisdiction of the competent courts of the judicial district of <strong>Liège, Belgium</strong>.`)
        ;
    }
}
customElements.define('terms-of-sale-inc', TermsOfSale);

class PrivacyPolicy extends HTMLElement {
    connectedCallback() {
        this.innerHTML = 
            addSubCategory("data_controller", "1. Data Controller", `The data controller for the niwer.dev domain and its subdomains is Erwin Redoté. For any privacy-related questions or to exercise your rights, you can contact me at <strong>contact@niwer.dev</strong>.`)
            + addSubCategory("data_collection", "2. Data We Collect", `We only collect personal data that is strictly necessary to run this website and process your orders:`,
                `<strong>Account Credentials:</strong> When you register an account on engine.niwer.dev, we collect and securely process your email address and an encrypted (hashed) version of your password.`,
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