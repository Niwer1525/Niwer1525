document.addEventListener('DOMContentLoaded', () => {
    fetch('https://niwer1525.github.io/Niwer1525/contact.html')
        .then(response => response.text())
        .then(data => {
            document.getElementsByTagName('main')[0].innerHTML += data;
        })
        .catch(error => console.error('Error loading HTML:', error));
});