# @vue-spectrum/buttongroup

Vue port of `@react-spectrum/buttongroup`.

> Status: complete parity baseline for component behavior, tests, and docs.

<script setup lang="ts">
import { Button, ButtonGroup, Flex } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-200" class="spectrum-preview-panel">
    <ButtonGroup>
      <Button variant="primary">Rate now</Button>
      <Button variant="secondary">No thanks</Button>
      <Button variant="secondary">Remind me later</Button>
    </ButtonGroup>

    <ButtonGroup orientation="vertical" align="end">
      <Button variant="secondary">No thanks</Button>
      <Button variant="secondary">Remind me later</Button>
      <Button variant="primary">Rate now</Button>
    </ButtonGroup>
  </Flex>
</div>

## Exports

- `ButtonGroup`

## Example

```vue
<script setup lang="ts">
import { Button, ButtonGroup } from "@vue-spectrum/buttongroup";
</script>

<template>
  <Button />
</template>
```

## Notes

- Supports `orientation` (`horizontal`/`vertical`) and `align` (`start`/`center`/`end`).
- Automatically falls back to vertical layout when horizontal children overflow available width.
- Propagates `isDisabled` to child buttons using provider context, matching React Spectrum behavior.
