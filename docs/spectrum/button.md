# @vue-spectrum/button

Vue baseline port of `@react-spectrum/button`.

> Status: in progress. Current baseline includes `Button`, `ActionButton`, `ClearButton`, `LogicButton`, and `ToggleButton` with core press/disabled/focus behavior and initial parity tests.

<script setup lang="ts">
import { ActionButton, Button, ClearButton, FieldButton, LogicButton, ToggleButton } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="padding: 0.8rem;">
    <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
      <Button variant="accent">Primary action</Button>
      <Button variant="secondary">Secondary action</Button>
      <ActionButton>Action</ActionButton>
      <FieldButton>Field action</FieldButton>
      <LogicButton variant="and">AND</LogicButton>
      <ToggleButton>Toggle me</ToggleButton>
      <ClearButton aria-label="Clear" />
    </div>
  </div>
</div>

## Exports

- `Button`
- `ActionButton`
- `ClearButton`
- `FieldButton`
- `LogicButton`
- `ToggleButton`

## Example

```ts
import { h } from "vue";
import { Button, ToggleButton } from "@vue-spectrum/button";

const submitButton = h(Button, { variant: "accent" }, () => "Save");
const toggle = h(ToggleButton, { defaultSelected: true }, () => "Enabled");
```

## Notes

- Uses `@vue-aria/button` and `@vue-aria/interactions` for core press and keyboard semantics.
- Includes wrappers for action/field/logic/clear/toggle button variants.
- `Button` now supports upstream-style pending state (`isPending`) with delayed spinner visibility and press suppression while pending.
- Pending parity work includes locale-specific pending announcements and deeper cross-browser interaction edge cases.
