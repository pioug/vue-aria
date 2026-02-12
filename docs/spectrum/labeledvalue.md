# @vue-spectrum/labeledvalue

Vue port of `@react-spectrum/labeledvalue`.

<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { Flex, LabeledValue, Text } from "@vue-spectrum/vue-spectrum";

const range = { start: 10, end: 20 };
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-150" class="spectrum-preview-panel">
    <LabeledValue label="Environment" value="Production" />
    <LabeledValue label="Date created" :value="new CalendarDate(2024, 9, 5)" />
    <LabeledValue label="Capacity range" :value="range" />
    <Text class="spectrum-preview-muted">LabeledValue formats dates, numbers, ranges, and lists with locale-aware output.</Text>
  </Flex>
</div>

## Exports

- `LabeledValue`

## Example

```vue
<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { LabeledValue } from "@vue-spectrum/labeledvalue";
</script>

<template>
  <CalendarDate />
</template>
```

## Notes

- Uses `@vue-spectrum/label` `Field` wrapper parity to align labeling and layout behavior.
- Supports value types: `string`, `string[]`, `number`, number/date ranges, `Date` and internationalized date objects, and VNode values.
- Throws when editable elements are passed as `value` (`input`, `textarea`, or `contenteditable` descendants), matching upstream behavior.
