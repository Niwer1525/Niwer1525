document.addEventListener('DOMContentLoaded', async () => {
    await fetch(WEBSITE_URL + '/contact.html')
        .then(response => response.text())
        .then(data => document.getElementsByTagName('main')[0].innerHTML += data)
        .catch(error => console.error('Error loading HTML:', error));
});