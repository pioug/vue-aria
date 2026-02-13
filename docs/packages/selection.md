# @vue-aria/selection

`@vue-aria/selection` ports the collection selection hooks from upstream `@react-aria/selection` to Vue-oriented composables.

## Implemented modules

- `DOMLayoutDelegate`
- `ListKeyboardDelegate`
- `useTypeSelect`
- `useSelectableCollection`
- `useSelectableList`
- `useSelectableItem`

## Upstream-aligned examples

The examples below mirror upstream selection stories and test scenarios.

### Single select, allow empty, select on focus

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useSelectableList, useSelectableItem, ListKeyboardDelegate } from "@vue-aria/selection";

const items = [
  { key: "paco", label: "Paco de Lucia" },
  { key: "vicente", label: "Vicente Amigo" },
  { key: "gerardo", label: "Gerardo Nunez" }
];

// collection/selection state setup omitted for brevity.
// In package usage, pair with @vue-aria/selection-state and @vue-aria/collections.
</script>
```

### Multi select, replace on press, select on focus

```vue
<script setup lang="ts">
// same structure as single select, with selectionMode="multiple"
// and selectionBehavior="replace" in the selection manager state.
</script>
```

### Touch and virtual pointer toggle behavior

`useSelectableItem` follows upstream behavior where touch/virtual interactions toggle selection in multi-select replace mode.

## Styles

This package mirrors upstream base list styles in:

- `/Users/piou/Dev/vue-aria/docs/styles/selection.css`

Import the style in docs or consuming apps as needed.

```css
@import "../styles/selection.css";
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on deeper press/long-press and virtualization parity in `useSelectableCollection`/`useSelectableItem`.
