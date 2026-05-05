# State Diagram Syntax Reference

## Basic Structure
```
stateDiagram-v2
    [*] --> StateA
    StateA --> StateB : Event
    StateB --> [*]
```

`[*]` is the start/end state.

## State Definitions
```
stateDiagram-v2
    state "Long description" as A
    A --> B
```

## Transitions with Labels
```
stateDiagram-v2
    Idle --> Running : Start
    Running --> Idle : Stop
    Running --> Error : Fail
    Error --> Idle : Reset
```

## Composite States (Nested)
```
stateDiagram-v2
    [*] --> Active
    state Active {
        [*] --> Waiting
        Waiting --> Processing : Request
        Processing --> Waiting : Done
    }
    Active --> Closed : Shutdown
```

## Concurrency
```
stateDiagram-v2
    state Running {
        [*] --> Heating
        Heating --> Cooling
        --
        [*] --> Spinning
        Spinning --> [*]
    }
```

## Choice (Fork/Join)
```
stateDiagram-v2
    state fork <<fork>>
    state join <<join>>
    [*] --> fork
    fork --> A
    fork --> B
    A --> join
    B --> join
    join --> [*]
```

## Notes
```
stateDiagram-v2
    A --> B
    note right of A : This is a note
    note left of B
        Multi-line
        note here
    end note
```

## Direction
```
stateDiagram-v2
    direction LR
    A --> B --> C
```

## Common Pattern
```
stateDiagram-v2
    [*] --> Draft
    Draft --> Review : Submit
    Review --> Draft : Revise
    Review --> Approved : Approve
    Review --> Rejected : Reject
    Approved --> Published : Publish
    Rejected --> [*]
    Published --> [*]
```
