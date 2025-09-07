document.addEventListener('DOMContentLoaded', async () => {
    await fetch(websiteURL + '/footer.html')
        .then(response => response.text())
        .then(data => document.getElementById('pagefooter').innerHTML = data)
        .catch(error => console.error('Error loading HTML:', error));
});