document.addEventListener('DOMContentLoaded', async () => {
    await fetch(websiteURL + '/contact.html')
        .then(response => response.text())
        .then(data => document.getElementsByTagName('main')[0].innerHTML += data)
        .catch(error => console.error('Error loading HTML:', error));
});