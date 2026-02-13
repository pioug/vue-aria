# @vue-aria/landmark

`@vue-aria/landmark` ports landmark navigation APIs from upstream `@react-aria/landmark`.

## Implemented modules

- `useLandmark`
- `UNSTABLE_createLandmarkController`

## Features

- Landmark registration with ARIA role/label semantics.
- Global keyboard landmark navigation (`F6`, `Shift+F6`, `Alt+F6`).
- Last-focused-child restoration when navigating between landmarks.
- Programmatic navigation via `UNSTABLE_createLandmarkController`.

## Upstream-aligned examples

### Register navigation and main landmarks

```ts
import { useLandmark } from "@vue-aria/landmark";
import { ref } from "vue";

const navigationRef = ref<HTMLElement | null>(null);
const mainRef = ref<HTMLElement | null>(null);

const navigationRefAdapter = {
  get current() {
    return navigationRef.value;
  },
  set current(value: Element | null) {
    navigationRef.value = value as HTMLElement | null;
  },
};
const mainRefAdapter = {
  get current() {
    return mainRef.value;
  },
  set current(value: Element | null) {
    mainRef.value = value as HTMLElement | null;
  },
};

const { landmarkProps: navigationProps } = useLandmark({ role: "navigation", "aria-label": "Primary nav" }, navigationRefAdapter);
const { landmarkProps } = useLandmark({ role: "main", "aria-label": "Main content" }, mainRefAdapter);
```

### Managed-focus landmark restoration pattern

```ts
const activeIndex = ref(0);
const buttons = ref<Array<HTMLButtonElement | null>>([null, null, null]);

const { landmarkProps } = useLandmark(
  {
    role: "navigation",
    focus: () => {
      buttons.value[activeIndex.value]?.focus();
    },
  },
  navigationRefAdapter
);
```

### Programmatic controller navigation

```ts
import { UNSTABLE_createLandmarkController } from "@vue-aria/landmark";

const controller = UNSTABLE_createLandmarkController();
controller.focusNext({ from: document.activeElement as Element });
controller.focusPrevious();
controller.focusMain();
controller.navigate("backward");
controller.dispose();
```

## Notes

- F6 and Shift+F6 landmark navigation semantics are managed globally through the landmark manager.
- Duplicate-role warning semantics match upstream (`aria-label` / `aria-labelledby` required + unique labels per role).
- `Spectrum S2` is ignored for this port.
