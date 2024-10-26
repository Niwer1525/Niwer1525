document.addEventListener('DOMContentLoaded', () => {
    fetch('../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('pagefooter').innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
});