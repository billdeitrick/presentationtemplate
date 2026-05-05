# Timeline Syntax Reference

## Basic Structure
```
timeline
    title History of the Web
    1991 : HTML created
    1995 : JavaScript introduced
    1996 : CSS released
    2005 : AJAX popularized
    2015 : ES6 / modern JS
```

## Multiple Events Per Period
```
timeline
    2020 : Event A
         : Event B
         : Event C
    2021 : Event D
```

Or on one line with colons:
```
timeline
    2020 : Event A : Event B : Event C
```

## Sections / Ages
Group time periods under named sections. Each section gets a consistent color.

```
timeline
    title Company Milestones
    section Founding
        2018 : Company founded
             : First product launched
        2019 : Series A
    section Growth
        2020 : 100 customers
        2021 : International expansion
             : Series B
    section Scale
        2022 : 1000 customers
        2023 : IPO
```

## Disabling Multicolor
By default each period gets a unique color. To use one color scheme:
```
%%{init: {'timeline': {'disableMulticolor': true}}}%%
timeline
    2020 : Event A
    2021 : Event B
    2022 : Event C
```

## Theming
```
%%{init: {'theme': 'base', 'themeVariables': {
    'cScale0': '#ff6b6b',
    'cScale1': '#ffd93d',
    'cScale2': '#6bcb77'
}}}%%
timeline
    Period 1 : Event
    Period 2 : Event
    Period 3 : Event
```

Color scale variables: `cScale0` through `cScale11`

## Notes
- The "period" is always the first item before the first colon
- Events follow after colons
- No arrows or connections — purely chronological
- Long text wraps automatically; use `<br>` for explicit breaks
