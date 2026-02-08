# Getting Started

## Install

```bash
npm install
```

## Run Docs Locally

```bash
npm run docs:dev
```

## Build Docs

```bash
npm run docs:build
```

## Core Package Layout

The repository mirrors React Aria package boundaries:

- `packages/@vue-aria/types`
- `packages/@vue-aria/utils`
- `packages/@vue-aria/ssr`
- `packages/@vue-aria/focus`
- `packages/@vue-aria/interactions`
- `packages/@vue-aria/button`
- `packages/@vue-aria/vue-aria`

## First Usage

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

## Useful Commands

- `npm run test`
- `npm run test:parity`
- `npm run check`
