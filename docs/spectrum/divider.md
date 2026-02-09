# @vue-spectrum/divider

Vue port of `@react-spectrum/divider`.

<script setup lang="ts">
import { Divider, Flex, Heading, Text } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-150" class="spectrum-preview-panel">
    <Heading level="4">Section Header</Heading>
    <Text class="spectrum-preview-muted">Horizontal divider (default size L).</Text>
    <Divider aria-label="Section break" />
    <Text class="spectrum-preview-muted">Vertical divider between actions.</Text>
    <div style="display: flex; align-items: center; gap: 12px;">
      <span>Before</span>
      <Divider orientation="vertical" aria-label="Action split" style="height: 24px;" />
      <span>After</span>
    </div>
  </Flex>
</div>

## Exports

- `Divider`

## Example

```ts
import { h } from "vue";
import { Divider } from "@vue-spectrum/divider";

const line = h(Divider, {
  size: "M",
  orientation: "horizontal",
  "aria-label": "Section break",
});
```

## Notes

- Supports `size`: `S | M | L` (default `L`).
- Supports `orientation`: `horizontal | vertical` (default `horizontal`).
- Vertical orientation renders `role="separator"` with `aria-orientation="vertical"`.
