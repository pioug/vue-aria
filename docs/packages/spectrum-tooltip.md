# @vue-spectrum/tooltip - Tooltip

`TooltipTrigger` wraps a trigger element and a `Tooltip`, handling open/close interactions and positioning.

## Example

```vue
<script setup lang="ts">
import { Tooltip, TooltipTrigger } from "@vue-spectrum/tooltip";
</script>

<template>
  <TooltipTrigger>
    <button aria-label="Edit Name">Edit</button>
    <Tooltip>Change Name</Tooltip>
  </TooltipTrigger>
</template>
```

## Content

`TooltipTrigger` accepts exactly two children in order:
1. trigger element
2. `Tooltip`

```vue
<TooltipTrigger>
  <button aria-label="Save">Save</button>
  <Tooltip>Saving applies your new settings right away.</Tooltip>
</TooltipTrigger>
```

## Trigger composition with Spectrum Button

```vue
<script setup lang="ts">
import { Button } from "@vue-spectrum/button";
import { Tooltip, TooltipTrigger } from "@vue-spectrum/tooltip";
</script>

<template>
  <TooltipTrigger>
    <Button variant="primary">Save</Button>
    <Tooltip>Saves your updates.</Tooltip>
  </TooltipTrigger>
</template>
```

## Accessibility

- Trigger content must be focusable and hoverable.
- Tooltip content is associated to the trigger via `aria-describedby`.
- If no visible label is present in tooltip content, provide `aria-label`/`aria-labelledby`.

## Tooltip delay

```vue
<TooltipTrigger :delay="0">
  <button aria-label="Help">Help</button>
  <Tooltip>Shown immediately on hover.</Tooltip>
</TooltipTrigger>
```

## Placement

```vue
<TooltipTrigger placement="end">
  <button aria-label="Placement">Placement</button>
  <Tooltip>Placement follows writing direction.</Tooltip>
</TooltipTrigger>
```

## Offset and cross offset

```vue
<TooltipTrigger :offset="50">
  <button aria-label="Offset">Offset</button>
  <Tooltip>This shifts along the main axis.</Tooltip>
</TooltipTrigger>
```

```vue
<TooltipTrigger placement="bottom" :crossOffset="100">
  <button aria-label="Cross Offset">Cross Offset</button>
  <Tooltip>This shifts along the cross axis.</Tooltip>
</TooltipTrigger>
```

Tooltip overlays are positioned absolutely and include directional arrow alignment with Spectrum spacing defaults.

## Visual options

```vue
<TooltipTrigger>
  <button aria-label="Approve">Approve</button>
  <Tooltip variant="positive" :showIcon="true">Approve workflow.</Tooltip>
</TooltipTrigger>
```

Non-neutral variants render a semantic icon (`role="img"`) with an accessible label.

```vue
<TooltipTrigger>
  <button aria-label="Info">Info</button>
  <Tooltip variant="info" :showIcon="true">More information.</Tooltip>
</TooltipTrigger>
```

```vue
<TooltipTrigger>
  <button aria-label="Delete">Delete</button>
  <Tooltip variant="negative" :showIcon="true">Dangerous action.</Tooltip>
</TooltipTrigger>
```

## Options

```vue
<TooltipTrigger isDisabled>
  <button aria-label="Delete">Delete</button>
  <Tooltip variant="negative" :showIcon="true">Dangerous action.</Tooltip>
</TooltipTrigger>
```

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
