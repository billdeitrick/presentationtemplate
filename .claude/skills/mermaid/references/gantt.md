# Gantt Chart Syntax Reference

## Basic Structure
```
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
        Task A    : 2024-01-01, 7d
        Task B    : 2024-01-08, 5d
    section Phase 2
        Task C    : 2024-01-13, 10d
```

## Date Formats
```
dateFormat YYYY-MM-DD    # Default
dateFormat DD/MM/YYYY
dateFormat MM/DD/YYYY
```

## Axis Format (display)
```
axisFormat %Y-%m-%d
axisFormat %b %d         # Jan 01
axisFormat %d %b %Y      # 01 Jan 2024
```

## Task Syntax
```
section Name
    Task name    : [modifiers,] [id,] startDate, duration
    Task name    : [modifiers,] [id,] after taskId, duration
```

Durations: `1d`, `2w`, `3h`

## Task Modifiers
```
done     : completed task (gray fill)
active   : in-progress task (blue fill)
crit     : critical path (red)
milestone: milestone marker (diamond)
```

Can be combined:
```
Task : done, crit, t1, 2024-01-01, 3d
```

## Task IDs and Dependencies
```
gantt
    dateFormat YYYY-MM-DD
    Design    : done, des, 2024-01-01, 5d
    Build     : bld, after des, 10d
    Test      : tst, after bld, 5d
    Deploy    : after tst, 2d
```

## Milestones
```
Launch    : milestone, 2024-03-01, 0d
```

## Excluding Days
```
excludes weekends
excludes 2024-12-25
```

## Full Example
```
gantt
    title Q1 Roadmap
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Design
        Research         : done, 2024-01-01, 7d
        Wireframes       : done, 2024-01-08, 5d
        Design review    : milestone, 2024-01-13, 0d

    section Development
        Backend API      : active, be, 2024-01-14, 14d
        Frontend         : fe, after be, 10d
        Integration      : after fe, 5d

    section Launch
        QA Testing       : crit, 2024-02-18, 7d
        Deploy           : crit, 2024-02-25, 2d
        Launch           : milestone, 2024-02-27, 0d
```
