# @vue-spectrum/tabs

Vue port baseline of `@react-spectrum/tabs`.

<script setup lang="ts">
import { TabList, TabPanels, Tabs } from "@vue-spectrum/vue-spectrum";

const items = [
  { key: "overview", title: "Overview", children: "Overview content" },
  { key: "details", title: "Details", children: "Details content" },
  { key: "history", title: "History", children: "History content" },
];
</script>

## Preview

<div class="spectrum-preview">
  <Tabs aria-label="Example tabs" :items="items">
    <TabList />
    <TabPanels />
  </Tabs>
</div>

## Exports

- `Tabs`
- `TabList`
- `TabPanels`
- `Item`

## Example

```ts
import { h } from "vue";
import { Item, TabList, TabPanels, Tabs } from "@vue-spectrum/tabs";

const items = [
  { key: "first", title: "First", children: "First panel" },
  { key: "second", title: "Second", children: "Second panel" },
];

const tabs = h(
  Tabs,
  {
    "aria-label": "Demo tabs",
    items,
    defaultSelectedKey: "first",
  },
  {
    default: () => [h(TabList), h(TabPanels)],
  }
);
```

`Item` can also be used in scoped tab slots for closer React Spectrum-style composition:

```ts
h(TabList, null, {
  default: ({ item }) => h(Item, { title: item.title }),
});
```

## Notes

- Baseline port includes keyboard navigation, selection state (controlled/uncontrolled), and tabpanel semantics.
- Supports both automatic and manual keyboard activation behavior.
- Includes `Item` compatibility helper for scoped slot composition patterns.
- Includes baseline horizontal overflow collapse-to-picker behavior via `TabList` wrapper measurement.
- Includes baseline selection-indicator positioning parity (`spectrum-Tabs-selectionIndicator`) for selected tabs, including RTL right-edge transform behavior.
- Includes collapsed-mode tabpanel and picker aria-labeling composition parity (`aria-label` + external `aria-labelledby`).
- Advanced visual/theming polish remains in progress.
