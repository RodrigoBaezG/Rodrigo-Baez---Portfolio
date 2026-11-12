/**
 * Netlify Function: POST /.netlify/functions/chat
 * Proxies the portfolio "digital twin" chat to OpenRouter so the API key never reaches the browser.
 */

const { SYSTEM_PROMPT } = require('../lib/twin-knowledge');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'google/gemma-4-31b-it:free';
// Tried in order when the primary is rate-limited or down. openrouter/free is a last resort that routes to any free model.
const FALLBACK_MODELS = [PRIMARY_MODEL, 'google/gemma-4-26b-a4b-it:free', 'openrouter/free'];
const MAX_ATTEMPTS = 2;
const MAX_MESSAGES = 12;
const MAX_CHARS = 1000;

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}

function parseMessages(rawBody) {
    let body;
    try {
        body = JSON.parse(rawBody || '');
    } catch {
        return null;
    }
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) return null;

    const messages = body.messages.slice(-MAX_MESSAGES);
    const valid = messages.every(
        (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim().length > 0 &&
            m.content.length <= MAX_CHARS
    );
    if (!valid || messages[messages.length - 1].role !== 'user') return null;

    return messages.map((m) => ({ role: m.role, content: m.content.trim() }));
}

async function callOpenRouter(apiKey, messages) {
    let res;
    try {
        res = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.URL || 'https://netlify.app',
                'X-Title': 'Rodrigo Baez Portfolio',
            },
            body: JSON.stringify({
                model: PRIMARY_MODEL,
                models: FALLBACK_MODELS,
                temperature: 0.4,
                // Headroom for fallback models that spend tokens on reasoning before answering
                max_tokens: 1200,
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
            }),
        });
    } catch {
        throw new Error('The digital twin is unreachable right now. Please try again later.');
    }
    if (!res.ok) {
        throw new Error('The digital twin is busy right now. Please try again in a moment.');
    }
    const data = await res.json().catch(() => ({}));
    // Empty content (e.g. a reasoning model ran out of tokens) returns '' so the caller retries
    return data?.choices?.[0]?.message?.content?.trim() || '';
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method not allowed' });
    }

    const messages = parseMessages(event.body);
    if (!messages) {
        return json(400, { error: 'Invalid request' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return json(500, { error: 'The digital twin is not configured right now.' });
    }

    let lastError = 'The digital twin could not answer. Please try again.';
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
            const reply = await callOpenRouter(apiKey, messages);
            if (reply) return json(200, { reply });
        } catch (err) {
            lastError = err.message;
        }
    }
    return json(502, { error: lastError });
};

exports.PRIMARY_MODEL = PRIMARY_MODEL;
exports.FALLBACK_MODELS = FALLBACK_MODELS;
