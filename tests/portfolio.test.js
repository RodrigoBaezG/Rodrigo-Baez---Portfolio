/**
 * Tests for the portfolio section, run against the real markup in index.html:
 * - exactly the expected projects are listed
 * - every card has a title, a description, tags and a live link
 * - links open in a new tab with noopener/noreferrer
 */

const fs = require('fs');
const path = require('path');

const EXPECTED_PROJECTS = [
    { name: 'FinAlly', url: 'https://finally-95s4.onrender.com' },
    { name: 'Prelegal', url: 'https://prelegal-i1vs.onrender.com' },
    { name: 'Kanban Board', url: 'https://kanban-9gdg.onrender.com/' },
    { name: 'Goals App', url: 'https://rodrigogoals-app.netlify.app' },
    { name: 'Art Gallery', url: 'https://kukobaezartgallery.netlify.app/' },
    { name: 'CV Editor', url: 'https://react-cv-editor.netlify.app/' },
];

const REMOVED_PROJECTS = ['NotesPad', 'Tic Tac Toe', 'Meditation App'];

function loadPortfolio() {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    document.body.innerHTML = doc.getElementById('portfolio').outerHTML;
}

describe('Portfolio section', () => {
    beforeEach(() => {
        loadPortfolio();
    });

    test('renders exactly the 6 current projects', () => {
        expect(document.querySelectorAll('.project-card')).toHaveLength(EXPECTED_PROJECTS.length);
    });

    test('does not list the removed projects', () => {
        const titles = [...document.querySelectorAll('.project-card h4')].map(h => h.textContent);
        REMOVED_PROJECTS.forEach(name => {
            expect(titles.some(t => t.includes(name))).toBe(false);
        });
    });

    test.each(EXPECTED_PROJECTS)('"$name" card links to its live site', ({ url }) => {
        const link = document.querySelector(`.project-card a[href="${url}"]`);
        expect(link).not.toBeNull();
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toMatch(/noopener/);
        expect(link.getAttribute('rel')).toMatch(/noreferrer/);
    });

    test('every card has a title, a detailed description and technology tags', () => {
        document.querySelectorAll('.project-card').forEach(card => {
            expect(card.querySelector('h4').textContent.trim()).not.toBe('');
            expect(card.querySelector('.project-desc').textContent.trim().length).toBeGreaterThan(120);
            expect(card.querySelectorAll('.tech-tag').length).toBeGreaterThan(0);
        });
    });

    test('every card image has alt text', () => {
        document.querySelectorAll('.project-card img').forEach(img => {
            expect(img.getAttribute('alt').trim()).not.toBe('');
        });
    });
});
