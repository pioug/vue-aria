# @vue-spectrum/textfield

Vue port baseline of `@react-spectrum/textfield`.

<script setup lang="ts">
import { TextArea, TextField } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 16px; max-width: 420px;">
    <TextField
      label="Project name"
      description="Give your project a clear title."
      validationState="valid"
    />
    <TextField
      label="Sync status"
      defaultValue="Syncing..."
      isLoading
      description="Loading indicator parity preview."
    />
    <TextArea label="Description" rows="4" description="Explain the goal and scope." />
  </div>
</div>

## Exports

- `TextField`
- `TextArea`

## Example

```vue
<script setup lang="ts">
import { TextArea, TextField } from "@vue-spectrum/textfield";
</script>

<template>
  <TextArea />
</template>
```

## Notes

- Baseline includes `useTextField` accessibility semantics, validation wiring, controlled/uncontrolled value behavior, and passthrough ARIA/data attributes on the native input (including `aria-errormessage`).
- Baseline includes controlled form-reset parity (`<form><input type="reset" /></form>`) for both `TextField` and `TextArea`.
- Baseline includes `Form.validationErrors` wiring by field `name`, including invalid-state and error message semantics plus server-error clearing when the user edits the field.
- Baseline includes `validate(value)` support for ARIA validation behavior, with realtime invalid state and error-message updates.
- Baseline includes `validate(value)` custom validity wiring for native validation behavior (`validationBehavior="native"`).
- Native required/invalid messaging now follows `checkValidity` + blur lifecycle semantics (invalid message shown after invalid submit/check and cleared after a valid blur).
- Native validation now supports function-style `errorMessage` customizers based on validation context (for example `valueMissing` checks).
- Native mode now applies `Form.validationErrors` to browser custom validity so server errors participate in `input.validity` state.
- Native server validation errors persist across repeated submits until the field value changes.
- `TextArea` baseline includes multiline rendering, row configuration, and auto-resize behavior driven by textarea `scrollHeight` updates (including quiet variant growth and explicit-height opt-out behavior).
- Placeholder deprecation warning parity from upstream `TextField` and `TextArea` is included.
- Baseline icon, loading-indicator, validation-icon (including locale-aware valid-icon labels), and `excludeFromTabOrder` behavior parity is now included for both `TextField` and `TextArea`.
