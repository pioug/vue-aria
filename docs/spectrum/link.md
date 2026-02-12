# @vue-spectrum/link

Vue port of `@react-spectrum/link`.

<script setup lang="ts">
import { Flex, Link } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-150" class="spectrum-preview-panel">
    <Link href="https://github.com/pioug/vue-aria/">Primary link</Link>
    <Link variant="secondary">Secondary link</Link>
    <Link is-quiet>Quiet link</Link>
    <div style="background: #1d1d1d; padding: 12px; border-radius: 6px; width: fit-content;">
      <Link variant="overBackground">Over background</Link>
    </div>
  </Flex>
</div>

## Exports

- `Link`

## Example

```vue
<script setup lang="ts">
import { Link } from "@vue-spectrum/link";
</script>

<template>
  <Link />
</template>
```

## Notes

- Uses `@vue-aria/link` semantics for press, keyboard, and router-aware navigation behavior.
- Supports text-only links and wrapped custom child links when `href` is omitted.
- Supports Spectrum variants: `primary`, `secondary`, and `overBackground`.
