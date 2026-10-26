import { handleFormSubmit } from '../main.js';
import { hidePopup } from './modals.js';
import { createNotification } from './toast.js';

document.addEventListener('submit', event => {
    if (event.target?.id !== 'contact-popup-form') return;

    handleFormSubmit(event, async (form, formData) => {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'An error occurred while sending the message.');

        createNotification('Message sent successfully!');
        hidePopup('contact-popup');
        form.reset();
    });
});
