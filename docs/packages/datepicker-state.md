# @vue-aria/datepicker-state

`@vue-aria/datepicker-state` ports upstream `@react-stately/datepicker` picker state for single-date and range-date popover flows.

## Implemented modules

- `useDatePickerState`
- `useDateRangePickerState`
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

## Notes

- Current package status: in progress (date-picker and date-range-picker state core).
- Date field/time field state modules remain to be ported.
- `Spectrum S2` is out of scope unless explicitly requested.
