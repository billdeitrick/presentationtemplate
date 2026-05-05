# Sequence Diagram Syntax Reference

## Basic Structure
```
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Message
    B-->>A: Response
```

## Participant Types
```
participant A          # Box (default)
actor B                # Stick figure
participant C as Carol # Custom label
```

## Arrow Types
```
A->B    # Solid line, no arrowhead
A-->B   # Dotted line, no arrowhead
A->>B   # Solid line, arrowhead
A-->>B  # Dotted line, arrowhead
A-xB    # Solid line, cross end
A--xB   # Dotted line, cross end
A-)B    # Solid line, open arrowhead
A--)B   # Dotted line, open arrowhead
```

## Activation Bars
```
sequenceDiagram
    A->>+B: Request
    B-->>-A: Response
```

Or explicitly:
```
activate B
deactivate B
```

## Notes
```
Note right of A: Text here
Note left of B: Text here
Note over A,B: Spans both
```

## Loops
```
loop Every second
    A->>B: Heartbeat
end
```

## Conditionals
```
alt Happy path
    A->>B: Success
else Error case
    A->>B: Failure
end

opt Optional step
    A->>B: Maybe
end
```

## Parallel
```
par Action 1
    A->>B: Do X
and Action 2
    A->>C: Do Y
end
```

## Break
```
break On error
    A->>B: Abort
end
```

## Background Highlighting
```
rect rgb(191, 223, 255)
    A->>B: Highlighted section
end
```

## Auto-numbering
```
sequenceDiagram
    autonumber
    A->>B: First
    B-->>A: Second
```

## Actor Creation/Destruction
```
sequenceDiagram
    A->>create participant B
    B->>A: Created
    A->>destroy B
    B->>A: Destroyed
```

## Common Patterns

### Request/Response
```
sequenceDiagram
    actor User
    participant API
    participant DB

    User->>+API: POST /login
    API->>+DB: SELECT user
    DB-->>-API: user record
    API-->>-User: 200 OK + token
```

### Async with callbacks
```
sequenceDiagram
    Client->>+Server: Request (async)
    Server-->>Client: 202 Accepted
    Note right of Server: Processing...
    Server->>Client: Webhook callback
```
