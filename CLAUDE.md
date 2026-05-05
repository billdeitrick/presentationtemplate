# Presentation Template

This repo is a template for building presentations with [Reveal.js](https://revealjs.com/). Each project using this template is a self-contained presentation with brainstorming, outlining, and slides in one place.

## Presentation Abstract and Requirements

The presentation abstract and requirements will go here as defined for the specific presentation. Use this information to help guide the user with content.

## Workflow

1. **Brainstorm & outline** in `outline.md`
2. **Build slides** in `slides/index.html` (HTML-first; markdown optional)
3. **Serve and present** with `npm run serve`

## Project Structure

```text
├── outline.md          # Brainstorm and presentation structure
├── slides/
│   ├── index.html      # Reveal.js slides
│   ├── styles.css      # Custom slide styling
│   └── assets/         # Images, videos, etc.
├── index.html          # Redirects to slides/index.html
└── package.json
```

## Commands

```bash
npm run serve   # Start live-server with auto-reload at http://127.0.0.1:8080
```

The user will often already have the dev server running. It's a good idea to check with them first to see if you need to start it (or just go check yourself via CLI commands).

## Slides

ALWAYS use the revealjs skill wherever possible when working with slides and design. This has resources and instructions to improve consistency and quality.

- Slides are built with Reveal.js
- `hash: true` should be enabled — slides stay on the same position after refresh
- Navigate with arrow keys; vertical slides use the down arrow
- Be sure to always use reveal.js config options and utilities as a first choice before resulting to ad-hoc HTML, JS, and CSS

## Tools

### Playwright

Playwright CLI is installed globally and available as `playwright-cli` skill:

```bash
playwright-cli <command>
```
ALWAYS use the playwright-cli skill when interacting with the presentation or working with Playwright rather than using Bash or npx commands directly.

Use Playwright to take screenshots, verify slide design, test animations, and iterate on visual changes without manual browser interaction.

The browser will log a `favicon.ico` 404 console error — this is harmless and can be ignored.

- Use `Reveal.configure({transition: 'none'})` via `eval` before navigating, to avoid capturing mid-transition artifacts
- Use `Reveal.slide(N)` via `eval` to navigate without triggering transitions, rather than `goto` with a hash URL. For vertical slides use the two-argument form: `Reveal.slide(h, v)`
- The dev server is managed by the user — never start or restart it
