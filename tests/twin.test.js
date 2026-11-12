/**
 * Tests for the digital twin chat: widget markup/behaviour and the Netlify function.
 */

const fs = require('fs');
const path = require('path');

function loadIndex() {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    document.body.innerHTML = doc.body.innerHTML;
}

function loadWidget() {
    jest.isolateModules(() => {
        require('../assets/js/twin.js');
    });
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('Digital twin widget', () => {
    beforeEach(() => {
        loadIndex();
        global.fetch = jest.fn();
        Element.prototype.scrollTo = jest.fn();
    });

    test('markup exists and the panel starts hidden', () => {
        expect(document.getElementById('twin-toggle')).not.toBeNull();
        expect(document.getElementById('twin-panel').hidden).toBe(true);
        expect(document.getElementById('twin-form')).not.toBeNull();
        expect(document.querySelectorAll('.twin-chip').length).toBe(3);
    });

    test('the toggle opens and closes the panel', () => {
        loadWidget();
        const toggle = document.getElementById('twin-toggle');
        const panel = document.getElementById('twin-panel');

        toggle.click();
        expect(panel.hidden).toBe(false);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');

        document.getElementById('twin-close').click();
        expect(panel.hidden).toBe(true);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    test('submitting a question renders the user and assistant messages', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ reply: 'I built <b>FinAlly</b>.' }),
        });
        loadWidget();

        document.getElementById('twin-input').value = 'What did you build?';
        document.getElementById('twin-form').dispatchEvent(new Event('submit', { cancelable: true }));
        await flush();

        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe('/.netlify/functions/chat');
        expect(JSON.parse(options.body).messages).toEqual([{ role: 'user', content: 'What did you build?' }]);

        const user = document.querySelectorAll('.twin-msg-user');
        expect(user[user.length - 1].textContent).toBe('What did you build?');
        const replies = document.querySelectorAll('.twin-msg-assistant');
        const last = replies[replies.length - 1];
        // Rendered as text, not HTML
        expect(last.textContent).toBe('I built <b>FinAlly</b>.');
        expect(last.querySelector('b')).toBeNull();
    });

    test('a failed request shows an error message', async () => {
        global.fetch.mockRejectedValue(new Error('offline'));
        loadWidget();

        document.querySelector('.twin-chip').click();
        await flush();

        const error = document.querySelector('.twin-msg-error');
        expect(error).not.toBeNull();
        expect(error.textContent).toMatch(/couldn't answer/);
        expect(document.getElementById('twin-input').disabled).toBe(false);
    });
});

describe('chat Netlify function', () => {
    const { handler, PRIMARY_MODEL, FALLBACK_MODELS } = require('../netlify/functions/chat');
    const post = (body) => ({ httpMethod: 'POST', body: JSON.stringify(body) });
    const ORIGINAL_KEY = process.env.OPENROUTER_API_KEY;

    beforeEach(() => {
        process.env.OPENROUTER_API_KEY = 'test-key';
        global.fetch = jest.fn();
    });

    afterAll(() => {
        process.env.OPENROUTER_API_KEY = ORIGINAL_KEY;
    });

    test('rejects non-POST requests', async () => {
        const res = await handler({ httpMethod: 'GET' });
        expect(res.statusCode).toBe(405);
    });

    test('rejects invalid bodies', async () => {
        expect((await handler({ httpMethod: 'POST', body: 'not json' })).statusCode).toBe(400);
        expect((await handler(post({ messages: [] }))).statusCode).toBe(400);
        expect((await handler(post({ messages: [{ role: 'system', content: 'hi' }] }))).statusCode).toBe(400);
        expect((await handler(post({ messages: [{ role: 'user', content: 'x'.repeat(1001) }] }))).statusCode).toBe(400);
        expect((await handler(post({ messages: [{ role: 'assistant', content: 'hi' }] }))).statusCode).toBe(400);
    });

    test('returns 500 when the API key is missing', async () => {
        delete process.env.OPENROUTER_API_KEY;
        const res = await handler(post({ messages: [{ role: 'user', content: 'hi' }] }));
        expect(res.statusCode).toBe(500);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('calls OpenRouter with the free Google model and returns the reply', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: ' Hello! ' } }] }),
        });

        const res = await handler(post({ messages: [{ role: 'user', content: 'Who are you?' }] }));
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body)).toEqual({ reply: 'Hello!' });

        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
        expect(options.headers.Authorization).toBe('Bearer test-key');
        const sent = JSON.parse(options.body);
        expect(sent.model).toBe(PRIMARY_MODEL);
        expect(PRIMARY_MODEL).toBe('google/gemma-4-31b-it:free');
        expect(sent.models).toEqual(FALLBACK_MODELS);
        expect(sent.messages[0].role).toBe('system');
        expect(sent.messages[0].content).toMatch(/ALWAYS answer in English/);
        expect(sent.messages[1]).toEqual({ role: 'user', content: 'Who are you?' });
    });

    test('returns 502 when OpenRouter fails', async () => {
        global.fetch.mockResolvedValue({ ok: false, status: 429, json: () => Promise.resolve({}) });
        const res = await handler(post({ messages: [{ role: 'user', content: 'hi' }] }));
        expect(res.statusCode).toBe(502);
    });
});
