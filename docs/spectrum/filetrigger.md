# @vue-spectrum/filetrigger

Vue port baseline of `@react-spectrum/filetrigger`.

<script setup lang="ts">
import { FileTrigger, Button } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 520px;">
    <FileTrigger :acceptedFileTypes="['image/png', 'image/jpeg']">
      <Button variant="accent">Select files</Button>
    </FileTrigger>
  </div>
</div>

## Exports

- `FileTrigger`

## Example

```vue
<script setup lang="ts">
import { FileTrigger } from "@vue-spectrum/filetrigger";
import { Button } from "@vue-spectrum/button";
</script>

<template>
  <FileTrigger />
</template>
```

## Notes

- Baseline mirrors upstream behavior: a pressable child opens a hidden file input, and selected files are emitted through `onSelect`.
- Supported props include `acceptedFileTypes`, `allowsMultiple`, `defaultCamera`, and `acceptDirectory`.
- Advanced interoperability with every custom pressable implementation remains in progress.
