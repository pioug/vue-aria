# @vue-aria/calendar-state

`@vue-aria/calendar-state` ports the upstream `@react-stately/calendar` state primitives for single-date and range calendar navigation/selection.

## Implemented modules

- `useCalendarState`
- `useRangeCalendarState`

## useCalendarState example

```ts
import { CalendarDate, createCalendar } from "@internationalized/date";
import { useCalendarState } from "@vue-aria/calendar-state";

const state = useCalendarState({
  locale: "en-US",
  createCalendar,
  defaultValue: new CalendarDate(2024, 5, 10),
  visibleDuration: { months: 1 },
  selectionAlignment: "center",
});

state.focusNextDay();
state.selectFocusedDate();
```

## useRangeCalendarState example

```ts
import { CalendarDate, createCalendar } from "@internationalized/date";
import { useRangeCalendarState } from "@vue-aria/calendar-state";

const state = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  defaultFocusedValue: new CalendarDate(2024, 5, 10),
  visibleDuration: { weeks: 2 },
});

state.selectDate(new CalendarDate(2024, 5, 10));
state.selectDate(new CalendarDate(2024, 5, 14));
```

## Notes

- Current package status: in progress (core state/navigation slice).
- `Spectrum S2` is out of scope unless explicitly requested.
