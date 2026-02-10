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

```ts
import { h } from "vue";
import { FileTrigger } from "@vue-spectrum/filetrigger";
import { Button } from "@vue-spectrum/button";

const trigger = h(
  FileTrigger,
  {
    acceptedFileTypes: ["image/png"],
    allowsMultiple: true,
    onSelect: (files) => {
      const names = files ? Array.from(files).map((file) => file.name) : [];
      console.log(names);
    },
  },
  {
    default: () => h(Button, { variant: "accent" }, () => "Upload"),
  }
);
```

## Notes

- Baseline mirrors upstream behavior: a pressable child opens a hidden file input, and selected files are emitted through `onSelect`.
- Supported props include `acceptedFileTypes`, `allowsMultiple`, `defaultCamera`, and `acceptDirectory`.
- Advanced interoperability with every custom pressable implementation remains in progress.
