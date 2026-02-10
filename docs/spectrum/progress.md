# @vue-spectrum/progress

Vue port of `@react-spectrum/progress`.

<script setup lang="ts">
import { Flex, ProgressBar, ProgressCircle, Text } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-200" class="spectrum-preview-panel">
    <ProgressBar label="Upload" value="42" />
    <ProgressBar label="Processing" is-indeterminate />
    <div style="display: flex; align-items: center; gap: 20px;">
      <ProgressCircle aria-label="Sync progress" value="75" />
      <ProgressCircle aria-label="Loading" is-indeterminate />
      <Text class="spectrum-preview-muted">Progress circle states</Text>
    </div>
  </Flex>
</div>

## Exports

- `ProgressBar`
- `ProgressCircle`
- `ProgressBarBase`

## Example

```ts
import { h } from "vue";
import { ProgressBar, ProgressCircle } from "@vue-spectrum/progress";

const bar = h(ProgressBar, { label: "Upload", value: 30 });
const circle = h(ProgressCircle, { "aria-label": "Loading", isIndeterminate: true });
```

## Notes

- `ProgressBar` and `ProgressCircle` are built on top of `@vue-aria/progress` semantics.
- `ProgressBarBase` is shared with the upcoming `@vue-spectrum/meter` package, matching upstream structure.
