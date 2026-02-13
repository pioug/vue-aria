# @vue-aria/landmark

`@vue-aria/landmark` ports landmark navigation APIs from upstream `@react-aria/landmark`.

## Implemented modules

- `useLandmark`
- `UNSTABLE_createLandmarkController`

## Upstream-aligned examples

### Register a landmark

```ts
import { useLandmark } from "@vue-aria/landmark";
import { ref } from "vue";

const mainRef = ref<HTMLElement | null>(null);
const mainRefAdapter = {
  get current() {
    return mainRef.value;
  },
  set current(value: Element | null) {
    mainRef.value = value as HTMLElement | null;
  },
};

const { landmarkProps } = useLandmark({ role: "main", "aria-label": "Main content" }, mainRefAdapter);
```

### Programmatic landmark navigation

```ts
import { UNSTABLE_createLandmarkController } from "@vue-aria/landmark";

const controller = UNSTABLE_createLandmarkController();
controller.focusNext();
controller.focusMain();
controller.dispose();
```

## Notes

- F6 and Shift+F6 landmark navigation semantics are managed globally through the landmark manager.
- `Spectrum S2` is ignored for this port.
