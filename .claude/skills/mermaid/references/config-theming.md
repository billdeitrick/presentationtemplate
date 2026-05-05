# Mermaid Theming Reference

## Available Themes
- `default` — standard light theme
- `neutral` — grayscale, good for print
- `dark` — dark background
- `forest` — green tones
- `base` — **the only fully customizable theme** (use this for custom colors)

## Setting Theme via Directive
```
%%{init: {'theme': 'dark'}}%%
flowchart TD
    A --> B
```

## Setting Theme via Frontmatter
```
---
config:
  theme: base
---
flowchart TD
    A --> B
```

## Custom Colors with `base` Theme

Use `themeVariables` with the `base` theme. **Only hex colors are supported** (not named colors like "red").

```
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#2196F3',
  'primaryTextColor': '#ffffff',
  'primaryBorderColor': '#1565C0',
  'secondaryColor': '#ff9800',
  'secondaryTextColor': '#ffffff',
  'tertiaryColor': '#e8f5e9',
  'lineColor': '#333333',
  'background': '#ffffff',
  'mainBkg': '#2196F3',
  'nodeBorder': '#1565C0',
  'clusterBkg': '#e3f2fd',
  'titleColor': '#222222',
  'edgeLabelBackground': '#ffffff',
  'fontFamily': 'Helvetica, Arial, sans-serif',
  'fontSize': '16px'
}}}%%
```

## Common themeVariables

### Universal
| Variable | Effect |
|----------|--------|
| `background` | Page/diagram background |
| `fontFamily` | Font for all text |
| `fontSize` | Base font size |
| `lineColor` | Edge/connector color |

### Flowchart / General Node Colors
| Variable | Effect |
|----------|--------|
| `primaryColor` | Node fill (default) |
| `primaryTextColor` | Text on primary nodes |
| `primaryBorderColor` | Node border |
| `secondaryColor` | Secondary node fill |
| `tertiaryColor` | Tertiary node fill |
| `mainBkg` | Main background of nodes |
| `nodeBorder` | Node border color |
| `clusterBkg` | Subgraph background |

### Sequence Diagrams
| Variable | Effect |
|----------|--------|
| `actorBkg` | Actor box background |
| `actorBorder` | Actor box border |
| `actorTextColor` | Actor label text |
| `activationBorderColor` | Activation bar border |
| `activationBkgColor` | Activation bar fill |
| `signalColor` | Arrow color |
| `signalTextColor` | Arrow label text |
| `labelBoxBkgColor` | Note background |

### Pie Charts
| Variable | Effect |
|----------|--------|
| `pie1` through `pie12` | Slice colors |

### Timeline
| Variable | Effect |
|----------|--------|
| `cScale0` through `cScale11` | Section colors |

## Dark Presentation Example
```
%%{init: {'theme': 'base', 'themeVariables': {
  'background': '#1a1a2e',
  'primaryColor': '#4d96ff',
  'primaryTextColor': '#ffffff',
  'primaryBorderColor': '#4d96ff',
  'lineColor': '#aaaaaa',
  'mainBkg': '#16213e',
  'nodeBorder': '#4d96ff',
  'clusterBkg': '#0f3460',
  'titleColor': '#ffffff',
  'edgeLabelBackground': '#1a1a2e'
}}}%%
```
