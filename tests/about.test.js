/**
 * Tests for the About section and navigation in index.html.
 */

const fs = require('fs');
const path = require('path');

function loadIndex() {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    document.body.innerHTML = doc.body.innerHTML;
}

describe('About section and navigation', () => {
    beforeEach(() => {
        loadIndex();
    });

    test('the About section exists and has a heading and text', () => {
        const about = document.getElementById('about');
        expect(about).not.toBeNull();
        expect(about.querySelector('h3').textContent.trim()).toBe('About me');
        expect(about.querySelector('.about-content').textContent.trim().length).toBeGreaterThan(200);
    });

    test('the navigation links to the About section', () => {
        const link = document.querySelector('#nav-menu a[href="#about"]');
        expect(link).not.toBeNull();
    });

    test('the Skillset section lists Git and Express', () => {
        const names = [...document.querySelectorAll('#skillset .skill-name')].map(el => el.textContent);
        expect(names).toEqual(expect.arrayContaining(['Git', 'Express']));
    });

    test('the About section mentions the Hillogy experience and the certificates', () => {
        const text = document.getElementById('about').textContent;
        expect(text).toMatch(/Hillogy/);
        expect(text).toMatch(/AcademiaX/);
    });

    test('the contact section shows a mailto link to email', () => {
        const link = document.querySelector('#contact a[href="mailto:rkbaezgarcia@gmail.com"]');
        expect(link).not.toBeNull();
    });

    test('the CV PDF is linked from the hero and About and exists on disk', () => {
        const cvHref = 'assets/docs/RodrigoBaez_SoftwareD_CV.pdf';
        expect(document.querySelectorAll(`a[href="${cvHref}"]`).length).toBeGreaterThanOrEqual(2);
        expect(fs.existsSync(path.join(__dirname, '..', cvHref))).toBe(true);
    });
});
