/* Disable image dragging on the entire document */
document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('img').forEach(img => {
        img.draggable = false;
        img.addEventListener('dragstart', e => e.preventDefault());
    });
});