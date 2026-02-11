# Getting Started

## Install

```bash
npm install
```

## Migration Status

- Consolidated status: `/porting/status`
- Spectrum strategy: `/porting/spectrum-roadmap`
- Canonical Spectrum checklist: `SPECTRUM_PORTING_TRACKER.md`

## Run Docs Locally

```bash
npm run docs:dev
```

## Build Docs

```bash
npm run docs:build
```

## Core Package Layout

The repository mirrors upstream package boundaries:

- `packages/@vue-aria/*` (React Aria hook/state ports)
- `packages/@vue-spectrum/*` (React Spectrum component ports)
- `packages/@vue-aria/vue-aria` (hook umbrella exports)
- `packages/@vue-spectrum/vue-spectrum` (component umbrella exports)

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
- `npm run test:spectrum-parity`
- `npm run docs:build`
- `npm run check`
