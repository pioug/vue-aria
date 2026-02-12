# @vue-spectrum/avatar

Vue port of `@react-spectrum/avatar`.

<script setup lang="ts">
import { Avatar, Flex } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="row" gap="size-100" align-items="center" class="spectrum-preview-panel">
    <Avatar src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" alt="GitHub avatar" size="64px" />
    <Avatar src="https://avatars.githubusercontent.com/u/82592?s=200&v=4" alt="Vue avatar" isDisabled size={56} />
  </Flex>
</div>

## Exports

- `Avatar`

## Example

```vue
<script setup lang="ts">
import { Avatar } from "@vue-spectrum/avatar";
</script>

<template>
  <Avatar />
</template>
```

## Notes

- Supports size tokens, CSS sizes, or numbers (`size` applies to both width and height).
- Supports style props (for example `isHidden`) and DOM props (`data-*`, `aria-*`).
- Adds `is-disabled` class when `isDisabled` is true.
