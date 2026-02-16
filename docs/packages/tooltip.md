# @vue-aria/tooltip

`@vue-aria/tooltip` ports tooltip accessibility hooks from upstream `@react-aria/tooltip`.

## Implemented modules

- `useTooltip`
- `useTooltipTrigger`
- `@vue-stately/tooltip/useTooltipTriggerState`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { useTooltip, useTooltipTrigger } from "@vue-aria/tooltip";
import { useTooltipTriggerState } from "@vue-stately/tooltip";

const triggerRef = { current: null as Element | null };
const state = useTooltipTriggerState({ delay: 0 });
const { triggerProps, tooltipProps } = useTooltipTrigger({}, state, triggerRef);
const { tooltipProps: finalTooltipProps } = useTooltip(tooltipProps, state);
</script>

<template>
  <button v-bind="triggerProps">Trigger</button>
  <span v-if="state.isOpen" v-bind="finalTooltipProps">Tooltip</span>
</template>
```

## Notes

- `Spectrum S2` is ignored for this port.
- Tooltip trigger behavior depends on focus/hover modality and delay semantics from `@vue-stately/tooltip`.
