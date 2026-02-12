# @vue-spectrum/text

Vue port of `@react-spectrum/text` primitives.

<script setup lang="ts">
import { Heading, Keyboard, Text } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview spectrum-preview-stack">
  <Heading :level="2">Command Palette</Heading>
  <p class="spectrum-preview-muted">
    <Text>Open search with </Text>
    <Keyboard>Cmd</Keyboard>
    <Text> + </Text>
    <Keyboard>K</Keyboard>
  </p>
</div>

## Exports

- `Text`
- `Heading`
- `Keyboard`

## Example

```vue
<script setup lang="ts">
import { Heading, Text, Keyboard } from "@vue-spectrum/text";
</script>

<template>
  <Heading />
</template>
```

## Notes

- `Text` renders a semantic-neutral `span` with `role="none"` by default.
- `Heading` renders `h3` by default and supports `level` overrides from 1 to 6.
- `Keyboard` renders keyboard command text using `kbd` semantics.
