# @vue-spectrum/breadcrumbs

Vue port of `@react-spectrum/breadcrumbs`.

<script setup lang="ts">
import { BreadcrumbItem, Breadcrumbs, Flex } from "@vue-spectrum/vue-spectrum";
</script>

## Preview

<div class="spectrum-preview">
  <Flex direction="column" gap="size-200" class="spectrum-preview-panel">
    <Breadcrumbs aria-label="Project breadcrumbs" showRoot>
      <BreadcrumbItem key="root">Workspace</BreadcrumbItem>
      <BreadcrumbItem key="design">Design</BreadcrumbItem>
      <BreadcrumbItem key="components">Components</BreadcrumbItem>
      <BreadcrumbItem key="breadcrumbs">Breadcrumbs</BreadcrumbItem>
      <BreadcrumbItem key="current">Current page</BreadcrumbItem>
    </Breadcrumbs>
  </Flex>
</div>

## Exports

- `Breadcrumbs`
- `BreadcrumbItem`
- `Item` (alias of `BreadcrumbItem` for v1 compatibility)

## Example

```ts
import { h } from "vue";
import { BreadcrumbItem, Breadcrumbs } from "@vue-spectrum/breadcrumbs";

const breadcrumbTree = h(
  Breadcrumbs,
  {
    showRoot: true,
    onAction: (key) => {
      console.log("Navigate to", key);
    },
  },
  {
    default: () => [
      h(BreadcrumbItem, { key: "home", href: "/" }, () => "Home"),
      h(BreadcrumbItem, { key: "docs", href: "/docs" }, () => "Docs"),
      h(BreadcrumbItem, { key: "current" }, () => "Current"),
    ],
  }
);
```

## Notes

- Uses `@vue-aria/breadcrumbs` semantics for item and navigation ARIA behavior.
- Package also exports upstream-compatible `Item` alias for React Spectrum-style composition.
- Supports automatic overflow collapsing with a menu trigger when items exceed available space.
- Supports `showRoot`, `isDisabled`, and `size` options similar to upstream intent.
- Includes dedicated `BreadcrumbItem` parity tests (defaults/current/disabled/onPress/custom slotted anchor behavior).
