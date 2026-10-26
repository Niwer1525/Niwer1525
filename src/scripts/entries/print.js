/* Save as image */
async function exportShowcaseAsImage(options = {}) {
    const section = document.querySelector('main > section');
    if (!section || typeof html2canvas === 'undefined') return;

    const outputWidth = options.width || 1080;
    const outputHeight = options.height || 1920;
    const padding = options.padding || 64;
    const captureScale = Math.min(window.devicePixelRatio || 1, options.maxCaptureScale || 2);

    const sourceCanvas = await html2canvas(section, { backgroundColor: null, useCORS: true, scale: captureScale });

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    const context = outputCanvas.getContext('2d');
    const pageBackground = getComputedStyle(document.body).backgroundColor || '#111';
    context.fillStyle = pageBackground;
    context.fillRect(0, 0, outputWidth, outputHeight);

    const availableWidth = Math.max(1, outputWidth - (padding * 2));
    const availableHeight = Math.max(1, outputHeight - (padding * 2));
    const fitRatio = Math.min(availableWidth / sourceCanvas.width, availableHeight / sourceCanvas.height);

    const drawWidth = Math.round(sourceCanvas.width * fitRatio);
    const drawHeight = Math.round(sourceCanvas.height * fitRatio);
    const drawX = Math.round((outputWidth - drawWidth) / 2);
    const drawY = Math.round((outputHeight - drawHeight) / 2);

    context.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight);

    const link = document.createElement('a');
    link.download = `niwer-showcase-${outputWidth}x${outputHeight}.png`;
    link.href = outputCanvas.toDataURL('image/png');
    link.click();
}

window.addEventListener('keydown', function(e) {
    const key = (e.key || '').toLowerCase();
    const isSaveShortcut = (e.ctrlKey || e.metaKey) && (key === 's' || key === 'p');
    if (!isSaveShortcut || e.repeat) return;

    e.preventDefault();
    exportShowcaseAsImage({ width: 1080, height: 1920, padding: 72 });
});