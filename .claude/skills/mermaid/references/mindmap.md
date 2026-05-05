# Mindmap Syntax Reference

## Basic Structure
Hierarchy is defined by **indentation**. The root node has no indentation.

```
mindmap
  root((Central Topic))
    Branch A
      Leaf 1
      Leaf 2
    Branch B
      Leaf 3
      Leaf 4
```

## Node Shapes
```
mindmap
  root
    [Square]
    (Rounded)
    ((Circle))
    ))Bang((
    )Cloud(
    {{Hexagon}}
    Plain text
```

## Icons (Font Awesome)
```
mindmap
  root
    Node
      ::icon(fa fa-book)
      Sub-node
```

## CSS Classes
```
mindmap
  root
    Normal node
    :::urgent Important node
```

Define classes in CSS, then apply with `:::classname`.

## Markdown in Nodes
Use backticks for markdown formatting:
```
mindmap
  root
    "`**Bold** item`"
    "`*Italic* item`"
    "`Regular text
    second line`"
```

## Full Example
```
mindmap
  root((Product Strategy))
    Market
      Customers
        B2B
        B2C
      Competition
        Direct
        Indirect
    Product
      Core Features
      Roadmap
      Pricing
    Team
      Engineering
      Design
      Marketing
```

## Notes
- Mindmap syntax is indentation-sensitive — be consistent (use spaces, not tabs)
- No edge labels or directionality control (always radiates from root)
- Keep node text short for readability
