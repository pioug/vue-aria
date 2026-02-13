# @vue-aria/toast

`@vue-aria/toast` ports the toast accessibility hooks from upstream `@react-aria/toast`.

## Implemented modules

- `useToast`
- `useToastRegion`

## Features

- Accessible `alertdialog` + `alert` semantics for individual toasts.
- Landmark-region navigation support (`F6` / `Shift+F6`) through `useToastRegion` + `useLandmark`.
- Focus restoration behavior when toasts are replaced or dismissed.
- Timer pause/resume behavior for hover and focus interactions.

## Upstream-aligned examples

### Toast provider + region + item composition

```ts
import { useToastState } from "@react-stately/toast";
import { useToast, useToastRegion } from "@vue-aria/toast";
import { useButton } from "@vue-aria/button";
import { ref } from "vue";

function useToastProvider() {
  const state = useToastState<string>({ maxVisibleToasts: 5 });
  const regionRef = ref<HTMLElement | null>(null);
  const regionRefAdapter = {
    get current() {
      return regionRef.value;
    },
    set current(value: HTMLElement | null) {
      regionRef.value = value;
    },
  };

  const { regionProps } = useToastRegion({}, state as any, regionRefAdapter);
  return { state, regionRef, regionProps };
}

function useToastItem(toast: any, state: any) {
  const toastRef = ref<HTMLElement | null>(null);
  const closeButtonRef = ref<HTMLElement | null>(null);

  const toastRefAdapter = {
    get current() {
      return toastRef.value;
    },
    set current(value: Element | null) {
      toastRef.value = value as HTMLElement | null;
    },
  };
  const closeButtonRefAdapter = {
    get current() {
      return closeButtonRef.value;
    },
    set current(value: Element | null) {
      closeButtonRef.value = value as HTMLElement | null;
    },
  };

  const { toastProps, contentProps, titleProps, closeButtonProps } = useToast({ toast }, state, toastRefAdapter);
  const { buttonProps } = useButton(closeButtonProps as any, closeButtonRefAdapter);

  return { toastRef, closeButtonRef, toastProps, contentProps, titleProps, buttonProps };
}
```

### Auto-dismiss usage

```ts
state.add("Saved", { timeout: 5000 });
```

### Programmatic dismissal usage

```ts
const key = state.add("Unable to save");
state.close(key);
```

### Base styles mirrored from upstream examples

```css
.toast-region {
  position: fixed;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
}
```

## Notes

- Default region label is localized as notifications count.
- Current parity includes story-equivalent keyboard/pointer lifecycle coverage, including `F6 -> tab -> tab -> close` flows.
- `Spectrum S2` is ignored for this port.
