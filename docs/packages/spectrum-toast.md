# @vue-spectrum/toast - Toast

`ToastContainer` renders queued toasts. `ToastQueue` provides global enqueue helpers.

## Example

Render a container once near app root:

```vue
<script setup lang="ts">
import { ToastContainer } from "@vue-spectrum/toast";
</script>

<template>
  <ToastContainer />
</template>
```

Queue toasts from anywhere:

```vue
<script setup lang="ts">
import { ToastQueue } from "@vue-spectrum/toast";
</script>

<template>
  <button @click="ToastQueue.positive('Toast is done!')">Show toast</button>
</template>
```

## Content

Toasts are stacked in queue order with most recent shown first. Use:
- `ToastQueue.neutral`
- `ToastQueue.positive`
- `ToastQueue.negative`
- `ToastQueue.info`

## Accessibility

- Toasts are exposed in a landmark `region` labeled notifications by default.
- Individual toasts use `alertdialog` + `alert` semantics.
- Region label can be overridden via `ToastContainer` `aria-label`.

## Events

```ts
ToastQueue.info("An update is available", {
  actionLabel: "Update",
  onAction: () => console.log("Updating"),
  shouldCloseOnAction: true,
});
```

## Auto-dismiss

```ts
ToastQueue.positive("Saved", { timeout: 5000 });
```

- Minimum timeout is 5000ms for non-actionable toasts.
- Actionable toasts are not auto-dismissed.

## Programmatic dismissal

```ts
const close = ToastQueue.negative("Unable to save");
close();
```

## Placement

`ToastContainer` supports:
- `"top"`
- `"top end"`
- `"bottom"`
- `"bottom end"`

```vue
<ToastContainer placement="bottom end" />
```

## Testing

Button testids:
- `rsp-Toast-secondaryButton`
- `rsp-Toast-closeButton`

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
