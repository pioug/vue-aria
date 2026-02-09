# @vue-aria/datepicker

Date picker and range picker accessibility primitives.

## `useDatePickerGroup`

Provides shared keyboard and press behavior for date picker field groups.

## `useDateField`

Re-exported segmented date field primitive for picker field composition and standalone date fields.

## `useDateSegment`

Re-exported segment interaction primitive for editable date/time segment parts.

## `useDatePicker`

Provides label, grouped field semantics, button trigger props, dialog props, and calendar props for single-date pickers.

## `useDateRangePicker`

Provides grouped semantics for start/end date fields and range calendar trigger/dialog props.

## `useTimeField`

Wraps date field behavior for time fields and serializes hidden input value from `timeValue`.

```ts
import {
  useDateField,
  useDateSegment,
  useDatePicker,
  useDateRangePicker,
  useDatePickerGroup,
  useTimeField,
} from "@vue-aria/datepicker";
```

### Behavior

- Supports Alt+Arrow keyboard open behavior for picker groups.
- Provides date-field presentation props for picker-owned segmented fields.
- Composes selected value/range descriptions into `aria-describedby`.
- Includes private validation bridge props for start/end range field validation merging.
