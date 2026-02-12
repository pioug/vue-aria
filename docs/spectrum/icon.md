# @vue-spectrum/icon

Vue port for React Spectrum icon wrappers.

<script setup lang="ts">
import { Icon, Illustration, Provider, UIIcon } from "@vue-spectrum/vue-spectrum";

const previewTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};
</script>

## Preview

<div class="spectrum-preview">
  <Provider :theme="previewTheme" color-scheme="light" scale="medium">
    <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
      <Icon aria-label="Workflow icon">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="7" />
        </svg>
      </Icon>
      <UIIcon aria-label="UI icon">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 10h12" />
          <path d="M10 4v12" />
        </svg>
      </UIIcon>
      <Illustration aria-label="Triangle illustration">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <polygon points="10,3 17,17 3,17" />
        </svg>
      </Illustration>
    </div>
  </Provider>
</div>

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
