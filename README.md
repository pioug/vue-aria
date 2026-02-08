# vue-aria (React Aria -> Vue port starter)

This repository starts a pragmatic port of core React Aria interaction patterns to Vue 3 composables.

The goal is not a 1:1 API clone yet. The goal is to preserve behavior and accessibility semantics while making the API feel native in Vue.

## What is implemented

- `useId`: stable id generation for aria relationships.
- `useFocusVisible`: global keyboard/pointer modality tracking.
- `useFocusRing`: focus + focus-visible state and event props.
- `useFocus`: focus handling on immediate target.
- `useFocusWithin`: focus handling for target and descendants.
- `usePress`: unified mouse/touch/keyboard/virtual press interactions.
- `useHover`: hover handling with touch-emulation suppression.
- `useKeyboard`: keyboard handling with opt-in propagation.
- `useButton`: button semantics for native and non-native elements.
- `useLink`: link semantics for native and non-native elements.
- `useLabel` / `useField`: label and field description/error wiring.
- `mergeProps`: utility to merge prop objects and chain event handlers.

## Repository layout

The code is organized to mirror React Aria package boundaries:

- `packages/@vue-aria/types`
- `packages/@vue-aria/utils`
- `packages/@vue-aria/ssr`
- `packages/@vue-aria/focus`
- `packages/@vue-aria/interactions`
- `packages/@vue-aria/button`
- `packages/@vue-aria/link`
- `packages/@vue-aria/label`
- `packages/@vue-aria/vue-aria` (umbrella exports)

## Install

```bash
npm install
```

## Upstream reference

The React Aria upstream source is tracked as a git submodule:

- `references/react-spectrum`

This keeps original hook implementations and test suites available locally for parity work.

## Build

```bash
npm run build
```

## Docs Website

```bash
npm run docs:dev
```

```bash
npm run docs:build
```

## Example usage

```vue
<script setup lang="ts">
import { useButton } from "@vue-aria/vue-aria";

const { buttonProps, isPressed, isFocusVisible } = useButton({
  onPress: (event) => {
    console.log("pressed via", event.pointerType);
  },
});
</script>

<template>
  <button
    v-bind="buttonProps"
    :data-pressed="isPressed ? '' : undefined"
    :data-focus-visible="isFocusVisible ? '' : undefined"
  >
    Press me
  </button>
</template>
```

## Migration strategy

1. Port interaction primitives first (`@react-aria/interactions`, `@react-aria/focus`).
2. Port semantic hooks next (`useButton`, `useLink`, `useCheckbox`, `useTextField`).
3. Port higher-level patterns last (menus, dialogs, overlays, collections).

That sequence keeps behavior stable while minimizing rewrite risk.
