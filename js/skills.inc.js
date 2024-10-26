document.addEventListener('DOMContentLoaded', () => {
    fetch('../skills.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('skills').innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
});