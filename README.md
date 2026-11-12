# Rodrigo Báez García — Portfolio

Personal portfolio site showcasing my work as a software developer. Built as a hand-crafted single-page site with vanilla JavaScript, CSS, and a Webpack build pipeline — designed for fast loads, accessibility, and a clean visual identity.

Live: hosted on Netlify.

## Featured projects

| Project | Summary | Stack |
|---|---|---|
| FinAlly — AI Trading Workstation | Live-streaming trading dashboard with simulated portfolio and LLM chat assistant that can execute trades | Next.js, FastAPI, SSE, AI, Docker |
| Prelegal | Conversational AI platform for drafting legal agreements, with live preview, saved drafts and PDF export | Next.js, FastAPI, AI, Docker |
| Kanban Board | Multi-project board with drag-and-drop cards and browser persistence | Next.js, React, TypeScript, Tailwind |
| Goals App | Goal tracker with JWT auth, frequency-based progress and a demo mode | React, Vite, Node.js, Express, PostgreSQL |
| Art Gallery | Catalog website for a visual artist, backed by a PostgreSQL REST API | JavaScript, Node.js, Express, PostgreSQL |
| CV Editor | Résumé builder with live preview and PDF export | React, Vite, Tailwind, Vitest |

## Digital twin (AI chat)

Visitors can chat with an AI "digital twin" that answers questions about my career, skills and projects — always in English. Open it from the floating **Ask my digital twin** button or the hero CTA.

- **Frontend**: `assets/js/twin.js` + `assets/css/twin.css` (markup at the end of `index.html`).
- **Backend**: Netlify Function `netlify/functions/chat.js` proxies to [OpenRouter](https://openrouter.ai) so the API key never reaches the browser. Model: `google/gemma-4-31b-it:free`, with free fallbacks.
- **Knowledge**: `netlify/lib/twin-knowledge.js` holds the system prompt and facts — update it whenever projects or experience change.

**Local development**: put `OPENROUTER_API_KEY=...` in `.env` (git-ignored) and run `npx netlify-cli dev`, which serves the site *and* the function. Plain `npm start` does not run the function.

**Deploy**: in Netlify → Site configuration → Environment variables, add `OPENROUTER_API_KEY`.

## Tech stack

- **Frontend**: HTML5, CSS3, vanilla JavaScript (ES modules)
- **Build**: Webpack 5 (with `html-webpack-plugin`, `mini-css-extract-plugin`, asset hashing, Terser, CSS minimizer)
- **Quality**: ESLint, Prettier
- **Testing**: Jest + Testing Library (jsdom)
- **Hosting**: Netlify (with the built-in Netlify Forms integration for the contact form)

## Highlights

- Responsive layout with a video hero, animated portfolio cards, and a dark-friendly palette
- Accessibility-first markup: skip-link, ARIA labels, keyboard-navigable nav, `prefers-reduced-motion` aware animations
- SEO baseline: Open Graph + Twitter Card meta, JSON-LD `Person` structured data, descriptive `alt` text
- Performance: critical asset preloading, lazy-loaded portfolio images, hashed asset filenames for long-term caching
- Contact form wired to Netlify Forms — no backend required

## Project structure

```
RodrigoBaez-Portfolio/
├── assets/              # Images, video, fonts, CSS, JS modules
│   ├── img/portfolio/   # Project screenshots
│   ├── img/skillset/    # Tech-stack icons
│   ├── img/social/      # Social media icons
│   └── video/           # Hero video
├── tests/               # Jest unit tests
├── index.html           # Single-page entry
├── index.js             # JS entry point (consumed by Webpack)
├── webpack.config.js    # Build configuration
├── jest.config.js       # Test configuration
└── package.json
```

## Getting started

Requires **Node.js 18+** and **npm**.

```bash
# Install dependencies
npm install

# Start the dev server (auto-reloads on save)
npm start

# Production build (output to dist/)
npm run build

# Run unit tests
npm test
npm run test:watch
npm run test:coverage

# Lint and format
npm run lint
npm run format
```

The dev server opens automatically at the URL printed in the terminal.

## Adding a new project to the portfolio

1. Drop the screenshot into `assets/img/portfolio/` (recommended ~1440×900, PNG).
2. Add a new `<button class="portfolio-btn animate-on-scroll">` block inside the `#portfolio` section in `index.html`, pointing `data-url` at the live project URL.
3. List the relevant tech tags inside `.card-tech`.
4. Run `npm run build` to verify the asset is bundled correctly.

## Contact

- **GitHub**: [RodrigoBaezG](https://github.com/RodrigoBaezG)
- **LinkedIn**: [rodrigo-báez-garcía](https://www.linkedin.com/in/rodrigo-b%C3%A1ez-garc%C3%ADa-4bb55a271)

## License

ISC — see `package.json`.
