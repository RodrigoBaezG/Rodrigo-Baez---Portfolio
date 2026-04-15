(function () {
    'use strict';

    /* ── Burger menu ── */
    const nav = document.getElementById('navbar');
    const burger = document.getElementById('burger');
    const navMenu = document.getElementById('nav-menu');

    burger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(isOpen));
        burger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Open navigation menu');
        });
    });

    /* ── Portfolio cards: open URL from data-url attribute ── */
    document.querySelectorAll('.portfolio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
    });

    /* ── Contact form: Netlify submission with inline feedback ── */
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(form);

            try {
                await fetch('/', { method: 'POST', body: data });
                form.reset();
                successMsg.removeAttribute('hidden');
                setTimeout(() => successMsg.setAttribute('hidden', ''), 6000);
            } catch {
                // Fallback: let the browser handle the native submission
                form.submit();
            }
        });
    }

    /* ── Scroll-triggered animations (IntersectionObserver) ── */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

})();
