document.addEventListener('DOMContentLoaded', async () => {
    await fetch(WEBSITE_URL + '/footer.html')
        .then(response => response.text())
        .then(data => document.getElementById('pagefooter').innerHTML = data)
        .catch(error => console.error('Error loading HTML:', error));
});