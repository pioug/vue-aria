# @vue-spectrum/calendar - Calendar / RangeCalendar

`Calendar` and `RangeCalendar` provide Spectrum-style date and date-range selection UIs.

## Calendar Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";
</script>

<template>
  <Calendar
    aria-label="Event date"
    :default-value="new CalendarDate(2019, 6, 5)"
  />
</template>
```

## RangeCalendar Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { RangeCalendar } from "@vue-spectrum/calendar";
</script>

<template>
  <RangeCalendar
    aria-label="Trip dates"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
  />
</template>
```

## Multi-Month View

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";
</script>

<template>
  <Calendar
    aria-label="Project timeline"
    :default-value="new CalendarDate(2019, 6, 5)"
    :visible-months="2"
  />
</template>
```

## Single-Page Multi-Month Navigation

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";
</script>

<template>
  <Calendar
    aria-label="Roadmap timeline"
    :default-value="new CalendarDate(2019, 6, 5)"
    :visible-months="2"
    page-behavior="single"
  />
</template>
```

## Single-Page Range Navigation

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { RangeCalendar } from "@vue-spectrum/calendar";
</script>

<template>
  <RangeCalendar
    aria-label="Quarter planning"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
    :visible-months="2"
    page-behavior="single"
  />
</template>
```

## End-Aligned Multi-Month Selection

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";
</script>

<template>
  <Calendar
    aria-label="Release planning"
    :default-value="new CalendarDate(2019, 6, 5)"
    :visible-months="2"
    selection-alignment="end"
  />
</template>
```

## Validation Message Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";
</script>

<template>
  <Calendar
    aria-label="Booking date"
    :default-value="new CalendarDate(2019, 6, 5)"
    error-message="Please choose a valid date."
    validation-state="invalid"
  />
</template>
```

## Date Availability Constraints

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";
</script>

<template>
  <Calendar
    aria-label="Delivery date"
    :default-value="new CalendarDate(2019, 6, 15)"
    :min-value="new CalendarDate(2019, 6, 10)"
    :max-value="new CalendarDate(2019, 6, 20)"
    :is-date-unavailable="(date) => date.day === 17"
  />
</template>
```

## Controlled Calendar Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";

const value = ref(new CalendarDate(2019, 6, 5));
const setValue = (nextValue: CalendarDate | null) => {
  if (nextValue) {
    value.value = nextValue;
  }
};
</script>

<template>
  <Calendar
    aria-label="Controlled date"
    :value="value"
    :on-change="setValue"
  />
</template>
```

## Controlled Focus Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import { Calendar } from "@vue-spectrum/calendar";

const value = ref(new CalendarDate(2019, 6, 5));
const focusedValue = ref(new CalendarDate(2019, 6, 5));

const onChange = (nextValue: CalendarDate | null) => {
  if (nextValue) {
    value.value = nextValue;
  }
};

const onFocusChange = (nextFocused: CalendarDate) => {
  focusedValue.value = nextFocused;
};
</script>

<template>
  <Calendar
    aria-label="Focused planning date"
    :value="value"
    :focused-value="focusedValue"
    :on-change="onChange"
    :on-focus-change="onFocusChange"
  />
</template>
```

## Controlled RangeCalendar Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import { RangeCalendar } from "@vue-spectrum/calendar";

const range = ref({
  start: new CalendarDate(2019, 6, 5),
  end: new CalendarDate(2019, 6, 8),
});
const setRange = (nextRange: { start: CalendarDate; end: CalendarDate } | null) => {
  if (nextRange) {
    range.value = nextRange;
  }
};
</script>

<template>
  <RangeCalendar
    aria-label="Controlled trip dates"
    :value="range"
    :on-change="setRange"
  />
</template>
```

## Non-Contiguous Range Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { RangeCalendar } from "@vue-spectrum/calendar";
</script>

<template>
  <RangeCalendar
    aria-label="Travel dates"
    :default-focused-value="new CalendarDate(2019, 6, 10)"
    :is-date-unavailable="(date) => date.day === 12"
    :allows-non-contiguous-ranges="true"
  />
</template>
```

## Range Validation Message Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { RangeCalendar } from "@vue-spectrum/calendar";
</script>

<template>
  <RangeCalendar
    aria-label="Vacation range"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
    error-message="Please choose a valid date range."
    validation-state="invalid"
  />
</template>
```

## Key Props

- Shared: `focusedValue` / `defaultFocusedValue`, `onFocusChange`, `autoFocus`, `visibleMonths`, `firstDayOfWeek`, `pageBehavior`, `selectionAlignment`, `isDisabled`, `isReadOnly`, `isInvalid`, `validationState`, `errorMessage`, `minValue`, `maxValue`, `isDateUnavailable`, `locale`, `createCalendar`.
- `Calendar`: `value` / `defaultValue`, `onChange`.
- `RangeCalendar`: range `value` / `defaultValue`, `onChange`, `allowsNonContiguousRanges`.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
