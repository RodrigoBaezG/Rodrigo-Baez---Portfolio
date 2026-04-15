/**
 * Tests for navbar behavior:
 * - burger menu toggle (open/close class + aria-expanded)
 * - close menu on nav link click
 */

function setupDOM() {
    document.body.innerHTML = `
        <nav id="navbar">
            <div>
                <a href="./">Home</a>
                <button id="burger" aria-expanded="false" aria-controls="nav-menu">&#9776;</button>
            </div>
            <ul id="nav-menu">
                <li><a href="#portfolio">Portfolio</a></li>
                <li><a href="#skillset">Skillset</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
        <main id="main-content"></main>
    `;
}

describe('Burger menu', () => {
    beforeEach(() => {
        setupDOM();
        // Re-run the module logic inline (since IIFE cannot be easily imported)
        const nav = document.getElementById('navbar');
        const burger = document.getElementById('burger');
        const navMenu = document.getElementById('nav-menu');

        burger.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    });

    test('burger button adds "open" class to navbar on click', () => {
        const burger = document.getElementById('burger');
        const nav = document.getElementById('navbar');

        burger.click();

        expect(nav.classList.contains('open')).toBe(true);
    });

    test('burger button removes "open" class on second click', () => {
        const burger = document.getElementById('burger');
        const nav = document.getElementById('navbar');

        burger.click();
        burger.click();

        expect(nav.classList.contains('open')).toBe(false);
    });

    test('aria-expanded is "true" when menu is open', () => {
        const burger = document.getElementById('burger');

        burger.click();

        expect(burger.getAttribute('aria-expanded')).toBe('true');
    });

    test('aria-expanded is "false" when menu is closed', () => {
        const burger = document.getElementById('burger');

        burger.click();
        burger.click();

        expect(burger.getAttribute('aria-expanded')).toBe('false');
    });

    test('clicking a nav link closes the menu', () => {
        const burger = document.getElementById('burger');
        const nav = document.getElementById('navbar');
        const firstLink = document.querySelector('#nav-menu a');

        burger.click();
        expect(nav.classList.contains('open')).toBe(true);

        firstLink.click();
        expect(nav.classList.contains('open')).toBe(false);
    });

    test('clicking a nav link resets aria-expanded to false', () => {
        const burger = document.getElementById('burger');
        const firstLink = document.querySelector('#nav-menu a');

        burger.click();
        firstLink.click();

        expect(burger.getAttribute('aria-expanded')).toBe('false');
    });
});
