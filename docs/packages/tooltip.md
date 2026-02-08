# @vue-aria/tooltip

Tooltip behavior and trigger semantics.

## `useTooltip`

Returns tooltip element props and integrates tooltip hover behavior when paired
with trigger state.

## `useTooltipTrigger`

Returns trigger props and tooltip id wiring (`aria-describedby`) for focus/hover
and keyboard dismissal behavior.

```ts
import { useTooltip, useTooltipTrigger } from "@vue-aria/tooltip";

const { triggerProps, tooltipProps } = useTooltipTrigger({}, state, triggerElement);
const { tooltipProps: finalTooltipProps } = useTooltip(tooltipProps, state);
```
