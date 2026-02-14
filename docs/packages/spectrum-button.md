# @vue-spectrum/button - Button

`Button` is the primary Spectrum call-to-action control. It supports text-only and icon-plus-label content, pointer/keyboard/touch press handling, and pending-state behavior.

## Example

```vue
<script setup lang="ts">
import { Button } from "@vue-spectrum/button";
</script>

<template>
  <Button variant="accent">Save</Button>
</template>
```

## Content

Buttons should have a visible label. Icon-only buttons must provide an accessible name via `aria-label`.

```vue
<script setup lang="ts">
import { Button } from "@vue-spectrum/button";
</script>

<template>
  <Button variant="primary" aria-label="Notifications">
    <span class="spectrum-Icon" aria-hidden="true">🔔</span>
  </Button>
</template>
```

## Accessibility

- If there is no visible text label, provide `aria-label`.
- Use `isDisabled` when interaction must be unavailable.
- Pending mode (`isPending`) disables press interactions while loading.

## Internationalization

Use localized `children` text or localized `aria-label`.

## Events

Handle user interaction through `onPress` (mouse, keyboard, touch).

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@vue-spectrum/button";

const count = ref(0);
</script>

<template>
  <Button variant="primary" :onPress="() => (count.value += 1)">{{ count }} Dogs</Button>
</template>
```

## Pending

`isPending` disables button interactions immediately. A spinner becomes visible after a short delay.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@vue-spectrum/button";

const isPending = ref(false);

const onPress = () => {
  isPending.value = true;
  setTimeout(() => {
    isPending.value = false;
  }, 3000);
};
</script>

<template>
  <Button variant="primary" :isPending="isPending" :onPress="onPress">Click me!</Button>
</template>
```

## Visual Options

### Accent

```vue
<Button variant="accent" style="fill">Save</Button>
<Button variant="accent" style="outline">Save</Button>
```

### Primary

```vue
<Button variant="primary" style="fill">Save</Button>
<Button variant="primary" style="outline">Save</Button>
```

### Secondary

```vue
<Button variant="secondary" style="fill">Save</Button>
<Button variant="secondary" style="outline">Save</Button>
```

### Negative

```vue
<Button variant="negative" style="fill">Save</Button>
<Button variant="negative" style="outline">Save</Button>
```

### Static color

```vue
<Button variant="primary" staticColor="white" style="fill">Save</Button>
<Button variant="primary" staticColor="black" style="outline">Save</Button>
```

### Disabled

```vue
<Button variant="accent" isDisabled>Save</Button>
```

### Icon only

```vue
<Button variant="accent" aria-label="Ring for service">
  <span class="spectrum-Icon" aria-hidden="true">🔔</span>
</Button>
```

## Related

- [ActionButton](/packages/spectrum-action-button)
- [LogicButton](/packages/spectrum-logic-button)
- [ToggleButton](/packages/spectrum-toggle-button)
- `Spectrum S2` remains out of scope unless explicitly requested.
