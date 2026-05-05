# Entity Relationship Diagram Syntax Reference

## Basic Structure
```
erDiagram
    ENTITY1 ||--o{ ENTITY2 : "relationship label"
```

## Cardinality Notation
```
|o    zero or one (left side)
o|    zero or one (right side)
||    exactly one
}o    zero or more
o{    zero or more
}|    one or more
|{    one or more
```

Combined examples:
```
A ||--|| B   : "one to one"
A ||--o{ B   : "one to zero-or-more"
A }|--|| B   : "one-or-more to one"
A }o--o{ B   : "zero-or-more to zero-or-more"
```

## Relationship Line Types
```
--    identifying (solid)
..    non-identifying (dashed)
```

## Entity Attributes
```
erDiagram
    CUSTOMER {
        int id PK
        string name
        string email UK
        int address_id FK
        string notes "optional field"
    }
```

Attribute types: `string`, `int`, `float`, `boolean`, `date`, `datetime`
Key types: `PK` (primary key), `FK` (foreign key), `UK` (unique key)

## Full Example
```
erDiagram
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--|{ LINE-ITEM : "contains"
    PRODUCT ||--o{ LINE-ITEM : "appears in"
    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date placed_at
        int customer_id FK
    }
    LINE-ITEM {
        int quantity
        float price
        int order_id FK
        int product_id FK
    }
    PRODUCT {
        int id PK
        string name
        float unit_price
    }
```

## Direction
```
---
config:
  er:
    layoutDirection: LR
---
erDiagram
    ...
```

Options: `TB` (default), `LR`, `BT`, `RL`
