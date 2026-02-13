# @vue-aria/utils

`@vue-aria/utils` ports upstream `@react-aria/utils` helpers and composables for Vue usage.

## Implemented modules

- Core helpers: `chain`, `mergeProps`, `mergeRefs`, `filterDOMProps`
- DOM/shadow helpers: `domHelpers`, `shadowdom/ShadowTreeWalker`, `getScrollParent`, `getScrollParents`, `focusWithoutScrolling`
- Link/router helpers: `openLink`, `getSyntheticLinkProps`, `useSyntheticLinkProps`, `RouterProvider`, `useRouter`, `useLinkProps`, `handleLinkClick`
- Event/interaction helpers: `isVirtualClick`, `isVirtualPointerEvent`, `isCtrlKeyPressed`, `willOpenKeyboard`, `runAfterTransition`
- Geometry/math helpers: `getOffset`, `scrollIntoView`, `scrollIntoViewport`, `clamp`, `snapValueToStep`
- Vue composables: `useId`, `mergeIds`, `useSlotId`, `useLayoutEffect`, `useEffectEvent`, `useEvent`, `useUpdateEffect`, `useUpdateLayoutEffect`, `useDeepMemo`, `useFormReset`, `useGlobalListeners`, `useSyncRef`, `useObjectRef`, `useLabels`, `useDescription`, `useLoadMore`, `useLoadMoreSentinel`/`UNSTABLE_useLoadMoreSentinel`, `useResizeObserver`, `useValueEffect`, `useViewportSize`, `useDrag1D`

## Upstream-aligned examples

```vue
<script setup lang="ts">
import { mergeProps, useId, useLabels } from "@vue-aria/utils";

const id = useId();
const { labelProps, fieldProps } = useLabels({
  id,
  label: "Name",
});

const baseProps = { class: "field" };
const interactiveProps = {
  onFocus: () => console.log("focus"),
  onBlur: () => console.log("blur"),
};

const inputProps = mergeProps(fieldProps, baseProps, interactiveProps);
</script>

<template>
  <label v-bind="labelProps">Name</label>
  <input v-bind="inputProps" />
</template>
```

## Notes

- This package is non-visual; there are no dedicated base style assets.
- `Spectrum S2` is out of scope for this port unless explicitly requested.
