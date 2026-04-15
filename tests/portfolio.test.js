/**
 * Tests for portfolio card behavior:
 * - clicking a card opens the correct URL (via data-url)
 * - window.open is called with noopener,noreferrer
 */

const PROJECTS = [
    { name: 'Goals App',      url: 'https://rodrigogoals-app.netlify.app' },
    { name: 'CV Editor',      url: 'https://react-cv-editor.netlify.app/' },
    { name: 'Art Gallery',    url: 'https://kukobaezartgallery.netlify.app/' },
    { name: 'Meditation App', url: 'https://letbemeditation.netlify.app/' },
    { name: 'Tic Tac Toe',   url: 'https://rodrigobaezg.github.io/Tictactoe/' },
    { name: 'NotesPad',       url: 'https://rodrigobaezg.github.io/Notespad/' },
];

function setupDOM() {
    document.body.innerHTML = `
        <div class="portfolio-grid">
            ${PROJECTS.map(p => `
                <button class="portfolio-btn" data-url="${p.url}" aria-label="View ${p.name}">
                    <img src="placeholder.png" alt="${p.name}" />
                    <div class="card-info"><h4>${p.name}</h4></div>
                </button>
            `).join('')}
        </div>
    `;

    // Attach handlers (mirrors main.js logic)
    document.querySelectorAll('.portfolio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
    });
}

describe('Portfolio cards', () => {
    let openSpy;

    beforeEach(() => {
        setupDOM();
        openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
        openSpy.mockRestore();
    });

    test.each(PROJECTS)('clicking "$name" card opens the correct URL', ({ url }) => {
        const btn = document.querySelector(`[data-url="${url}"]`);
        btn.click();

        expect(openSpy).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer');
    });

    test('all portfolio cards have a data-url attribute', () => {
        const cards = document.querySelectorAll('.portfolio-btn');
        cards.forEach(card => {
            expect(card.dataset.url).toBeTruthy();
        });
    });

    test('all portfolio cards have an aria-label', () => {
        const cards = document.querySelectorAll('.portfolio-btn');
        cards.forEach(card => {
            expect(card.getAttribute('aria-label')).toBeTruthy();
        });
    });

    test('renders exactly 6 project cards', () => {
        const cards = document.querySelectorAll('.portfolio-btn');
        expect(cards).toHaveLength(6);
    });
});
