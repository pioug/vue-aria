# @vue-spectrum/badge

Vue port of `@react-spectrum/badge`.

<script setup lang="ts">
import { Badge, Flex } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="row" gap="size-100" wrap class="spectrum-preview-panel">
    <Badge variant="neutral">Draft</Badge>
    <Badge variant="positive">Complete</Badge>
    <Badge variant="negative">Failed</Badge>
    <Badge variant="seafoam">Synced</Badge>
  </Flex>
</div>

## Exports

- `Badge`

## Example

```ts
import { h } from "vue";
import { Badge } from "@vue-spectrum/badge";

const chip = h(Badge, { variant: "positive" }, () => "Complete");
```

## Notes

- Supports text-only, icon-only, and icon+text badge content.
- Supports semantic and Spectrum color variants (`neutral`, `info`, `positive`, `negative`, `indigo`, `yellow`, `magenta`, `fuchsia`, `purple`, `seafoam`).
