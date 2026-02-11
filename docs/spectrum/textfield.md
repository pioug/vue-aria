# @vue-spectrum/textfield

Vue port baseline of `@react-spectrum/textfield`.

<script setup lang="ts">
import { h } from "vue";
import { TextArea, TextField } from "@vue-spectrum/vue-spectrum";

const fieldIcon = h(
  "span",
  { class: "spectrum-preview-inline-icon", "aria-hidden": "true" },
  "#"
);
const loadingIndicator = h(
  "span",
  { class: "spectrum-preview-inline-loader", "aria-hidden": "true" },
  "..."
);
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 420px;">
    <TextField
      label="Project name"
      description="Give your project a clear title."
      validationState="valid"
      :icon="fieldIcon"
    />
    <TextField
      label="Sync status"
      defaultValue="Syncing..."
      isLoading
      :loadingIndicator="loadingIndicator"
      description="Loading indicator parity preview."
    />
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

- Baseline includes `useTextField` accessibility semantics, validation wiring, controlled/uncontrolled value behavior, and passthrough ARIA/data attributes on the native input.
- Baseline includes controlled form-reset parity (`<form><input type="reset" /></form>`) for both `TextField` and `TextArea`.
- `TextArea` baseline includes multiline rendering, row configuration, and auto-resize behavior driven by textarea `scrollHeight` updates.
- Placeholder deprecation warning parity from upstream `TextField` and `TextArea` is included.
- Baseline icon, loading-indicator, validation-icon, and `excludeFromTabOrder` behavior parity is now included for both `TextField` and `TextArea`.
