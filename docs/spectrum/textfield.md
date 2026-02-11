# @vue-spectrum/textfield

Vue port baseline of `@react-spectrum/textfield`.

<script setup lang="ts">
import { TextArea, TextField } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 420px;">
    <TextField label="Project name" description="Give your project a clear title." />
    <TextArea label="Description" rows="4" description="Explain the goal and scope." />
  </div>
</div>

## Exports

- `TextField`
- `TextArea`

## Example

```ts
import { h } from "vue";
import { TextArea, TextField } from "@vue-spectrum/textfield";

const field = h(TextField, {
  label: "Name",
  placeholder: "Your name",
  isRequired: true,
});

const area = h(TextArea, {
  label: "Notes",
  rows: 4,
  defaultValue: "Initial text",
});
```

## Notes

- Baseline includes `useTextField` accessibility semantics, validation wiring, and controlled/uncontrolled value behavior.
- `TextArea` baseline includes multiline rendering and row configuration.
- Placeholder deprecation warning parity from upstream `TextField` and `TextArea` is included.
- Upstream advanced icon/loading/auto-resize behavior is still pending parity work.
