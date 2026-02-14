# @vue-spectrum/datepicker - DatePicker / DateRangePicker

`DatePicker` and `DateRangePicker` provide Spectrum-style date picking with calendar popovers.

## DatePicker Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Event date"
    :default-value="new CalendarDate(2019, 6, 5)"
  />
</template>
```

## DateRangePicker Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DateRangePicker
    aria-label="Trip dates"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
  />
</template>
```

## Controlled DatePicker Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";

const value = ref(new CalendarDate(2019, 6, 5));
const setValue = (nextValue: CalendarDate | null) => {
  if (nextValue) {
    value.value = nextValue;
  }
};
</script>

<template>
  <DatePicker
    aria-label="Controlled date"
    :value="value"
    :on-change="setValue"
  />
</template>
```

## Controlled DateRangePicker Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker } from "@vue-spectrum/datepicker";

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
  <DateRangePicker
    aria-label="Controlled range"
    :value="range"
    :on-change="setRange"
  />
</template>
```

## Controlled Open State Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";

const isOpen = ref(false);
const onOpenChange = (nextOpen: boolean) => {
  isOpen.value = nextOpen;
};
</script>

<template>
  <DatePicker
    aria-label="Meeting date"
    :default-value="new CalendarDate(2019, 6, 5)"
    :is-open="isOpen"
    :on-open-change="onOpenChange"
  />
</template>
```

## Validation Message Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Booking date"
    :default-value="new CalendarDate(2019, 6, 5)"
    validation-state="invalid"
    error-message="Choose a valid date"
  />

  <DateRangePicker
    aria-label="Booking range"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
    validation-state="invalid"
    error-message="Choose a valid range"
  />
</template>
```

## Multi-Month Overlay Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Release date"
    :default-value="new CalendarDate(2019, 6, 5)"
    :visible-months="2"
    page-behavior="single"
  />

  <DateRangePicker
    aria-label="Release window"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
    :visible-months="2"
    page-behavior="single"
  />
</template>
```

## Key Props

- Shared: `isOpen` / `defaultOpen`, `onOpenChange`, `isDisabled`, `isReadOnly`, `isRequired`, `isInvalid`, `validationState`, `errorMessage`, `minValue`, `maxValue`, `isDateUnavailable`, `firstDayOfWeek`, `pageBehavior`, `visibleMonths`, `placeholderValue`, `autoFocus`.
- `DatePicker`: `value` / `defaultValue`, `onChange`, `name`, `form`.
- `DateRangePicker`: range `value` / `defaultValue`, `onChange`, `startName`, `endName`, `allowsNonContiguousRanges`.
