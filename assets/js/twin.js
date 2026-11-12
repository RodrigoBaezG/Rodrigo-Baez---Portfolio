(function () {
    'use strict';

    /* ── Digital twin chat widget ── */
    const ENDPOINT = '/.netlify/functions/chat';
    const ERROR_TEXT = "Sorry, I couldn't answer right now — try again or use the contact form.";

    const toggle = document.getElementById('twin-toggle');
    const panel = document.getElementById('twin-panel');
    if (!toggle || !panel) return;

    const closeBtn = document.getElementById('twin-close');
    const log = document.getElementById('twin-log');
    const form = document.getElementById('twin-form');
    const input = document.getElementById('twin-input');
    const sendBtn = form.querySelector('button[type="submit"]');
    const chips = panel.querySelectorAll('.twin-chip');

    const history = [];
    let busy = false;

    function open() {
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        input.focus();
    }

    function close() {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
    }

    function addBubble(role, text) {
        const bubble = document.createElement('div');
        bubble.className = `twin-msg twin-msg-${role}`;
        bubble.textContent = text;
        log.appendChild(bubble);
        log.scrollTop = log.scrollHeight;
        return bubble;
    }

    function setBusy(state) {
        busy = state;
        input.disabled = state;
        sendBtn.disabled = state;
        chips.forEach((chip) => (chip.disabled = state));
    }

    async function ask(question) {
        const text = question.trim();
        if (!text || busy) return;

        addBubble('user', text);
        history.push({ role: 'user', content: text });
        setBusy(true);

        const typing = addBubble('assistant', 'Thinking…');
        typing.classList.add('twin-typing');

        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.reply) throw new Error(data.error || 'Request failed');

            typing.classList.remove('twin-typing');
            typing.textContent = data.reply;
            history.push({ role: 'assistant', content: data.reply });
        } catch {
            typing.classList.remove('twin-typing');
            typing.classList.add('twin-msg-error');
            typing.textContent = ERROR_TEXT;
            history.pop(); // drop the unanswered question so the history stays user/assistant pairs
        } finally {
            setBusy(false);
            log.scrollTop = log.scrollHeight;
            input.focus();
        }
    }

    toggle.addEventListener('click', () => (panel.hidden ? open() : close()));
    closeBtn.addEventListener('click', close);
    panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
    document.querySelectorAll('[data-twin-open]').forEach((el) =>
        el.addEventListener('click', (e) => {
            e.preventDefault();
            open();
        })
    );

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value;
        input.value = '';
        ask(value);
    });

    chips.forEach((chip) => chip.addEventListener('click', () => ask(chip.textContent)));
})();
