# @vue-spectrum/theme-dark

Vue port baseline of `@react-spectrum/theme-dark`.

<script setup lang="ts">
import { computed, defineComponent, h } from "vue";
import { Provider, useProvider } from "@vue-spectrum/vue-spectrum";
import { theme } from "@vue-spectrum/theme-dark";

const ColorSchemeBadge = defineComponent({
  name: "ThemeDarkColorSchemeBadge",
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
    color-scheme="dark"
    scale="large"
    v-bind="{ UNSAFE_className: 'spectrum-preview-stack' }"
  >
    <p class="spectrum-preview-muted">Dark theme package consumed through Provider:</p>
    <ColorSchemeBadge />
  </Provider>
</div>

## Exports

- `theme`

## Example

```ts
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-dark";

const app = {
  components: { Provider },
  template: `
    <Provider :theme="theme" color-scheme="dark" scale="large">
      <slot />
    </Provider>
  `,
  setup() {
    return { theme };
  },
};
```

## Notes

- The baseline export uses the provider contract (`global`, `light`, `dark`, `medium`, `large`) and biases both schemes toward dark variants.
- This baseline currently maps class-name sections only; full upstream token/CSS parity remains in progress.
