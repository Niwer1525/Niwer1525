document.addEventListener('DOMContentLoaded', () => {
    fetch('https://niwer1525.github.io/Niwer1525/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('pagefooter').innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
});