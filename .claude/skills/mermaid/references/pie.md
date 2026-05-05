# Pie Chart Syntax Reference

## Basic Structure
```
pie
    title Chart Title
    "Label A" : 40
    "Label B" : 30
    "Label C" : 20
    "Label D" : 10
```

Values must be **positive numbers greater than zero**. They don't need to sum to 100.

## Show Data Values
```
pie showData
    title Browser Share
    "Chrome" : 65.2
    "Safari" : 18.8
    "Firefox" : 4.1
    "Edge" : 3.9
    "Other" : 8.0
```

## Label Position
```
%%{init: {'pie': {'textPosition': 0.5}}}%%
pie
    "A" : 50
    "B" : 50
```

`textPosition` ranges from `0.0` (center) to `1.0` (outer edge). Default is `0.75`.

## With Theme
```
%%{init: {'theme': 'base', 'themeVariables': {'pie1': '#ff6b6b', 'pie2': '#ffd93d', 'pie3': '#6bcb77', 'pie4': '#4d96ff'}}}%%
pie
    title Distribution
    "Category A" : 35
    "Category B" : 25
    "Category C" : 25
    "Category D" : 15
```

Pie slice color variables: `pie1` through `pie12`.

## Notes
- No negative values allowed
- Labels must be in quotes
- Values are relative (auto-normalized to 100%)
- Up to two decimal places supported
