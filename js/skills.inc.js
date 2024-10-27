document.addEventListener('DOMContentLoaded', () => {
    fetch('https://niwer1525.github.io/Niwer1525/skills.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('skills').innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
});