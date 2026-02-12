# @vue-aria/calendar

Calendar accessibility primitives.

## `useCalendarBase`

Shared calendar container semantics including visible-range title and previous/next paging button props.

## `useCalendar`

Single-date calendar wrapper around `useCalendarBase`.

## `useRangeCalendar`

Range calendar wrapper with drag/blur helpers for range-selection workflows.

## `useCalendarCell`

Grid cell semantics and press/focus behavior for individual date cells.

```ts
import {
  useCalendar,
  useRangeCalendar,
  useCalendarBase,
  useCalendarCell,
} from "@vue-aria/calendar";
```

### Behavior

- Exposes application role and visible-range labeling for calendar groups.
- Provides previous/next paging button semantics with disabled-state wiring and locale-aware paging aria labels.
- Supports range-calendar blur/touch/pointer stop-drag behavior.
- Provides gridcell/button semantics with selection, focus, invalid, and unavailable flags.
