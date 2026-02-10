# @vue-spectrum/datepicker

Vue port baseline of `@react-spectrum/datepicker`.

<script setup lang="ts">
import { ref } from "vue";
import { parseDate, parseTime, type DateValue } from "@internationalized/date";
import {
  DateField,
  TimeField,
  DatePicker,
  DateRangePicker,
} from "@vue-spectrum/vue-spectrum";

const dateFieldValue = ref("2019-06-05");
const timeFieldValue = ref("14:30:00");
const datePickerValue = ref("2019-06-05");
const dateRangeValue = ref("none");
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px;">
    <DateField
      label="Date field"
      :defaultValue="parseDate('2019-06-05')"
      :onChange="(value: DateValue | null) => (dateFieldValue = value?.toString() ?? 'none')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      date field -> {{ dateFieldValue }}
    </p>

    <TimeField
      label="Time field"
      :granularity="'second'"
      :defaultValue="parseTime('14:30:00')"
      :onChange="(value) => (timeFieldValue = value?.toString?.() ?? 'none')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      time field -> {{ timeFieldValue }}
    </p>

    <DatePicker
      label="Date picker"
      :defaultValue="parseDate('2019-06-05')"
      :onChange="(value: DateValue | null) => (datePickerValue = value?.toString() ?? 'none')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      date picker -> {{ datePickerValue }}
    </p>

    <DateRangePicker
      label="Date range picker"
      :onChange="(value) => (dateRangeValue = value ? `${value.start?.toString() ?? 'none'} -> ${value.end?.toString() ?? 'none'}` : 'none')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      date range picker -> {{ dateRangeValue }}
    </p>
  </div>
</div>

## Exports

- `DateField`
- `TimeField`
- `DatePicker`
- `DateRangePicker`

## Example

```ts
import { h } from "vue";
import { parseDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";

const component = h(DatePicker, {
  label: "Date",
  defaultValue: parseDate("2019-06-05"),
  onChange: (value) => {
    console.log("next date", value?.toString());
  },
});
```

## Notes

- Baseline includes native-input-backed `DateField` and `TimeField` plus popover-based `DatePicker` and `DateRangePicker` composed with `@vue-spectrum/calendar`.
- Keyboard and screen-reader semantics are wired via `@vue-aria/datepicker` and `@vue-aria/datepicker-state`.
- Advanced parity still pending: segmented-field rendering, full range time support, and full Spectrum visual/theming alignment.
