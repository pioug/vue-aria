# @vue-aria/datepicker

`@vue-aria/datepicker` ports upstream `@react-aria/datepicker` behavior and accessibility hooks for date picker, date range picker, and segmented date/time fields.

## Implemented modules

- `useDatePicker`
- `useDateRangePicker`
- `useDateField`
- `useTimeField`
- `useDateSegment`
- `useDatePickerGroup`
- `useDisplayNames`

## useDatePicker example

```ts
import { useDatePicker } from "@vue-aria/datepicker";
import { useDatePickerState } from "@vue-stately/datepicker";

const state = useDatePickerState({});
const rootRef = { current: null as HTMLElement | null };

const aria = useDatePicker(
  {
    "aria-label": "Event date",
  },
  state,
  rootRef
);
```

## useDateRangePicker example

```ts
import { useDateRangePicker } from "@vue-aria/datepicker";
import { useDateRangePickerState } from "@vue-stately/datepicker";

const state = useDateRangePickerState({});
const rootRef = { current: null as HTMLElement | null };

const aria = useDateRangePicker(
  {
    "aria-label": "Travel dates",
  },
  state,
  rootRef
);
```

## useDateField and useDateSegment example

```ts
import { createCalendar } from "@internationalized/date";
import { useDateFieldState } from "@vue-stately/datepicker";
import { useDateField, useDateSegment } from "@vue-aria/datepicker";

const state = useDateFieldState({
  locale: "en-US",
  createCalendar,
});

const fieldRef = { current: null as HTMLElement | null };
const inputRef = { value: null as HTMLInputElement | null };
const fieldAria = useDateField(
  {
    "aria-label": "Date",
    inputRef,
  },
  state,
  fieldRef
);

const segmentRef = { current: null as HTMLElement | null };
const firstEditableSegment = state.segments.find((segment) => segment.isEditable)!;
const segmentAria = useDateSegment(firstEditableSegment, state, segmentRef);
```

## Notes

- Current package status: in progress (core hook surface ported).
- Locale strings are copied from upstream `@react-aria/datepicker/intl`.
- `Spectrum S2` is out of scope unless explicitly requested.
