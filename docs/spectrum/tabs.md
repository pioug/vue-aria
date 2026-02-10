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

## Example

```ts
import { h } from "vue";
import { TabList, TabPanels, Tabs } from "@vue-spectrum/tabs";

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

## Notes

- Baseline port includes keyboard navigation, selection state (controlled/uncontrolled), and tabpanel semantics.
- Supports both automatic and manual keyboard activation behavior.
- Overflow/collapse-to-picker parity from upstream is not yet ported.
