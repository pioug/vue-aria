# @vue-aria/datepicker-state

State management for date picker value selection and popover open behavior.

## `useDatePickerState`

Provides:

- controlled/uncontrolled value support
- date + time partial selection flow (`dateValue` / `timeValue`)
- automatic close-on-select behavior with configurable strategy
- basic invalid-state derivation from bounds and unavailable dates

```ts
import { parseDate, parseTime } from "@internationalized/date";
import { useDatePickerState } from "@vue-aria/datepicker-state";

const state = useDatePickerState({
  granularity: "minute",
  shouldCloseOnSelect: false,
});

state.setDateValue(parseDate("2026-02-08"));
state.setTimeValue(parseTime("10:30:00"));
```
