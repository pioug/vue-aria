# @vue-spectrum/dialog - Dialog

`Dialog` displays contextual information or workflows in an overlay surface.

## Example

```vue
<script setup lang="ts">
import { Dialog } from "@vue-spectrum/dialog";
</script>

<template>
  <Dialog>
    <h2>Publish 3 pages</h2>
    <p>Confirm publish?</p>
  </Dialog>
</template>
```

## Content

Provide your own content structure inside the dialog body (heading, text, actions, and form content).

```vue
<Dialog>
  <h2>Register for newsletter</h2>
  <p>Enter your details below.</p>
</Dialog>
```

## Labeling

- If no visible title is associated, pass `aria-label`.
- If labeling comes from an external element, pass `aria-labelledby`.

```vue
<Dialog aria-label="Profile settings">
  <p>Dialog body</p>
</Dialog>
```

## Events

Dismissable dialogs can provide `onDismiss`.

```vue
<script setup lang="ts">
import { Dialog } from "@vue-spectrum/dialog";

const onDismiss = () => {
  // handle close
};
</script>

<template>
  <Dialog isDismissable :onDismiss="onDismiss">
    <h2>Status</h2>
    <p>Printer connected.</p>
  </Dialog>
</template>
```

## Visual options

### Size

```vue
<template>
  <Dialog size="S"><p>Small</p></Dialog>
  <Dialog size="M"><p>Medium</p></Dialog>
  <Dialog size="L"><p>Large</p></Dialog>
</template>
```

## Related

- `DialogTrigger`, `DialogContainer`, and `AlertDialog` are tracked as remaining parity work for this package.
- `Spectrum S2` remains out of scope unless explicitly requested.
