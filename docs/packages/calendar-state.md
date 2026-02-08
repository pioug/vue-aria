# @vue-aria/calendar-state

State management for single-date and range calendar selection.

## `useCalendarState`

Provides:

- controlled/uncontrolled calendar value and focused date
- visible-range pagination and section navigation helpers
- min/max invalidity checks and unavailable-date selection guards

```ts
import { parseDate } from "@internationalized/date";
import { useCalendarState } from "@vue-aria/calendar-state";

const state = useCalendarState({
  defaultValue: parseDate("2026-02-08"),
  visibleDuration: { months: 1 },
});

state.focusNextDay();
state.selectFocusedDate();
```

## `useRangeCalendarState`

Provides:

- controlled/uncontrolled range value
- anchor/highlight behavior for range selection
- optional contiguous-range enforcement around unavailable dates

```ts
import { parseDate } from "@internationalized/date";
import { useRangeCalendarState } from "@vue-aria/calendar-state";

const state = useRangeCalendarState({
  defaultFocusedValue: parseDate("2026-02-08"),
  isDateUnavailable: (date) => date.toString() === "2026-02-10",
});

state.selectDate(parseDate("2026-02-08"));
state.highlightDate(parseDate("2026-02-09"));
state.selectDate(parseDate("2026-02-09"));
```
