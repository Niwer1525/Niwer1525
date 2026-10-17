/* Prevent CTRL+S (Saving) & CTRL+P (Printing) */
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'p')) e.preventDefault();
});

document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'contact-popup-form') {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: json
        })
        .then(async response => {
            let json = await response.json();
            if (response.status == 200) createNotification('Message sent successfully!');
            else createNotification(json.message || 'An error occurred while sending the message.');
            closeModal('contact-popup');
        })
        .catch(error => createNotification('An error occurred while sending the message.'))
        .then(() => form.reset());
    }
});

/* On document loaded */
document.addEventListener('DOMContentLoaded', async () => {
    console.log(`%c Niwer's Portfolio - Made with ❤️`, 'background: #000000; color: #d8b4fe; padding: 4px 8px; border-radius: 4px; font-size: 14px;');

    /* Handle specific loading action depending on the current path */
    const currentPath = window.location.pathname;
    switch (currentPath) {
        case '/panel':
            await loadPublicServers();
            break;
        case '/panel/downloads':
            await loadDownloads();
            break;
        case '/panel/licenses':
            // await loadLicenses();
            break;
        case '/panel/admin':
            // await loadAdminPanel();
            break;
        default: break;
    }

});