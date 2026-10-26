import { onDomReady } from "../main";

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

document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'contact-popup-form') {
        handleFormSubmit(e, async (form, formData) => {
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json' 
                },
                body: json
            });

            const data = await response.json();

            if (response.ok) {
                createNotification('Message sent successfully!');
                hidePopup('contact-popup');
                form.reset();
            } else throw new Error(data.message || 'An error occurred while sending the message.');
        });
    }
});

console.log(`%c Niwer's Portfolio - Made with ❤️`, 'background: #000000; color: #d8b4fe; padding: 4px 8px; border-radius: 4px; font-size: 14px;');
initCarousels();

/* Handle magnet back-to-top button */
onDomReady(() => {
    const container = document.querySelector('.back-to-top-container');
    const magnetLink = container ? container.querySelector('.back-to-top') : null;
    if (!container || !magnetLink) return;

    const MAGNET_RADIUS = 90; // radius of attraction in pixels
    const MAGNET_STRENGTH = 0.25; // Strength of the movement (0.1 = light, 0.4 = reactive)

    /* Handle scroll events to show/hide the back-to-top button */
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY || window.pageYOffset
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        
        if (scrollY + windowHeight >= documentHeight - 100) container.classList.remove('hidden');
        else container.classList.add('hidden');
    });

    /* Handle mouse movement for the magnet effect */
    window.addEventListener('mousemove', (e) => {
        const rect = magnetLink.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < MAGNET_RADIUS) {
            container.classList.add('is-attracted');

            const moveX = deltaX * MAGNET_STRENGTH;
            const moveY = deltaY * MAGNET_STRENGTH;
            magnetLink.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        } else {
            container.classList.remove('is-attracted');
            magnetLink.style.transform = 'translate3d(0, 0, 0)';
        }
    });

    /* Handle mouse leaving the window */
    window.addEventListener('mouseleave', () => {
        container.classList.remove('is-attracted');
        magnetLink.style.transform = 'translate3d(0, 0, 0)';
    });
});