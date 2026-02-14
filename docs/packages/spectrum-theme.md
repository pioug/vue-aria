# @vue-spectrum/theme

`@vue-spectrum/theme` provides a provider-compatible default Spectrum class-map theme for Vue ports.

## API

- `theme`

## Example

```vue
<script setup lang="ts">
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
</script>

<template>
  <Provider :theme="theme">
    <button type="button">Themed button</button>
  </Provider>
</template>
```

## Variant Packages

- `@vue-spectrum/theme` (`theme`): baseline default class-map for light/dark + scale keys.
- `@vue-spectrum/theme-light` (`theme`): light-focused variant map.
- `@vue-spectrum/theme-dark` (`theme`): dark-focused variant map.
- `@vue-spectrum/theme-express` (`theme`): express variant map layered on Spectrum defaults.

## Class Map Matrix

All variants export the same provider-compatible shape:

- `theme.global`
- `theme.light`
- `theme.dark`
- `theme.medium`
- `theme.large`

Current bootstrap class-map values:

- `theme.global` (all variants): `spectrum`, `spectrum--light`, `spectrum--lightest`, `spectrum--dark`, `spectrum--darkest`, `spectrum--medium`, `spectrum--large`
- `@vue-spectrum/theme-express` adds `global.express` plus `medium.express` and `large.express`.

| Package | `light["spectrum--light"]` | `dark["spectrum--dark"]` |
| --- | --- | --- |
| `@vue-spectrum/theme` | `spectrum--light` | `spectrum--darkest` |
| `@vue-spectrum/theme-light` | `spectrum--lightest` | `spectrum--darkest` |
| `@vue-spectrum/theme-dark` | `spectrum--dark` | `spectrum--darkest` |
| `@vue-spectrum/theme-express` | `spectrum--light` | `spectrum--darkest` |

## Runtime Switching Example

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import { Provider } from "@vue-spectrum/provider";
import { theme as defaultTheme } from "@vue-spectrum/theme";
import { theme as darkTheme } from "@vue-spectrum/theme-dark";

const variant = ref<"default" | "dark">("default");
const activeTheme = computed(() => (variant.value === "dark" ? darkTheme : defaultTheme));
</script>

<template>
  <button type="button" @click="variant = variant === 'default' ? 'dark' : 'default'">
    Toggle theme variant
  </button>

  <Provider :theme="activeTheme">
    <button type="button">Provider themed content</button>
  </Provider>
</template>
```

## Notes

- Current slice is a bootstrap class-map adaptation of upstream theme-default behavior for provider parity.
- Theme packages provide class maps only; Spectrum CSS tokens/styles still need to be loaded by consumers.
- `Spectrum S2` is out of scope unless explicitly requested.
