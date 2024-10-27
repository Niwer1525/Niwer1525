document.addEventListener('DOMContentLoaded', () => {
    fetch('https://niwer1525.github.io/Niwer1525/nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementsByTagName('header')[0].innerHTML += data;
        })
        .catch(error => console.error('Error loading HTML:', error));
});