# @vue-stately/calendar

`@vue-stately/calendar` ports the upstream `@react-stately/calendar` state primitives for single-date and range calendar navigation/selection.

## API

- `useCalendarState`
- `useRangeCalendarState`

## Interface

Both hooks expose state objects used by `@vue-aria/calendar`:

- Focus navigation (`focusNextDay`, `focusPreviousRow`, `focusNextPage`, section navigation)
- Selection APIs (`selectDate`, `selectFocusedDate`)
- Visibility and disabled/unavailable helpers (`visibleRange`, `isCellDisabled`, `isCellUnavailable`)
- Range-only APIs (`anchorDate`, `highlightedRange`, `setDragging`, `allowsNonContiguousRanges`)

## Example

See `/docs/packages/calendar.md` for full `useCalendar` and `useRangeCalendar` compositions.

### `useCalendarState`

```ts
import { CalendarDate, createCalendar } from "@internationalized/date";
import { useCalendarState } from "@vue-stately/calendar";

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

### `useRangeCalendarState`

```ts
import { CalendarDate, createCalendar } from "@internationalized/date";
import { useRangeCalendarState } from "@vue-stately/calendar";

const state = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  defaultFocusedValue: new CalendarDate(2024, 5, 10),
  visibleDuration: { weeks: 2 },
});

state.selectDate(new CalendarDate(2024, 5, 10));
state.selectDate(new CalendarDate(2024, 5, 14));
```

### Controlled Values

`useCalendarState` accepts controlled `value` + `onChange`. `useRangeCalendarState` accepts controlled `{ start, end }` values and preserves date-value object types.

```ts
const dateState = useCalendarState({
  locale: "en-US",
  createCalendar,
  value: new CalendarDate(2024, 2, 10),
  onChange: (next) => {
    // controlled date updates
  },
});

const rangeState = useRangeCalendarState({
  locale: "en-US",
  createCalendar,
  value: {
    start: new CalendarDate(2024, 2, 10),
    end: new CalendarDate(2024, 2, 14),
  },
  onChange: (nextRange) => {
    // controlled range updates
  },
});
```

## Notes

- State package is non-visual; no base CSS parity assets are required.
- Current package status: in progress.
- `Spectrum S2` is out of scope unless explicitly requested.
