# @vue-spectrum/switch

Vue port of `@react-spectrum/switch`.

> Status: complete parity baseline for component behavior, tests, and docs.

<script setup lang="ts">
import { Flex, Switch } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-200" class="spectrum-preview-panel">
    <Switch defaultSelected>Enable notifications</Switch>
    <Switch :isEmphasized="true">Sync over cellular</Switch>
    <Switch :isDisabled="true">Background refresh</Switch>
  </Flex>
</div>

## Exports

- `Switch`

## Example

```vue
<script setup lang="ts">
import { Switch } from "@vue-spectrum/switch";
</script>

<template>
  <Switch />
</template>
```

## Notes

- Supports controlled and uncontrolled modes with `isSelected`/`defaultSelected`.
- Supports `isDisabled`, `isReadOnly`, and `excludeFromTabOrder`.
- Forwards ARIA labeling (`aria-label`, `aria-labelledby`, `aria-describedby`) to the switch input element.
