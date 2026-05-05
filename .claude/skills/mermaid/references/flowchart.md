# Flowchart Syntax Reference

## Direction
```
flowchart TD   # Top-Down (default)
flowchart LR   # Left-Right
flowchart BT   # Bottom-Top
flowchart RL   # Right-Left
```

## Node Shapes
```
A[Rectangle]
B(Rounded rectangle)
C([Stadium/pill])
D[[Subroutine]]
E[(Cylinder/database)]
F((Circle))
G>Asymmetric]
H{Diamond/decision}
I{{Hexagon}}
J[/Parallelogram/]
K[\Parallelogram alt\]
L[/Trapezoid\]
M[\Trapezoid alt/]
```

## Edges / Links
```
A --> B           # Arrow
A --- B           # Open link (no arrow)
A --text--> B     # Arrow with label
A -->|text| B     # Arrow with label (alt)
A -.-> B          # Dotted arrow
A ==> B           # Thick arrow
A --o B           # Circle end
A --x B           # Cross end
A <--> B          # Bidirectional
A o--o B          # Bidirectional circle
A x--x B          # Bidirectional cross
```

## Subgraphs
```
flowchart LR
    subgraph one[Group Title]
        A --> B
    end
    subgraph two
        C --> D
    end
    one --> two
```

## Styling
```
flowchart TD
    A --> B --> C

    %% Style individual nodes
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf

    %% Define reusable classes
    classDef green fill:#9f9,stroke:#090
    classDef red fill:#f99,stroke:#900

    %% Apply classes
    class A green
    class B,C red

    %% Or inline
    D:::green --> E:::red
```

## Markdown Text in Nodes
```
flowchart LR
    A["`**Bold** and *italic*`"] --> B["`Line 1
    Line 2`"]
```

## Special Characters
Use quotes for special chars:
```
A["Text with (parens)"] --> B["Text with {braces}"]
```

## Click Interactions
```
click A href "https://example.com" "Tooltip"
click B call myCallback() "Tooltip"
```

## Comments
```
%% This is a comment
```

## Common Patterns

### Decision flow
```
flowchart TD
    Start([Start]) --> Check{Condition?}
    Check -->|Yes| Action[Do something]
    Check -->|No| Skip[Skip it]
    Action --> End([End])
    Skip --> End
```

### Linear pipeline
```
flowchart LR
    Input[(Database)] --> Process[Transform] --> Output[(Store)]
```

### System layers
```
flowchart TB
    subgraph Frontend
        UI[React App]
    end
    subgraph Backend
        API[REST API]
        DB[(PostgreSQL)]
    end
    UI --> API --> DB
```
