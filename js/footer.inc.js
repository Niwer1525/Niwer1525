document.addEventListener('DOMContentLoaded', async () => {
    await fetch(WEBSITE_URL + '/footer.html')
        .then(response => response.text())
        .then(data => document.getElementById('info').innerHTML = data)
        .catch(error => console.error('Error loading HTML:', error));
});