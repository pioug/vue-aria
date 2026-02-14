# @vue-aria/calendar

`@vue-aria/calendar` ports the upstream `@react-aria/calendar` behavior layer for calendar, range-calendar, grid, and cell accessibility.

## Implemented modules

- `useCalendar`
- `useRangeCalendar`
- `useCalendarGrid`
- `useCalendarCell`

## Single-date calendar example

```ts
import { createCalendar } from "@internationalized/date";
import { useCalendarState } from "@vue-aria/calendar-state";
import { useCalendar, useCalendarGrid, useCalendarCell } from "@vue-aria/calendar";

const state = useCalendarState({
  locale: "en-US",
  createCalendar,
  visibleDuration: { months: 1 },
});

const rootRef = { current: null as HTMLElement | null };
const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(
  { "aria-label": "Event date" },
  state
);

const { gridProps, headerProps, weekDays, weeksInMonth } = useCalendarGrid({}, state);
const cellRef = { current: null as HTMLElement | null };
const cellDate = state.getDatesInWeek(0)[0]!;
const cell = useCalendarCell({ date: cellDate }, state, cellRef);
```

## Range calendar example

```ts
import { createCalendar } from "@internationalized/date";
import { useRangeCalendarState } from "@vue-aria/calendar-state";
import { useRangeCalendar } from "@vue-aria/calendar";

const state = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  visibleDuration: { months: 2 },
});

const rootRef = { current: null as HTMLElement | null };
const { calendarProps, prevButtonProps, nextButtonProps, title } = useRangeCalendar(
  { "aria-label": "Trip dates" },
  state,
  rootRef
);
```

## Notes

- Current package status: in progress (core behavior/accessibility slice).
- Locale strings are copied from upstream `@react-aria/calendar/intl`.
- `Spectrum S2` is out of scope unless explicitly requested.
