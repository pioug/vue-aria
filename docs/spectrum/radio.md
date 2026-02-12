# @vue-spectrum/radio

Vue port of `@react-spectrum/radio`.

> Status: complete parity baseline for component behavior, tests, and docs.

<script setup lang="ts">
import { Flex, Radio, RadioGroup } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-200" class="spectrum-preview-panel">
    <RadioGroup label="Favorite pet" defaultValue="cats">
      <Radio value="dogs">Dogs</Radio>
      <Radio value="cats">Cats</Radio>
      <Radio value="dragons">Dragons</Radio>
    </RadioGroup>

    <RadioGroup label="Delivery speed" orientation="horizontal">
      <Radio value="standard">Standard</Radio>
      <Radio value="express">Express</Radio>
      <Radio value="overnight" :isDisabled="true">Overnight</Radio>
    </RadioGroup>
  </Flex>
</div>

## Exports

- `Radio`
- `RadioGroup`

## Example

```vue
<script setup lang="ts">
import { Radio, RadioGroup } from "@vue-spectrum/radio";
</script>

<template>
  <Radio />
</template>
```

## Notes

- Supports controlled and uncontrolled selection with `value`/`defaultValue`.
- Supports `isDisabled`, `isReadOnly`, `isRequired`, and invalid-state semantics on `RadioGroup`.
- Supports orientation (`vertical`/`horizontal`) and ARIA labeling props on both group and items.
