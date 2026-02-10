# @vue-spectrum/meter

Vue port of `@react-spectrum/meter`.

<script setup lang="ts">
import { Flex, Meter, Text } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-150" class="spectrum-preview-panel">
    <Meter label="Storage usage" value="65" variant="informative" />
    <Meter label="Quality score" value="82" variant="positive" />
    <Meter label="Risk level" value="74" variant="warning" />
    <Text class="spectrum-preview-muted">Meters visualize measured values rather than process progress.</Text>
  </Flex>
</div>

## Exports

- `Meter`

## Example

```ts
import { h } from "vue";
import { Meter } from "@vue-spectrum/meter";

const usage = h(Meter, {
  label: "Storage",
  value: 48,
  variant: "informative",
});
```

## Notes

- Uses the same base rendering as `@vue-spectrum/progress` (`ProgressBarBase`) for parity.
- Supports variants: `informative`, `positive`, `warning`, `critical`.
