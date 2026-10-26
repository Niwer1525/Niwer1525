function initCarousels() {
    document.addEventListener('click', event => {
        const button = event.target.closest('[data-carousel-prev], [data-carousel-next], [data-carousel-dot]');
        if (!button) return;

        const carousel = button.closest('.image-carousel');
        const track = carousel?.querySelector('.carousel-track');
        if (!track) return;

        const slideWidth = track.clientWidth;
        if (button.hasAttribute('data-carousel-prev')) track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        else if (button.hasAttribute('data-carousel-next')) track.scrollBy({ left: slideWidth, behavior: 'smooth' });
        else track.scrollTo({ left: Number(button.dataset.carouselDot) * slideWidth, behavior: 'smooth' });
    });

    document.addEventListener('scroll', event => {
        const track = event.target;
        if (!track?.classList?.contains('carousel-track')) return;

        const carousel = track.closest('.image-carousel');
        const dots = carousel?.querySelectorAll('.carousel-dot');
        if (!dots?.length) return;

        const activeIndex = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
    }, { capture: true, passive: true });
}

document.addEventListener('click', event => {
    const seasonal = event.target.closest('.seasonal-clickable');
    if (seasonal) seasonal.classList.toggle('is-lit');
});

initCarousels();
