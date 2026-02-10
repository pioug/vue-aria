# @vue-spectrum/button

Vue baseline port of `@react-spectrum/button`.

> Status: in progress. Current baseline includes `Button`, `ActionButton`, `ClearButton`, `LogicButton`, and `ToggleButton` with core press/disabled/focus behavior and initial parity tests.

<script setup lang="ts">
import { ActionButton, Button, ClearButton, Flex, LogicButton, ToggleButton } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-150" class="spectrum-preview-panel">
    <Flex direction="row" gap="size-100" wrap>
      <Button variant="accent">Primary action</Button>
      <Button variant="secondary">Secondary action</Button>
      <ActionButton>Action</ActionButton>
      <LogicButton variant="and">AND</LogicButton>
      <ToggleButton>Toggle me</ToggleButton>
      <ClearButton aria-label="Clear" />
    </Flex>
  </Flex>
</div>

## Exports

- `Button`
- `ActionButton`
- `ClearButton`
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
- Includes baseline wrappers for action/logic/clear/toggle button variants.
- Pending parity work includes upstream pending-state behavior, icon slot behavior, and deeper cross-browser interaction edge cases.
