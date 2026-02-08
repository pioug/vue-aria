# @vue-aria/toast

Toast accessibility primitives.

## `useToast`

Provides toast dialog/alert semantics, title/description ids, and close button props.

## `useToastRegion`

Provides region semantics around a toast stack, with hover/focus timer pausing and focus restoration when toasts dismiss.

```ts
import { useToast, useToastRegion } from "@vue-aria/toast";
import { useToastState } from "@vue-aria/toast-state";

const state = useToastState<string>();
const { regionProps } = useToastRegion({}, state, regionRef);

const toast = state.visibleToasts.value[0];
if (toast) {
  const { toastProps, contentProps, titleProps, descriptionProps, closeButtonProps } =
    useToast({ toast }, state, toastRef);
}
```
