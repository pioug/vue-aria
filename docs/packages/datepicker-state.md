# @vue-aria/datepicker-state

`@vue-aria/datepicker-state` ports upstream `@react-stately/datepicker` state hooks for picker, field, and range flows.

## Implemented modules

- `useDatePickerState`
- `useDateFieldState`
- `useDateRangePickerState`
- `useTimeFieldState`
- internal helpers: `IncompleteDate`, `placeholders`
- shared formatter/validation helpers from `utils.ts`

## useDatePickerState example

```ts
import { CalendarDate } from "@internationalized/date";
import { useDatePickerState } from "@vue-aria/datepicker-state";

const state = useDatePickerState({
  granularity: "minute",
  shouldCloseOnSelect: false,
});

state.setDateValue(new CalendarDate(2024, 7, 4));
state.setTimeValue({ hour: 9, minute: 30 } as any);
```

## useDateRangePickerState example

```ts
import { CalendarDate } from "@internationalized/date";
import { useDateRangePickerState } from "@vue-aria/datepicker-state";

const state = useDateRangePickerState({
  granularity: "day",
});

state.setDateRange({
  start: new CalendarDate(2024, 8, 10),
  end: new CalendarDate(2024, 8, 12),
});
```

## useDateFieldState example

```ts
import { createCalendar } from "@internationalized/date";
import { useDateFieldState } from "@vue-aria/datepicker-state";

const state = useDateFieldState({
  locale: "en-US",
  createCalendar,
});

state.setSegment("month", 7);
state.setSegment("day", 4);
state.setSegment("year", 2025);
```

## useTimeFieldState example

```ts
import { useTimeFieldState } from "@vue-aria/datepicker-state";

const state = useTimeFieldState({
  locale: "en-US",
  granularity: "minute",
});

state.setSegment("hour", 9);
state.setSegment("minute", 30);
```

## Notes

- Current package status: in progress (all upstream stately hooks are now ported).
- Remaining closeout is focused on additional parity scenarios and downstream datepicker integration.
- `Spectrum S2` is out of scope unless explicitly requested.
