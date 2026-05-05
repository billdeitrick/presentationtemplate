# Directives and Frontmatter Configuration

As of Mermaid v10.5+, the preferred approach is **frontmatter config** using YAML at the top of the diagram. The older `%%{init}%%` directive syntax still works.

## Frontmatter Config (Preferred, v10.5+)
```
---
config:
  theme: base
  look: handDrawn
  layout: elk
---
flowchart TD
    A --> B
```

## Init Directive (Still Supported)
```
%%{init: {'theme': 'dark', 'logLevel': 1}}%%
flowchart LR
    A --> B
```

Multi-line directive (must be on one line in practice):
```
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#ff0000'}}}%%
```

## Top-Level Config Options
| Key | Values | Effect |
|-----|--------|--------|
| `theme` | `default`, `dark`, `forest`, `neutral`, `base` | Visual theme |
| `look` | `classic`, `handDrawn` | Rendering style |
| `layout` | `dagre`, `elk` | Layout engine |
| `fontFamily` | CSS font string | Override font |
| `fontSize` | Number (px) | Base font size |
| `logLevel` | `1`-`5` | Debug verbosity |

## Diagram-Specific Config

### Flowchart
```
---
config:
  flowchart:
    curve: basis
    padding: 20
    useMaxWidth: false
---
```

Curve options: `basis`, `bumpX`, `bumpY`, `cardinal`, `catmullRom`, `linear`, `monotoneX`, `monotoneY`, `natural`, `step`, `stepAfter`, `stepBefore`

### Sequence Diagram
```
---
config:
  sequence:
    mirrorActors: false
    width: 150
    height: 65
    useMaxWidth: false
---
```

### Gantt
```
---
config:
  gantt:
    barHeight: 20
    barGap: 4
    topPadding: 75
    fontSize: 14
    sectionFontSize: 14
    numberSectionStyles: 4
---
```

### Class Diagram
```
---
config:
  class:
    hideEmptyMembersBox: true
---
```

### State Diagram
```
---
config:
  state:
    defaultRenderer: elk
---
```

## ELK Layout
For complex diagrams with many crossings, ELK can produce cleaner layouts:
```
---
config:
  layout: elk
---
flowchart LR
    A --> B --> C
    A --> C
```

ELK requires the elk bundle (included in mermaid CDN builds).
