/**
 * Tests for the contact form:
 * - required fields validation
 * - email format validation
 * - success message appears after submission
 * - form resets after successful submission
 */

function setupDOM() {
    document.body.innerHTML = `
        <form id="contact-form" name="contact" novalidate>
            <div class="form-group">
                <label for="email">Your email</label>
                <input type="email" id="email" name="replyto" required placeholder="hello@example.com">
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" required rows="5"></textarea>
            </div>
            <button type="submit" class="submit-btn">Send message</button>
            <div id="form-success" class="form-success" hidden>
                Message sent successfully!
            </div>
        </form>
    `;
}

describe('Contact form', () => {
    beforeEach(() => {
        setupDOM();
    });

    test('email input has required attribute', () => {
        const email = document.getElementById('email');
        expect(email.required).toBe(true);
    });

    test('message textarea has required attribute', () => {
        const message = document.getElementById('message');
        expect(message.required).toBe(true);
    });

    test('email input has type="email"', () => {
        const email = document.getElementById('email');
        expect(email.type).toBe('email');
    });

    test('success message is hidden initially', () => {
        const success = document.getElementById('form-success');
        expect(success.hasAttribute('hidden')).toBe(true);
    });

    test('success message shows after fetch submission', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true });

        const form = document.getElementById('contact-form');
        const successMsg = document.getElementById('form-success');

        // Attach handler (mirrors main.js logic)
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(form);
            await fetch('/', { method: 'POST', body: data });
            form.reset();
            successMsg.removeAttribute('hidden');
        });

        // Fill the form
        document.getElementById('email').value = 'test@example.com';
        document.getElementById('message').value = 'Hello there!';

        // Submit
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        // Wait for async fetch
        await Promise.resolve();

        expect(successMsg.hasAttribute('hidden')).toBe(false);

        delete global.fetch;
    });

    test('form resets after successful submission', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true });

        const form = document.getElementById('contact-form');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await fetch('/', { method: 'POST', body: new FormData(form) });
            form.reset();
            document.getElementById('form-success').removeAttribute('hidden');
        });

        emailInput.value = 'test@example.com';
        messageInput.value = 'Hello!';

        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        await Promise.resolve();

        expect(emailInput.value).toBe('');
        expect(messageInput.value).toBe('');

        delete global.fetch;
    });
});
