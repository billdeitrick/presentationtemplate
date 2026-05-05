---
name: mermaid
description: Generate Mermaid diagram code for embedding in reveal.js slides. Supports flowcharts, sequence diagrams, class diagrams, ER diagrams, Gantt charts, and 18 more diagram types. Use when the user asks for a diagram, chart (non-data), architecture diagram, flow, or process visualization on a slide.
allowed-tools: Read
---

> Vendored from [WH-2099/mermaid-skill](https://github.com/WH-2099/mermaid-skill) — MIT License, Copyright (c) 2026 WH-2099. See [LICENSE](LICENSE). Local customizations may diverge from upstream.

# Mermaid Diagram Generator

Generate Mermaid diagram code for embedding in reveal.js presentations. Mermaid is already loaded and initialized in the slide HTML — no additional setup needed.

## Workflow

1. **Understand Requirements**: Analyze the user's description to determine the most suitable diagram type
2. **Read Documentation**: Read the corresponding reference file for the diagram type before generating
3. **Generate Code**: Write valid Mermaid syntax that renders correctly
4. **Embed in Slide**: Place the diagram in the appropriate reveal.js slide using the HTML pattern below

## Embedding in Reveal.js Slides

Use `<pre class="mermaid">` inside the `.content` wrapper. The slide HTML already includes the Mermaid CDN and initialization code.

**Basic pattern:**
```html
<section id="slide-diagram">
  <h2>Slide Title</h2>
  <div class="content">
    <pre class="mermaid">
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Result]
    B -->|No| D[End]
    </pre>
  </div>
</section>
```

**Full-slide diagram** (diagram fills the content area):
```html
<section id="slide-diagram">
  <h2>System Architecture</h2>
  <div class="content" style="align-items: center; justify-content: center;">
    <pre class="mermaid" style="width: 100%;">
flowchart LR
    A[Client] --> B[API] --> C[Database]
    </pre>
  </div>
</section>
```

**Diagram with text** (side by side):
```html
<section id="slide-diagram">
  <h2>Slide Title</h2>
  <div class="content">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;">
      <div>
        <p>Key points about this flow:</p>
        <ul>
          <li>Point one</li>
          <li>Point two</li>
        </ul>
      </div>
      <pre class="mermaid">
flowchart TD
    A --> B --> C
      </pre>
    </div>
  </div>
</section>
```

### CSS Note

Mermaid renders as an inline SVG. The `<pre class="mermaid">` element has its default `<pre>` styles stripped in `styles.css`. If you need to control sizing, set `width` and/or `max-height` on the `<pre>` tag directly.

### Theming to Match the Presentation

Use the `%%{init}%%` directive to align diagram colors with the presentation palette:

```
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#2196F3',
  'primaryTextColor': '#ffffff',
  'primaryBorderColor': '#1565C0',
  'lineColor': '#333333',
  'background': '#ffffff',
  'nodeBorder': '#1565C0'
}}}%%
flowchart TD
    A[Start] --> B[End]
```

For dark presentations, set `'background'` to the dark color and use light text colors. See [references/config-theming.md](references/config-theming.md) for all theming options.

## Diagram Type Reference

**Always read the reference doc before generating code for a diagram type.**

| Type | Documentation | Use Cases |
| ---- | ------------- | --------- |
| Flowchart | [flowchart.md](references/flowchart.md) | Processes, decisions, steps |
| Sequence Diagram | [sequenceDiagram.md](references/sequenceDiagram.md) | Interactions, messaging, API calls |
| Class Diagram | [classDiagram.md](references/classDiagram.md) | Class structure, inheritance, associations |
| State Diagram | [stateDiagram.md](references/stateDiagram.md) | State machines, state transitions |
| ER Diagram | [entityRelationshipDiagram.md](references/entityRelationshipDiagram.md) | Database design, entity relationships |
| Gantt Chart | [gantt.md](references/gantt.md) | Project planning, timelines |
| Pie Chart | [pie.md](references/pie.md) | Proportions, distributions |
| Mindmap | [mindmap.md](references/mindmap.md) | Hierarchical structures, knowledge maps |
| Timeline | [timeline.md](references/timeline.md) | Historical events, milestones |
| Git Graph | [gitgraph.md](references/gitgraph.md) | Branches, merges, versions |
| Quadrant Chart | [quadrantChart.md](references/quadrantChart.md) | Four-quadrant analysis |
| Requirement Diagram | [requirementDiagram.md](references/requirementDiagram.md) | Requirements traceability |
| C4 Diagram | [c4.md](references/c4.md) | System architecture (C4 model) |
| Sankey Diagram | [sankey.md](references/sankey.md) | Flow quantities, conversions |
| XY Chart | [xyChart.md](references/xyChart.md) | Line charts, bar charts |
| Block Diagram | [block.md](references/block.md) | System components, modules |
| Packet Diagram | [packet.md](references/packet.md) | Network protocols, data structures |
| Kanban | [kanban.md](references/kanban.md) | Task management, workflows |
| Architecture Diagram | [architecture.md](references/architecture.md) | System architecture |
| Radar Chart | [radar.md](references/radar.md) | Multi-dimensional comparison |
| Treemap | [treemap.md](references/treemap.md) | Hierarchical data visualization |
| User Journey | [userJourney.md](references/userJourney.md) | User experience flows |
| ZenUML | [zenuml.md](references/zenuml.md) | Sequence diagrams (code style) |

> **Missing reference file?** The full reference set is available at [WH-2099/mermaid-skill](https://github.com/WH-2099/mermaid-skill/tree/main/.claude/skills/mermaid/references) and the [official Mermaid docs](https://mermaid.js.org/syntax/).

## Configuration & Themes

- [Theming](references/config-theming.md) — Custom colors and styles
- [Directives](references/config-directives.md) — Diagram-level configuration via `%%{init}%%`
- [Layouts](references/config-layouts.md) — Layout direction and spacing
- [Configuration](references/config-configuration.md) — Global settings
- [Math](references/config-math.md) — LaTeX math support

## Output Rules

1. When generating diagram code to show the user in conversation, wrap in ` ```mermaid ` code blocks
2. When embedding in a slide, use `<pre class="mermaid">` — not a fenced code block
3. Indentation inside `<pre class="mermaid">` must be consistent — Mermaid is indentation-sensitive
4. Always read the relevant reference doc before generating complex diagrams
5. Apply `%%{init}%%` theming when the user has a custom color palette
