# @vue-spectrum/statuslight

Vue port of `@react-spectrum/statuslight`.

<script setup lang="ts">
import { StatusLight, Flex, Text } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-100" class="spectrum-preview-panel">
    <StatusLight variant="positive" role="status" aria-label="Build successful">
      Build successful
    </StatusLight>
    <StatusLight variant="notice" role="status" aria-label="Sync in progress">
      Sync in progress
    </StatusLight>
    <StatusLight variant="negative" role="status" aria-label="Deployment failed">
      Deployment failed
    </StatusLight>
    <Text class="spectrum-preview-muted">
      Status lights support semantic and spectrum color variants.
    </Text>
  </Flex>
</div>

## Exports

- `StatusLight`

## Example

```vue
<script setup lang="ts">
import { StatusLight } from "@vue-spectrum/statuslight";
</script>

<template>
  <StatusLight />
</template>
```

## Notes

- Supports variants: `positive`, `negative`, `notice`, `info`, `neutral`, and Spectrum color variants (`celery`, `chartreuse`, `yellow`, `magenta`, `fuchsia`, `purple`, `indigo`, `seafoam`).
- If there are no children, provide `aria-label`.
- If a label is provided (`aria-label`/`aria-labelledby`), set `role="status"`.
