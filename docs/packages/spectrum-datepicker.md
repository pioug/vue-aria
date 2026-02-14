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

## Selection Close Behavior Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";

const keepOpenOnSelect = () => false;
</script>

<template>
  <DatePicker
    aria-label="Meeting date"
    :default-value="new CalendarDate(2019, 6, 5)"
    :should-close-on-select="keepOpenOnSelect"
  />

  <DateRangePicker
    aria-label="Trip dates"
    :placeholder-value="new CalendarDate(2019, 6, 10)"
    :should-close-on-select="keepOpenOnSelect"
  />
</template>
```

## Provider Inheritance Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
import { DatePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <Provider :theme="theme" :is-disabled="true" :is-quiet="true">
    <DatePicker
      aria-label="Meeting date"
      :default-value="new CalendarDate(2019, 6, 5)"
    />
  </Provider>
</template>
```

## Focus Callback Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";

const isFocused = ref(false);
const onFocusChange = (nextFocused: boolean) => {
  isFocused.value = nextFocused;
};
</script>

<template>
  <DatePicker
    aria-label="Meeting date"
    :default-value="new CalendarDate(2019, 6, 5)"
    :on-focus-change="onFocusChange"
  />

  <p>Focused: {{ isFocused }}</p>
</template>
```

## Keyboard Callback Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";

const onKeyDown = (event: KeyboardEvent) => {
  console.log("keydown", event.key);
};

const onKeyUp = (event: KeyboardEvent) => {
  console.log("keyup", event.key);
};
</script>

<template>
  <DatePicker
    aria-label="Meeting date"
    :default-value="new CalendarDate(2019, 6, 5)"
    :on-key-down="onKeyDown"
    :on-key-up="onKeyUp"
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

## Validation Callback Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";

const errorMessage = () => "Choose a valid date from callback";
</script>

<template>
  <DatePicker
    aria-label="Booking date"
    :default-value="new CalendarDate(2019, 6, 5)"
    validation-state="invalid"
    :error-message="errorMessage"
  />
</template>
```

## Time Granularity Example

```vue
<script setup lang="ts">
import { CalendarDateTime } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Meeting date and time"
    :default-value="new CalendarDateTime(2019, 6, 5, 9, 30)"
    granularity="minute"
    :hour-cycle="24"
    :hide-time-zone="false"
    :should-force-leading-zeros="true"
  />
</template>
```

## Validation Behavior Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Booking date"
    :default-value="new CalendarDate(2019, 6, 5)"
    :is-required="true"
    validation-behavior="aria"
  />
</template>
```

## Native Validation Behavior Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "@vue-spectrum/datepicker";

const validateDate = () => "Date failed native validation";
</script>

<template>
  <DatePicker
    aria-label="Booking date"
    :default-value="new CalendarDate(2019, 6, 5)"
    validation-behavior="native"
    :validate="validateDate"
  />
</template>
```

## Custom Validate Callback Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";

const validateDate = (value: CalendarDate | null) => {
  if (value?.day === 13) {
    return "The 13th is unavailable";
  }

  return true;
};

const validateRange = () => "Range failed custom validation";
</script>

<template>
  <DatePicker
    aria-label="Booking date"
    :default-value="new CalendarDate(2019, 6, 13)"
    :validate="validateDate"
  />

  <DateRangePicker
    aria-label="Booking range"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
    :validate="validateRange"
  />
</template>
```

## Help Text Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Event date"
    :default-value="new CalendarDate(2019, 6, 5)"
    description="Choose the event date."
  />

  <DateRangePicker
    aria-label="Trip dates"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
    description="Choose your departure and return dates."
  />
</template>
```

## Required Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Start date"
    :default-value="new CalendarDate(2019, 6, 5)"
    :is-required="true"
  />

  <DateRangePicker
    aria-label="Trip dates"
    :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
    :is-required="true"
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

## Form Integration Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <form id="booking-form">
    <DatePicker
      aria-label="Check-in date"
      :default-value="new CalendarDate(2019, 6, 5)"
      name="checkIn"
      form="booking-form"
    />

    <DateRangePicker
      aria-label="Trip range"
      :default-value="{ start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 8) }"
      start-name="tripStart"
      end-name="tripEnd"
      form="booking-form"
    />
  </form>
</template>
```

## Non-Contiguous Range Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DateRangePicker
    aria-label="Travel range"
    :placeholder-value="new CalendarDate(2019, 6, 10)"
    :is-date-unavailable="(date) => date.day === 12"
    :allows-non-contiguous-ranges="true"
  />
</template>
```

## Placeholder Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Publish date"
    placeholder="Pick a day"
    :placeholder-value="new CalendarDate(2019, 6, 5)"
  />

  <DateRangePicker
    aria-label="Promotion window"
    placeholder="Pick a range"
    :placeholder-value="new CalendarDate(2019, 6, 10)"
  />
</template>
```

## Availability and Bounds Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "@vue-spectrum/datepicker";
</script>

<template>
  <DatePicker
    aria-label="Delivery date"
    :default-value="new CalendarDate(2019, 6, 15)"
    :min-value="new CalendarDate(2019, 6, 10)"
    :max-value="new CalendarDate(2019, 6, 20)"
    :is-date-unavailable="(date) => date.day === 17"
  />

  <DateRangePicker
    aria-label="Travel range"
    :placeholder-value="new CalendarDate(2019, 6, 10)"
    :min-value="new CalendarDate(2019, 6, 10)"
    :max-value="new CalendarDate(2019, 6, 20)"
    :is-date-unavailable="(date) => date.day === 12"
  />
</template>
```

## Key Props

- Shared: `isOpen` / `defaultOpen`, `onOpenChange`, `onFocus`, `onBlur`, `onFocusChange`, `onKeyDown`, `onKeyUp`, `isDisabled`, `isReadOnly`, `isRequired`, `isQuiet`, `isInvalid`, `validationState`, `validationBehavior`, `validate`, `description`, `errorMessage`, `minValue`, `maxValue`, `isDateUnavailable`, `firstDayOfWeek`, `pageBehavior`, `visibleMonths`, `granularity`, `hideTimeZone`, `hourCycle`, `shouldForceLeadingZeros`, `shouldCloseOnSelect`, `placeholderValue`, `autoFocus`.
- `DatePicker`: `value` / `defaultValue`, `onChange`, `name`, `form`.
- `DateRangePicker`: range `value` / `defaultValue`, `onChange`, `startName`, `endName`, `allowsNonContiguousRanges`.
- Keyboard interaction: `Alt+ArrowDown` or `Alt+ArrowUp` on the picker group opens the popover for both variants (shortcuts are ignored when disabled or read-only).
- Validation note: `errorMessage` accepts either a static string or a callback function.
- Validation behavior note: in `validationBehavior="native"` mode, custom `validate` errors display after commit/select interactions.
- Callback note: keyboard callbacks and keyboard-open shortcuts are suppressed while pickers are disabled or read-only.
