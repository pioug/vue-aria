# @vue-aria/ssr

`@vue-aria/ssr` ports SSR id and hydration helpers from upstream `@react-aria/ssr`.

## Implemented modules

- `SSRProvider`
- `useSSRSafeId`
- `useIsSSR`
- `useId`
- `useIdString`

## Upstream-aligned examples

### SSRProvider + useSSRSafeId

```vue
<script setup lang="ts">
import { SSRProvider, useSSRSafeId } from "@vue-aria/ssr";
import { defineComponent, h } from "vue";

const Item = defineComponent({
  setup() {
    const id = useSSRSafeId();
    return () => h("div", { id });
  },
});
</script>

<template>
  <SSRProvider>
    <Item />
    <Item />
  </SSRProvider>
</template>
```

### useIsSSR

```vue
<script setup lang="ts">
import { useIsSSR } from "@vue-aria/ssr";

const isSSR = useIsSSR();
</script>

<template>
  <div>{{ isSSR ? "ssr-or-hydrating" : "client-rendered" }}</div>
</template>
```

## Notes

- No-provider id behavior follows upstream intent:
  - test mode: deterministic `react-aria-<n>`
  - production mode: random-prefix `react-aria<random>-<n>`
- `Spectrum S2` is ignored for this port.
- Remaining work focuses on hydration transition integration checks and expanded docs examples.
