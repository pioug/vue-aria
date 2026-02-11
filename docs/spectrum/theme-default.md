# @vue-spectrum/theme-default

Vue port baseline of `@react-spectrum/theme-default`.

<script setup lang="ts">
import { computed, defineComponent, h } from "vue";
import { Provider, useProvider } from "@vue-spectrum/vue-spectrum";
import { theme } from "@vue-spectrum/theme-default";

const ColorSchemeBadge = defineComponent({
  name: "ThemeDefaultColorSchemeBadge",
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
    <p class="spectrum-preview-muted">Default theme package consumed through Provider:</p>
    <ColorSchemeBadge />
  </Provider>
</div>

## Exports

- `theme`

## Example

```ts
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme-default";

const app = {
  components: { Provider },
  template: `
    <Provider :theme="theme" color-scheme="light" scale="medium">
      <slot />
    </Provider>
  `,
  setup() {
    return { theme };
  },
};
```

## Notes

- The baseline export mirrors the provider class-map contract (`global`, `light`, `dark`, `medium`, `large`).
- This package currently reuses the migration baseline class-map values from `@vue-spectrum/provider`.
- Full parity with upstream token/CSS distribution remains in progress and is tracked under the theme package roadmap.
