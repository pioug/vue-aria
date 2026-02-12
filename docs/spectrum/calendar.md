# @vue-spectrum/calendar

Vue port baseline of `@react-spectrum/calendar`.

<script setup lang="ts">
import { ref } from "vue";
import { parseDate, type DateValue } from "@internationalized/date";
import { Calendar, RangeCalendar } from "@vue-spectrum/vue-spectrum";

const selectedDate = ref<string>("2019-06-05");
const selectedRange = ref<string>("none");
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px;">
    <Calendar
      label="Single date"
      :defaultValue="parseDate('2019-06-05')"
      :onChange="(value: DateValue | null) => (selectedDate = value?.toString() ?? 'none')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      selected date -> {{ selectedDate }}
    </p>
    <RangeCalendar
      label="Date range"
      :onChange="(value) => (selectedRange = value ? `${value.start.toString()} -> ${value.end.toString()}` : 'none')" />
    <p style="margin: 0; font-size: 13px; color: #334155;">
      selected range -> {{ selectedRange }}
    </p>
  </div>
</div>

## Exports

- `Calendar`
- `RangeCalendar`

## Example

```ts
import { h } from "vue";
import { parseDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";

const component = h(Calendar, {
  label: "Choose a date",
  defaultValue: parseDate("2019-06-05"),
  onChange: (value) => {
    console.log("next date", value?.toString());
  },
});
```

## Notes

- Baseline includes single-date and range-date calendar primitives with keyboard/click date selection behavior driven by `@vue-aria/calendar` and `@vue-aria/calendar-state`, including locale-aware fallback aria-labels when no visible label is provided.
- Prev/next month paging, selected-cell semantics, invalid/unavailable date constraints, and SSR rendering are included.
- Baseline test coverage includes upstream-style `CalendarBase` and `RangeCalendar` files in addition to package-level calendar and SSR suites.
- Advanced visual/theming parity, multi-month layout polish, and deeper locale formatting parity remain in progress.
