# Presentation Template

A self-contained presentation workspace using [Reveal.js](https://revealjs.com/). Brainstorm, outline, design slides, and present — all in one place.

## Getting Started

```bash
npm install
npm run serve
```

Opens a landing page at `http://127.0.0.1:8080` where you can navigate to slides or the outline.

## Agent Devcontainer

For working with an AI coding agent, `.devcontainer/agent-devcontainer/` runs it in a network-isolated container — all traffic goes through an `iron-proxy` sidecar with an allowlist, rather than the agent having open internet access.

```bash
node agent.js up      # stand up the sandbox and open a shell in it
node agent.js logs    # tail iron-proxy's logs (e.g. to see what's being blocked)
node agent.js down    # force a teardown (not usually needed — see below)
```

`up` is idempotent (safe to run again to get a shell in an already-running environment) and tears itself down automatically once the last shell you opened with it exits. See [docs/agent-devcontainer.md](docs/agent-devcontainer.md) for how it's built and why.

## Project Structure

```text
├── outline.md          # Brainstorm and presentation structure
├── outline.html        # Live-rendered markdown view of outline.md
├── slides/
│   ├── index.html      # Reveal.js slides
│   ├── styles.css      # Custom slide styling
│   └── assets/         # Images, videos, etc.
├── index.html          # Landing page (slides or outline)
└── package.json
```

## Commands

| Command | Description |
| --- | --- |
| `npm run serve` | Start live-server with auto-reload, presents menu to choose outline or slides as default page |
| `npm run present` | Start live-server with auto-reload, goes directly to slides |
| `npm run outline` | Open the outline in the browser |

## Outline (`outline.md`)

Write your brainstorm and presentation structure in `outline.md`. Open `outline.html` in the browser for a live-rendered view that auto-refreshes as you edit.

### Highlight Syntax

Use highlights to annotate transition points and speaker cues directly in the outline:

| Syntax | Color | Use for |
| --- | --- | --- |
| `==text==` | Yellow | Slide advance points |
| `==blue:text==` | Light blue | Speaker 2 transitions |
| `==green:text==` | Light green | Speaker 3 transitions |

**Example:**

```markdown
## Introduction

Cover the background, then ==advance slide==.

==blue:Speaker 2 takes over== for the live demo.

==green:Speaker 3 joins== for Q&A.
```

## Slides (`slides/index.html`)

Slides are built with Reveal.js 6. HTML and markdown slides can be freely mixed in the same presentation.

### HTML Slide

```html
<section>
  <h2>My Slide</h2>
  <p>Custom layout with full HTML control</p>
</section>
```

### Markdown Slide

```html
<section data-markdown>
  <textarea data-template>
    ## My Slide

    - Point one
    - Point two
  </textarea>
</section>
```

### Vertical (Nested) Slides

Wrap sections in a parent `<section>` to create vertical sub-slides. Navigate down with the arrow key.

```html
<section>
  <section><h2>Main Topic</h2></section>
  <section data-markdown><textarea data-template>## Subtopic</textarea></section>
</section>
```

### Navigation

| Key | Action |
| --- | --- |
| `→` / `Space` | Next slide |
| `Shift+Space` | Previous slide |
| `←` | Previous slide |
| `↓` | Next vertical slide |
| `Home` | First slide |
| `End` | Last slide |
| `Esc` / `O` | Slide overview (thumbnail view) |
| `F` | Fullscreen |
| `B` / `.` | Pause / black screen |
| `S` | Speaker notes view |
| `Ctrl+Shift+F` | Search slide content |
| `Alt+Click` | Zoom into element |
| `?` | Show all keyboard shortcuts |

### Speaker Notes

Add notes to any slide with an `<aside>` tag:

```html
<section>
  <h2>My Slide</h2>
  <aside class="notes">
    These are speaker notes. Press S to open the notes view.
  </aside>
</section>
```

### Configuration

Key options set in `Reveal.initialize()`:

| Option | Value | Description |
| --- | --- | --- |
| `hash` | `true` | URL reflects current slide — stays on same slide after refresh |
| `progress` | `false` | Progress bar hidden |

## Plugins

The following Reveal.js plugins are enabled:

| Plugin | Description |
| --- | --- |
| Markdown | Write slides in markdown using `data-markdown` |
| Highlight | Syntax highlighting for code blocks |
| Notes | Speaker notes view (`S` key) |
| Search | Search slide content (`Ctrl+Shift+F`) |
| Zoom | Zoom into elements (`Alt+Click`) |

## Themes

The default theme is `black`. To change it, swap the theme stylesheet in `slides/index.html`:

```html
<link rel="stylesheet" href="../node_modules/reveal.js/dist/theme/black.css">
```

Available themes: `black`, `white`, `league`, `beige`, `sky`, `night`, `serif`, `simple`, `solarized`, `moon`, `dracula`.
