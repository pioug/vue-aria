# @vue-spectrum/theme-express

Vue port baseline of `@react-spectrum/theme-express`.

<script setup lang="ts">
import { computed, defineComponent, h } from "vue";
import { Provider, useProvider } from "@vue-spectrum/vue-spectrum";
import { theme } from "@vue-spectrum/theme-express";

const ColorSchemeBadge = defineComponent({
  name: "ThemeExpressColorSchemeBadge",
  setup() {
    const provider = useProvider();
    const colorScheme = computed(() => provider.value.colorScheme);
    const scale = computed(() => provider.value.scale);

    return () =>
      h(
        "span",
        {
          class: "spectrum-preview-chip",
        },
        `${colorScheme.value} / ${scale.value}`
      );
  },
});
</script>

## Preview

<div class="spectrum-preview">
  <Provider
    :theme="theme"
    color-scheme="light"
    scale="large"
    v-bind="{ UNSAFE_className: 'spectrum-preview-stack' }"
  >
    <p class="spectrum-preview-muted">Express theme package consumed through Provider:</p>
    <ColorSchemeBadge />
  </Provider>
</div>

## Exports

- `theme`

## Example

```ts
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-express";

const app = {
  components: { Provider },
  template: `
    <Provider :theme="theme" color-scheme="light" scale="large">
      <slot />
    </Provider>
  `,
  setup() {
    return { theme };
  },
};
```

## Notes

- The baseline export uses the provider contract (`global`, `light`, `dark`, `medium`, `large`) and layers express classes on top of `@vue-spectrum/theme-default`.
- Express-specific classes currently include `spectrum--express`, `spectrum--express-medium`, and `spectrum--express-large`.
- This baseline currently maps class-name sections only; full upstream token/CSS parity remains in progress.
