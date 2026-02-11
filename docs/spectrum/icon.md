# @vue-spectrum/icon

Vue port for React Spectrum icon wrappers.

<script setup lang="ts">
import { Icon, Illustration, Provider, UIIcon } from "@vue-spectrum/vue-spectrum";
import { defineComponent, h } from "vue";

const previewTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

function renderCircleIcon() {
  return h("svg", { viewBox: "0 0 20 20" }, [
    h("circle", { cx: 10, cy: 10, r: 7 }),
  ]);
}

function renderCrossIcon() {
  return h("svg", { viewBox: "0 0 20 20" }, [
    h("path", { d: "M4 10h12" }),
    h("path", { d: "M10 4v12" }),
  ]);
}

function renderTriangleIcon() {
  return h("svg", { viewBox: "0 0 20 20" }, [
    h("polygon", { points: "10,3 17,17 3,17" }),
  ]);
}

const IconPreview = defineComponent({
  name: "IconPreview",
  setup() {
    return () =>
      h("div", { class: "spectrum-preview" }, [
        h(
          Provider,
          {
            theme: previewTheme,
            colorScheme: "light",
            scale: "medium",
          },
          {
            default: () =>
              h(
                "div",
                {
                  style: "display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;",
                },
                [
                  h(
                    Icon,
                    { ariaLabel: "Workflow icon" },
                    { default: () => [renderCircleIcon()] }
                  ),
                  h(
                    UIIcon,
                    { ariaLabel: "UI icon" },
                    { default: () => [renderCrossIcon()] }
                  ),
                  h(
                    Illustration,
                    { ariaLabel: "Triangle illustration" },
                    { default: () => [renderTriangleIcon()] }
                  ),
                ]
              ),
          }
        ),
      ]);
  },
});
</script>

## Preview

<IconPreview />

## Exports

- `Icon`
- `UIIcon`
- `Illustration`

## `Icon`

Clones a provided SVG vnode and applies Spectrum icon classes, accessibility attributes, and optional semantic color token styles.

## `UIIcon`

Clones a UI icon vnode, applies Spectrum classes, and forwards provider-derived scale (`M` or `L`) to the icon.

## `Illustration`

Clones a custom illustration vnode and applies accessible labeling semantics when labels are provided.

## Status

- Runtime behavior and upstream-equivalent test scenarios are ported, with additional class/style forwarding, slot-prop override parity (`icon` and `illustration` slots), and ARIA-label semantics edge-case coverage.
- Package is tracker-complete for the current migration phase.
