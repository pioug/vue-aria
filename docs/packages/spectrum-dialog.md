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

## DialogTrigger

Use `DialogTrigger` to connect trigger interactions with dialog visibility.

```vue
<script setup lang="ts">
import { Dialog, DialogTrigger } from "@vue-spectrum/dialog";
</script>

<template>
  <DialogTrigger>
    <template #trigger>
      <button>Open dialog</button>
    </template>
    <template #default="{ close }">
      <Dialog>
        <h2>Preferences</h2>
        <button @click="close">Close</button>
      </Dialog>
    </template>
  </DialogTrigger>
</template>
```

### Controlled DialogTrigger

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Dialog, DialogTrigger } from "@vue-spectrum/dialog";

const isOpen = ref(false);
const onOpenChange = (next: boolean) => {
  isOpen.value = next;
};
</script>

<template>
  <DialogTrigger :is-open="isOpen" :on-open-change="onOpenChange">
    <template #trigger>
      <button>Open dialog</button>
    </template>
    <template #default="{ close }">
      <Dialog>
        <h2>Preferences</h2>
        <button @click="close">Close</button>
      </Dialog>
    </template>
  </DialogTrigger>
</template>
```

### Trigger type variants

```vue
<template>
  <DialogTrigger type="tray">
    <template #trigger>
      <button>Open tray</button>
    </template>
    <template #default="{ close }">
      <Dialog>
        <h2>Tray dialog</h2>
        <button @click="close">Close</button>
      </Dialog>
    </template>
  </DialogTrigger>

  <DialogTrigger type="fullscreen">
    <template #trigger>
      <button>Open fullscreen</button>
    </template>
    <template #default="{ close }">
      <Dialog>
        <h2>Fullscreen dialog</h2>
        <button @click="close">Close</button>
      </Dialog>
    </template>
  </DialogTrigger>
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

## AlertDialog Example

```vue
<script setup lang="ts">
import { AlertDialog } from "@vue-spectrum/dialog";
</script>

<template>
  <AlertDialog
    variant="destructive"
    title="Delete project"
    primary-action-label="Delete"
    secondary-action-label="Archive"
    cancel-label="Cancel"
    :is-primary-action-disabled="false"
    :is-secondary-action-disabled="false"
  >
    This action cannot be undone.
  </AlertDialog>
</template>
```

## DialogContainer Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Dialog, DialogContainer } from "@vue-spectrum/dialog";

const isOpen = ref(true);
const onDismiss = () => {
  isOpen.value = false;
};
</script>

<template>
  <DialogContainer v-if="isOpen" type="tray" :on-dismiss="onDismiss">
    <Dialog>
      <h2>Container-managed dialog</h2>
      <p>Dismiss closes the current container dialog.</p>
    </Dialog>
  </DialogContainer>
</template>
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

### Type variants

```vue
<template>
  <Dialog type="modal"><p>Modal dialog</p></Dialog>
  <Dialog type="popover"><p>Popover dialog</p></Dialog>
  <Dialog type="fullscreen"><p>Fullscreen dialog</p></Dialog>
  <Dialog type="fullscreenTakeover"><p>Fullscreen takeover dialog</p></Dialog>
</template>
```

### Role override

```vue
<Dialog role="alertdialog">
  <h2>Connection lost</h2>
  <p>Reconnect to continue.</p>
</Dialog>
```

### Root customization

```vue
<template>
  <Dialog
    UNSAFE_className="custom-dialog"
    :UNSAFE_style="{ borderWidth: '2px', borderStyle: 'solid' }"
  >
    <h2>Custom shell</h2>
    <p>Dialog content with root-level custom styling.</p>
  </Dialog>
</template>
```

## Related

- `DialogContainer` and `AlertDialog` are also available in this package.
- `Spectrum S2` remains out of scope unless explicitly requested.
